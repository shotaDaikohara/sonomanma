# 非同期ジョブ設計

目的: 長時間実行する AI 推論やバッチ処理を安定して処理するための非同期ジョブ設計書。

アーキテクチャ
- FastAPI (backend) -> Redis (RQ / Celery / Bull) -> Worker (uvicorn / python)
- Redis はジョブキュー兼トレース保持に利用
- 代替: Redis が使えない環境では JSONL をファイルに append し、別プロセスがポーリングして処理

ジョブフロー
1. クライアント -> POST /api/ai/generate/async
2. API はジョブを Redis に enqueue し、request_id を返す
3. Worker がジョブを取得して vLLM/Lite にリクエストを送る
4. Worker は進捗を Redis ハッシュに記録、最終結果はストレージに保存（S3 か ./uploads/ai_results）
5. Worker 完了後、Webhook 登録があれば通知、またはクライアントが /api/ai/result/{request_id} を poll する

キューの選択
- 推奨: RQ（Python RQ）または Celery + Redis
- 理由: セットアップが容易で監視・再試行があるため

データモデル（Redis）
- key: ai:job:{request_id} -> hash {status, progress, worker_id, started_at, finished_at, result_path}
- list: ai:queue -> job payload
- TTL を設定し、古いジョブ情報を自動削除

再試行・失敗対策
- 再試行: エクスポネンシャルバックオフ、最大 3 回
- 永続化失敗: result をローカルに退避し admin に通知
- 永続的に失敗するジョブは dead-letter キューへ移動

スケーリング
- Worker はコンテナ化し、水平スケーリング可能
- GPU を使う Worker と CPU のみの Worker をタグで分ける（例: ai:worker:gpu）
- GPU ワーカーは heavy model inference のみを処理するルーティングを行う

監視・メトリクス
- Prometheus メトリクスを Worker に組み込み（job_count, success_count, failure_count, avg_latency）
- ログは JSON 形式で stdout に吐き、Fluentd/Logstash に集約

セキュリティ
- Worker と API 間の通信は内部ネットワークで行う。サービス間 API キーを導入して認証を強化
- S3 へのアップロードには署名付き URL を使用する

運用コマンド（例）
- Worker 起動:
  python -m worker --queue ai

