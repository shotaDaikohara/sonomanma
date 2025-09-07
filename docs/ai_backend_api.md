# AI → バックエンド API 詳細

目的: AIチームが提供するモデル・ゲートウェイ（vLLM / Lite Gateway）をバックエンドに安全かつ再現可能に統合するための API 仕様書。

認証
- Authorization: Bearer <access_token>（JWT, sub=user_id）
- 一部管理用エンドポイントはサービス間で API キー（HTTP ヘッダ: X-Service-Key）を併用

エンドポイント一覧

1) 同期生成（短いプロンプト向け）
- POST /api/ai/generate
  - 説明: 短時間で応答が返る処理。フロントは直接叩く想定。
  - リクエスト (application/json):
    - model: string (例: "gpt-oss-20b")
    - messages: [{ role: "user"|"system"|"assistant", content: string }]
    - max_tokens?: int
    - temperature?: float
    - stream?: boolean （将来的にストリーミング対応）
  - レスポンス 200:
    - { request_id: string, status: "completed", result: { text: string, tokens: int }, meta: {...} }
  - エラー 4xx/5xx: 標準 JSON エラー { detail: "..." }

2) 非同期生成（長時間処理／トレース必須）
- POST /api/ai/generate/async
  - 説明: 長時間や重い処理をキューに入れる。即時 202 を返す。
  - リクエスト (application/json): 同期と同じフィールド
  - レスポンス 202:
    - { request_id: string, status: "queued", eta_seconds?: int }
- GET /api/ai/result/{request_id}
  - 説明: ポーリング用。完了時は結果を返す。
  - レスポンス 200 (completed): { request_id, status: "completed", result: { text, output_path? }, finished_at }
  - レスポンス 200 (in_progress): { request_id, status: "in_progress", progress?: float }
  - 404: request_id 不正

3) Webhook（オプション）
- POST /api/ai/webhook/register
  - リクエスト: { url: string, secret?: string }
- 仕組み: ジョブ完了時に署名付き POST を行う。

トレース / ロギング
- リクエストごとに trace_id を生成しログに含める。
- Trace は Redis リストまたは JSONL ファイルへ書き出し（lite_gateway と同様）。

エラー設計
- 再試行ポリシー: 一時的エラーは指数バックオフで最大 3 回
- OOM / リソース不足: 503 を返しフロントはフォールバック UI を表示

データ保持
- 非同期結果は S3 または ./uploads/ai_results に保存（大きな出力用）
- 結果の TTL: デフォルト 7 日（環境変数 AI_RESULT_TTL）

注意点
- レスポンスが大きい場合はストリーミング or file-reference を利用
- 同期エンドポイントはタイムアウトを短めに設定（例: 30s）

サンプル cURL（同期）

curl -X POST http://localhost:8000/api/ai/generate \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-oss-20b","messages":[{"role":"user","content":"こんにちは"}],"max_tokens":64}'

サンプル cURL（非同期）

curl -X POST http://localhost:8000/api/ai/generate/async \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-oss-20b","messages":[{"role":"user","content":"大きな仕事を頼みます"}]}'

