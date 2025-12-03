# StayConnect
a
興味関心に基づいたマッチング機能を持つ民泊プラットフォーム

## セットアップ

### 前提条件

- Docker 20.10+
- Docker Compose 2.0+

### 起動手順

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd stayconnect
   ```

2. **環境変数の設定**
   ```bash
   cp .env.example .env
   ```

3. **アプリケーションの起動**
   ```bash
   docker-compose up -d
   ```

4. **アクセス**
   - フロントエンド: http://localhost:3000
   - バックエンドAPI: http://localhost:8000
   - API ドキュメント: http://localhost:8000/docs

## 技術スタック

- **バックエンド**: FastAPI + PostgreSQL + Redis
- **フロントエンド**: Next.js + TypeScript + Tailwind CSS
- **インフラ**: Docker + Nginx