#!/bin/bash

# テスト実行スクリプト

set -e

echo "🧪 StayConnect アプリケーションのテストを実行します..."

# バックエンドテスト
echo "📡 バックエンドテストを実行中..."
cd backend
python -m pytest tests/ -v --cov=. --cov-report=term-missing
echo "✅ バックエンドテスト完了"

# フロントエンドテスト
echo "🎨 フロントエンドテストを実行中..."
cd ../frontend
npm test -- --coverage --watchAll=false
echo "✅ フロントエンドテスト完了"

# E2Eテスト（オプション）
if [ "$1" = "--e2e" ]; then
    echo "🔄 E2Eテストを実行中..."
    npm run cy:run
    echo "✅ E2Eテスト完了"
fi

echo "🎉 すべてのテストが完了しました！"