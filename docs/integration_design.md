# 統合設計ドキュメント（ハッカソン統合用）

目的: AIチーム（完成）をバックエンド／フロントエンドへ安全かつ迅速にマージするための設計と手順をまとめる。

要約 (優先順位)
- 1. 安全な認証連携（JWT）とユーザー同定の統一
- 2. API スキーマ整合（バックエンド ↔ フロントエンド）
- 3. AI機能のエンドポイント統合（非同期/同期の切替）
- 4. デプロイ/テスト自動化（CI）とロールアウト手順

チーム分担
- フロントエンド: UI/UX 実装・API 呼び出し・エラーハンドリング
- バックエンド: ルーター統合・DB マイグレーション・認証整備
- AIチーム: 既存モデルの API 仕様書化・フェイルオーバー要件提供

主要設計
1) 認証
- アクセストークンは Authorization: Bearer <token>（JWT）で統一。
- JWT の sub は user_id に固定。AI/フロントは email を期待しないこと。
- refresh token は httpOnly cookie（/auth/login）で運用。バックエンドは既存実装を利用。

2) API 契約（短縮版）
- POST /api/auth/login -> { access_token, token_type, user }
- GET /users/me -> UserResponse
- POST /api/ai/generate -> { request_id, status, result? }
  - 推奨: 同期応答が短い場合は 200 に結果返却。長い処理は 202 + poll(/api/ai/result/{request_id})
- POST /api/bookings -> BookingResponse (host_id, dates...)
- POST /users/upload-avatar -> multipart/form-data

3) AI 統合パターン
- 短いプロンプト（即時応答）: フロントが直接 /api/ai/generate（同期）を叩く
- 長い処理 / トレースが要る場合: 非同期ジョブ -> キュー（Redis 推奨）に enqueue。結果は webhook/Poll で取得
- フェイルオーバー: vLLM が落ちたら Lite Gateway のモードへフォールバック（既存 repo の lite_gateway を使用）

4) DB / マイグレーション
- 変更がある場合は Alembic または simple migration スクリプトを作成（backend/database/init_db.py を参照）
- マージ前にローカルで migrate を実行: python -c "from database.init_db import create_tables; create_tables()"

5) 環境変数（必須）
- SECRET_KEY, DATABASE_URL, REDIS_URL, HF_TOKEN (必要時)

運用・CI
- テスト: backend/tests を CI で実行（pytest -v --cov）
- PR マージ順序:
  1. バックエンド（API 変更）: schema / openapi を PR に含める
  2. AI（完成済だが docs とサンプルを追加）
  3. フロントエンド（UI）: API 呼び出しを最新の contract に合わせる
- 必須チェック: E2E または簡易的な統合テストを 1 回実行（Cypress または curl スクリプト）

リスクと対処
- JWT sub の不一致: トークン発行箇所（AI/バックエンド）を user_id に統一
- DB ロック（SQLite）: CI と同時実行がある場合は Postgres か :memory: を利用
- 大きなモデルレスポンス: フロントはストリーミング/分割受信をサポートすることを検討

短期ロードマップ（残り期間）
- Day1: API スペック確定、バックエンド PR 作成
- Day2: バックエンド実装 & テスト、AI docs を /docs に追加
- Day3: フロント実装、統合 E2E テスト、バグ修正
- Day4: 最終検証・デプロイ準備

付録: 参考コマンド
- ローカルサーバ起動 (backend):
  source .venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000
- テスト実行:
  cd backend && pytest tests/ -q

