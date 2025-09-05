# StayConnect

興味関心に基づいたマッチング機能を持つ民泊プラットフォーム

## 概要

StayConnectは、従来の民泊サービスとは異なり、ゲストと宿主の興味関心をマッチングして、より深い文化交流と体験を提供するプラットフォームです。

### 主な機能

- 🎯 **興味関心マッチング**: ユーザーの趣味や関心事に基づいた宿主推薦
- 🏠 **宿主登録・管理**: 宿泊施設の詳細情報と体験内容の登録
- 📅 **予約システム**: リアルタイムの空室確認と予約管理
- 💬 **メッセージング**: ゲストと宿主間のコミュニケーション
- ⭐ **レビューシステム**: 宿泊体験の評価とフィードバック
- 📱 **レスポンシブデザイン**: モバイルファーストのユーザーインターフェース

## 技術スタック

### バックエンド
- **Python 3.9+**
- **FastAPI**: 高性能なWeb APIフレームワーク
- **SQLAlchemy**: ORM（Object-Relational Mapping）
- **PostgreSQL**: メインデータベース
- **Redis**: キャッシュとセッション管理
- **JWT**: 認証・認可

### フロントエンド
- **Next.js 13+**: React フレームワーク
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: ユーティリティファーストCSS
- **React Hook Form**: フォーム管理
- **React Query**: サーバー状態管理

### インフラ・DevOps
- **Docker & Docker Compose**: コンテナ化
- **Nginx**: リバースプロキシ・ロードバランサー
- **GitHub Actions**: CI/CD パイプライン
- **Prometheus & Grafana**: モニタリング

## クイックスタート

### 前提条件

- Docker 20.10+
- Docker Compose 2.0+
- Git

### 開発環境のセットアップ

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd stayconnect
   ```

2. **環境変数の設定**
   ```bash
   cp .env.example .env
   # .env ファイルを編集して必要な値を設定
   ```

3. **フロントエンドのセットアップ**
   ```bash
   ./scripts/setup-frontend.sh
   ```

4. **アプリケーションの起動**
   ```bash
   docker-compose up -d
   ```

5. **アクセス確認**
   - フロントエンド: http://localhost:3000
   - バックエンドAPI: http://localhost:8000
   - API ドキュメント: http://localhost:8000/docs

### 本番環境デプロイ

詳細は [DEPLOYMENT.md](DEPLOYMENT.md) を参照してください。

```bash
# 本番環境用デプロイスクリプト
./scripts/deploy.sh production
```

## 開発

### ディレクトリ構造

```
stayconnect/
├── backend/                 # FastAPI バックエンド
│   ├── models/             # データベースモデル
│   ├── routers/            # APIルーター
│   ├── services/           # ビジネスロジック
│   ├── database/           # データベース設定
│   └── tests/              # テストファイル
├── frontend/               # Next.js フロントエンド
│   ├── pages/              # ページコンポーネント
│   ├── src/
│   │   ├── components/     # 再利用可能コンポーネント
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # カスタムフック
│   │   ├── lib/            # ユーティリティ
│   │   └── types/          # TypeScript型定義
│   └── cypress/            # E2Eテスト
├── nginx/                  # Nginx設定
├── monitoring/             # モニタリング設定
├── scripts/                # デプロイ・運用スクリプト
└── docs/                   # ドキュメント
```

### 開発ワークフロー

1. **機能ブランチの作成**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **開発環境での作業**
   ```bash
   # バックエンド開発
   cd backend
   python -m uvicorn main:app --reload
   
   # フロントエンド開発
   cd frontend
   npm run dev
   ```

3. **テストの実行**
   ```bash
   # 全テスト実行
   ./scripts/run-tests.sh
   
   # バックエンドのみ
   cd backend && python -m pytest
   
   # フロントエンドのみ
   cd frontend && npm test
   ```

4. **コードの品質チェック**
   ```bash
   # Python (バックエンド)
   cd backend
   black .
   flake8 .
   mypy .
   
   # TypeScript (フロントエンド)
   cd frontend
   npm run lint
   npm run type-check
   ```

## テスト

### テストの種類

- **単体テスト**: 個別の関数・コンポーネントのテスト
- **統合テスト**: API エンドポイントのテスト
- **E2Eテスト**: ユーザーフローの完全なテスト

### テスト実行

```bash
# 全テスト実行
./scripts/run-tests.sh

# E2Eテストも含める
./scripts/run-tests.sh --e2e

# カバレッジレポート
# バックエンド: backend/htmlcov/index.html
# フロントエンド: frontend/coverage/lcov-report/index.html
```

詳細は [TESTING.md](TESTING.md) を参照してください。

## API ドキュメント

バックエンドAPIの詳細なドキュメントは、開発サーバー起動後に以下のURLで確認できます：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要なエンドポイント

- `POST /auth/register` - ユーザー登録
- `POST /auth/login` - ログイン
- `GET /hosts/search` - 宿主検索
- `POST /bookings/` - 予約作成
- `GET /matching/hosts` - マッチング宿主取得

## 貢献

プロジェクトへの貢献を歓迎します！

### 貢献の手順

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約

- **Python**: PEP 8 に準拠、Black でフォーマット
- **TypeScript**: ESLint + Prettier の設定に従う
- **コミットメッセージ**: [Conventional Commits](https://www.conventionalcommits.org/) 形式

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## サポート

### ドキュメント

- [デプロイメントガイド](DEPLOYMENT.md)
- [テストガイド](TESTING.md)
- [API仕様書](http://localhost:8000/docs)

### 問題報告

バグや機能要望は [GitHub Issues](https://github.com/your-username/stayconnect/issues) で報告してください。

### コミュニティ

- [Discussions](https://github.com/your-username/stayconnect/discussions) - 質問や議論
- [Wiki](https://github.com/your-username/stayconnect/wiki) - 追加ドキュメント

## ロードマップ

### v1.0 (現在)
- ✅ 基本的なマッチング機能
- ✅ 予約システム
- ✅ メッセージング
- ✅ レスポンシブデザイン

### v1.1 (予定)
- 🔄 決済システム統合
- 🔄 プッシュ通知
- 🔄 多言語対応
- 🔄 高度な検索フィルター

### v2.0 (将来)
- 📋 AIベースのレコメンデーション
- 📋 VR/AR体験プレビュー
- 📋 ブロックチェーン決済
- 📋 IoT連携

---

**StayConnect** - より深い文化交流を通じた新しい旅行体験を提供します。