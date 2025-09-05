#!/bin/bash

# StayConnect デプロイメントスクリプト

set -e

# 設定
ENVIRONMENT=${1:-production}
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

echo "🚀 StayConnect アプリケーションをデプロイします..."
echo "環境: $ENVIRONMENT"

# 環境変数の確認
if [ ! -f ".env" ]; then
    echo "❌ .env ファイルが見つかりません"
    echo "💡 .env.example をコピーして .env を作成してください"
    exit 1
fi

# 必要なディレクトリを作成
mkdir -p logs uploads backups

# フロントエンドのセットアップ
echo "🎨 フロントエンドをセットアップ中..."
./scripts/setup-frontend.sh

# バックアップ（本番環境の場合）
if [ "$ENVIRONMENT" = "production" ]; then
    echo "📦 データベースをバックアップ中..."
    mkdir -p "$BACKUP_DIR"
    
    # PostgreSQLバックアップ
    docker-compose exec -T postgres pg_dump -U stayconnect stayconnect > "$BACKUP_DIR/database.sql"
    
    # アップロードファイルのバックアップ
    cp -r uploads "$BACKUP_DIR/" 2>/dev/null || true
    
    echo "✅ バックアップ完了: $BACKUP_DIR"
fi

# イメージのビルド
echo "🔨 Dockerイメージをビルド中..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.prod.yml build --no-cache
else
    docker-compose build --no-cache
fi

# 既存のコンテナを停止
echo "⏹️ 既存のコンテナを停止中..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.prod.yml down
else
    docker-compose down
fi

# データベースマイグレーション
echo "🗄️ データベースマイグレーションを実行中..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.prod.yml up -d postgres redis
    sleep 10
    docker-compose -f docker-compose.prod.yml run --rm backend python -c "
from database import engine, Base
from models import *
Base.metadata.create_all(bind=engine)
print('Database migration completed')
"
else
    docker-compose up -d postgres redis
    sleep 10
    docker-compose run --rm backend python -c "
from database import engine, Base
from models import *
Base.metadata.create_all(bind=engine)
print('Database migration completed')
"
fi

# アプリケーションを起動
echo "🚀 アプリケーションを起動中..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.prod.yml up -d
else
    docker-compose up -d
fi

# ヘルスチェック
echo "🏥 ヘルスチェックを実行中..."
sleep 30

# バックエンドのヘルスチェック
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ バックエンド: 正常"
else
    echo "❌ バックエンド: 異常"
    exit 1
fi

# フロントエンドのヘルスチェック
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ フロントエンド: 正常"
else
    echo "❌ フロントエンド: 異常"
    exit 1
fi

# Nginxのヘルスチェック
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Nginx: 正常"
else
    echo "❌ Nginx: 異常"
    exit 1
fi

echo "🎉 デプロイメント完了！"
echo "📊 アプリケーション状態:"
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.prod.yml ps
else
    docker-compose ps
fi

echo ""
echo "🌐 アクセス URL:"
echo "  - フロントエンド: http://localhost"
echo "  - API: http://localhost/api"
echo "  - API ドキュメント: http://localhost/api/docs"

# ログの確認方法を表示
echo ""
echo "📋 ログ確認方法:"
echo "  - すべてのログ: docker-compose logs -f"
echo "  - バックエンドログ: docker-compose logs -f backend"
echo "  - フロントエンドログ: docker-compose logs -f frontend"
echo "  - Nginxログ: docker-compose logs -f nginx"