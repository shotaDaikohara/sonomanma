from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import asyncio
import logging
from typing import Optional
import os
import re

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Generate API", version="1.0.0")

# CORS設定（フロントエンドからのリクエストを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に制限する
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# リクエスト/レスポンスモデル
class GenerateRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None  # システムプロンプトをオプションで指定可能
    max_tokens: Optional[int] = 100

class GenerateResponse(BaseModel):
    text: str
    tokens: int

# vLLM サーバーの設定
# VLLM_URL = os.getenv("VLLM_URL", "http://160.251.239.162:8001")  # default: internal docker service or override with env var
VLLM_URL = os.getenv("VLLM_URL", "http://160.251.238.251:8001")  # H100-2: internal docker service or override with env var
# VLLM_URL = os.getenv("VLLM_URL", "http://160.251.238.189:8001")  # H100-2: internal docker service or override with env var

# デフォルトのシステムプロンプト（大阪のおばちゃんペルソナ）
DEFAULT_SYSTEM_PROMPT = os.getenv(
    "DEFAULT_SYSTEM_PROMPT",
    "あなたは親切でおせっかいな大阪のおばちゃんです。学生に対して温かい言葉を話すように心がけて下さい。"
)

# 厳格リトライ時に使うシステムプロンプト（JSON のみを返すことを強制）
STRICT_JSON_SYSTEM_PROMPT = (
    "厳密な指示: 次のユーザープロンプトに対して、余計な説明を一切加えず、"
    "かならず有効なJSONオブジェクトだけを返してください。戻り値は必ずトップレベルが { で始まる JSON で、スキーマに従ってください。"
)


def looks_like_schema_explanation(text: Optional[str]) -> bool:
    """モデルがスキーマ説明のみを返している（JSON を返していない）かを判定する。
    単純なヒューリスティック: JSON の波括弧が含まれない、かつ "output" "schema" "must" などの語を含む場合。
    """
    if not text or not isinstance(text, str):
        return False
    # 既にJSONが含まれていれば説明ではない
    if '{' in text and '}' in text:
        return False
    low = text.lower()
    keywords = ['output json', 'output only', 'must follow', 'must follow schema', 'must follow the schema', 'we need to output', 'output a json', 'schema']
    return any(k in low for k in keywords)


@app.get("/")
async def root():
    return {"message": "AI Generate API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/v1/ai/generate", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest):
    try:
        logger.info(f"Received request: {request.prompt[:50]}...")
        
        # vLLMへのリクエスト
        vllm_request = {
            # keep a non-chat `prompt` for endpoints that expect it; messages will be preferred when present
            "prompt": request.prompt,
            "max_tokens": request.max_tokens,
            # deterministic default
            "temperature": 0.0,
            "stream": False
        }
        
        # system_prompt を確実に決定（明示されていればそれを、なければデフォルト）
        system_prompt_value = request.system_prompt if getattr(request, 'system_prompt', None) else DEFAULT_SYSTEM_PROMPT

        # 常に messages ベースも作成し、チャット互換の upstream に渡せるようにする
        if system_prompt_value:
            vllm_request["messages"] = [
                {"role": "system", "content": system_prompt_value},
                {"role": "user", "content": request.prompt}
            ]

        # エンドポイント選択
        if "messages" in vllm_request:
            endpoint = "/v1/chat/completions"
            payload = {k: v for k, v in vllm_request.items() if k != "prompt"}
        else:
            endpoint = "/v1/completions"
            payload = vllm_request

        timeout = httpx.Timeout(60.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.post(
                    f"{VLLM_URL}{endpoint}",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                vllm_response = response.json()
                logger.debug(f"vLLM response: {vllm_response}")

                def extract_generated_text(vresp):
                    generated_text = None
                    tokens_used = 0
                    if isinstance(vresp, dict):
                        choices = vresp.get("choices")
                        if choices and isinstance(choices, list) and len(choices) > 0:
                            first = choices[0]
                            if isinstance(first, dict):
                                msg = first.get("message") or first.get("delta")
                                if isinstance(msg, dict):
                                    generated_text = msg.get("content") or msg.get("text")
                                if not generated_text:
                                    generated_text = first.get("text") or first.get("output") or first.get("content")

                        usage = vresp.get("usage") or vresp.get("meta") or {}
                        if isinstance(usage, dict):
                            tokens_used = usage.get("total_tokens") or usage.get("tokens") or 0

                    elif isinstance(vresp, list) and len(vresp) > 0:
                        first = vresp[0]
                        if isinstance(first, dict):
                            generated_text = first.get("text") or first.get("output")

                    if not generated_text:
                        if isinstance(vresp, dict) and "text" in vresp:
                            generated_text = vresp.get("text")
                        else:
                            generated_text = str(vresp)

                    return generated_text, int(tokens_used or 0)

                generated_text, tokens_used = extract_generated_text(vllm_response)

                # If model returned a schema-description rather than JSON, retry once with strict system prompt
                if looks_like_schema_explanation(generated_text):
                    logger.info("Detected explanation-only response; retrying once with strict JSON system prompt")
                    strict_payload = payload.copy()
                    # replace system message content with stricter one
                    if 'messages' in strict_payload and isinstance(strict_payload['messages'], list):
                        strict_payload['messages'] = [
                            {"role": "system", "content": STRICT_JSON_SYSTEM_PROMPT},
                            {"role": "user", "content": request.prompt}
                        ]
                    else:
                        # ensure messages present
                        strict_payload['messages'] = [
                            {"role": "system", "content": STRICT_JSON_SYSTEM_PROMPT},
                            {"role": "user", "content": request.prompt}
                        ]
                    # set temperature to 0 for determinism
                    strict_payload['temperature'] = 0.0
                    try:
                        retry_resp = await client.post(f"{VLLM_URL}{endpoint}", json=strict_payload, headers={"Content-Type": "application/json"})
                        retry_resp.raise_for_status()
                        retry_v = retry_resp.json()
                        logger.debug(f"Retry vLLM response: {retry_v}")
                        gen2, tokens2 = extract_generated_text(retry_v)
                        if gen2:
                            generated_text = gen2
                            tokens_used = tokens2 or tokens_used
                    except Exception as e:
                        logger.warning(f"Retry failed: {e}")

                if generated_text is None:
                    logger.error("vLLM returned unexpected response format")
                    raise HTTPException(status_code=502, detail="Upstream vLLM returned unexpected response format")

                logger.info(f"Generated text length: {len(generated_text)}")
                return GenerateResponse(
                    text=generated_text,
                    tokens=int(tokens_used or 0)
                )

            except httpx.ConnectError:
                logger.warning("vLLM server not available, returning mock response")
                mock_text = f"[モック回答] あなたの質問「{request.prompt}」について、AI推論システムが応答します。これはプロトタイプでのモック回答です。"
                return GenerateResponse(
                    text=mock_text,
                    tokens=len(mock_text.split())
                )
                
    except httpx.TimeoutException:
        logger.error("Request timeout")
        raise HTTPException(status_code=408, detail="Request timeout")
    except Exception as e:
        logger.error(f"Error during generation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
