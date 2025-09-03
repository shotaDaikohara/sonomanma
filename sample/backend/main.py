from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import asyncio
import logging
from typing import Optional
import os

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
VLLM_URL = os.getenv("VLLM_URL", "http://160.251.239.162:8001")  # default: internal docker service or override with env var

# デフォルトのシステムプロンプト（大阪のおばちゃんペルソナ）
DEFAULT_SYSTEM_PROMPT = os.getenv(
    "DEFAULT_SYSTEM_PROMPT",
    "あなたは親切でおせっかいな大阪のおばちゃんです。学生に対して温かい言葉を話すように心がけて下さい。"
)

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
        # vLLM に渡すペイロードを組み立てる。
        # system_prompt が指定された場合は messages 形式も併せて送る（互換性のため prompt も保持）。
        vllm_request = {
            "prompt": request.prompt,
            "max_tokens": request.max_tokens,
            "temperature": 0.7,
            "stream": False
        }
        
        if getattr(request, "system_prompt", None):
            # 多くのモデルはチャット形式(messages)をサポートするため、両方を送る
            system_prompt_value = request.system_prompt
        else:
            # リクエストで明示されていない場合はデフォルトのシステムプロンプトを使用
            system_prompt_value = DEFAULT_SYSTEM_PROMPT

        if system_prompt_value:
            vllm_request["messages"] = [
                {"role": "system", "content": system_prompt_value},
                {"role": "user", "content": request.prompt}
            ]

        # タイムアウト60秒
        timeout = httpx.Timeout(60.0)
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.post(
                    f"{VLLM_URL}/v1/completions",
                    json=vllm_request,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                
                vllm_response = response.json()
                logger.debug(f"vLLM response: {vllm_response}")
                
                # 柔軟にレスポンスをパースする
                generated_text = None
                tokens_used = 0

                if isinstance(vllm_response, dict):
                    # OpenAI-like shape
                    choices = vllm_response.get("choices")
                    if choices and isinstance(choices, list) and len(choices) > 0:
                        first = choices[0]
                        if isinstance(first, dict):
                            generated_text = first.get("text") or first.get("message") or first.get("output")

                    # usage fallback
                    usage = vllm_response.get("usage") or vllm_response.get("meta") or {}
                    if isinstance(usage, dict):
                        tokens_used = usage.get("total_tokens") or usage.get("tokens") or 0

                elif isinstance(vllm_response, list) and len(vllm_response) > 0:
                    first = vllm_response[0]
                    if isinstance(first, dict):
                        generated_text = first.get("text") or first.get("output")

                # 最後のフォールバック
                if not generated_text:
                    # try top-level text
                    if isinstance(vllm_response, dict) and "text" in vllm_response:
                        generated_text = vllm_response.get("text")
                    else:
                        generated_text = str(vllm_response)

                # バリデーション: text が空なら upstream の形式が想定外
                if generated_text is None:
                    logger.error("vLLM returned unexpected response format")
                    raise HTTPException(status_code=502, detail="Upstream vLLM returned unexpected response format")

                logger.info(f"Generated text length: {len(generated_text)}")
                
                return GenerateResponse(
                    text=generated_text,
                    tokens=int(tokens_used or 0)
                )
                
            except httpx.ConnectError:
                # vLLMサーバーに接続できない場合はモックレスポンス
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
