# 🚀 AI テキスト生成システム - ハッカソンモックアップ

短期間で動作するプロトタイプを最速で構築するためのシンプルなAIテキスト生成システムです。

## 目標
- 1コマンドで動くデモを全員が再現できるようにする
- ローカル開発（Dockerなし）でも動かせる手順を提供する

---

## 必要環境
- Docker & Docker Compose（または Docker Engine の `docker compose`）
- または Python 3.11+（開発モードを使う場合）
- ブラウザ

---

## 1) 最速（推奨）: Docker で起動
※ GPU があるときは GPU 用設定を自動で選択、なければ CPU フォールバックを使用します。

1. リポジトリをクローン / 作業ディレクトリへ移動
   ```bash
   git clone <repo-url>
   cd project_sonomanma
   ```

2. 起動（1コマンド）
   ```bash
   ./start.sh
   ```

3. ブラウザで確認
   - フロントエンド: http://localhost:3000
   - API: http://localhost:8000
   - vLLM（内部）: http://localhost:8001

4. 停止
   ```bash
   ./stop.sh
   ```

---

## 2) 開発モード（Docker 無し、ローカルで素早く編集する場合）
1. 依存をインストールして起動（スクリプトを使用）
   ```bash
   ./dev.sh
   ```
   - `dev.sh` は backend の仮想環境を作成し、FastAPI と簡易 HTTP サーバー（フロント）を起動します。
   - 停止は Ctrl+C

2. 手動で起動したい場合
   - Backend:
     ```bash
     cd backend
     python3 -m venv venv
     source venv/bin/activate
     pip install -r requirements.txt
     uvicorn main:app --reload --host 0.0.0.0 --port 8000
     ```
   - Frontend:
     ```bash
     cd frontend
     python3 -m http.server 3000
     ```

---

## 環境変数（上書き可能）
- VLLM_URL: vLLM のエンドポイント（デフォルトはバックエンド内で設定）
- DEFAULT_SYSTEM_PROMPT: デフォルトのシステムプロンプト（大阪のおばちゃんペルソナ）

ローカル開発時に上書きする例:
```bash
export VLLM_URL="http://your-vllm-host:8001"
export DEFAULT_SYSTEM_PROMPT="あなたは親切でおせっかいな大阪のおばちゃんです。学生に対して温かい言葉を話すように心がけて下さい。"
./dev.sh
```

Docker で渡す場合は `docker-compose.yml` の `backend` サービスに `environment:` を追加してください（例）:
```yaml
services:
  backend:
    build: ./backend
    environment:
      - VLLM_URL=http://your-vllm-host:8001
      - DEFAULT_SYSTEM_PROMPT=あなたは親切でおせっかいな大阪のおばちゃんです...
```

---

## API 使い方（例）
- POST /api/v1/ai/generate
  - request body:
    - prompt: string (必須)
    - max_tokens: int (任意)
    - system_prompt: string (任意、指定がなければバックエンドのデフォルトが使われます)

curl 例（system_prompt を指定）:
```bash
curl -X POST "http://localhost:8000/api/v1/ai/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "あなたは親切でおせっかいな大阪のおばちゃんです。学生に対して温かい言葉を話すように心がけて下さい。",
    "prompt": "明日の試験、どうやったら上手くできる？",
    "max_tokens": 120
  }'
```

レスポンス例:
```json
{ "text": "〜（生成テキスト）〜", "tokens": 123 }
```

---

## トラブルシューティング
- Docker コンテナの状態確認
  ```bash
  docker ps
  docker-compose ps  # または docker compose ps
  ```
- ログ確認
  ```bash
  docker logs <container_name_or_id>
  # 例: docker logs project_sonomanma_backend_1
  ```
- FastAPI のヘルスチェック
  ```bash
  curl http://localhost:8000/health
  ```
- vLLM が接続できない場合、バックエンドはモック応答を返します。接続先 URL とポートを確認してください。

---

## 開発のヒント
- `frontend/index.html` を編集して UI を拡張
- `backend/main.py` にエンドポイントを追加して機能を増やす
- 本番化する場合は CORS の制限、認証、永続化（Redis/Postgres）を追加してください

---

プロジェクト構成の簡単な一覧（再掲）:

```
project_sonomanma/
├── architecture.md
├── docker-compose.yml
├── docker-compose.cpu.yml
├── start.sh
├── stop.sh
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
└── frontend/
    └── index.html
```

---
