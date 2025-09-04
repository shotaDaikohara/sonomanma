#!/bin/bash

# ハッカソン用 AI テキスト生成モックアップ
# 最速起動スクリプト

echo "🚀 ハッカソン AI テキスト生成システム 起動中..."

# Docker と Docker Compose の確認
if ! command -v docker &> /dev/null; then
    echo "❌ Docker がインストールされていません"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose がインストールされていません"
    exit 1
fi

# GPU 使用可能性をチェック
if command -v nvidia-smi &> /dev/null && nvidia-smi &> /dev/null; then
    echo "✅ GPU が検出されました。GPU版で起動します"
    COMPOSE_FILE="docker-compose.yml"
else
    echo "⚠️  GPU が検出されませんでした。CPU版で起動します"
    COMPOSE_FILE="docker-compose.cpu.yml"
fi

# 既存のコンテナを停止・削除
echo "🧹 既存のコンテナをクリーンアップ中..."
docker-compose -f $COMPOSE_FILE down 2>/dev/null || docker compose -f $COMPOSE_FILE down 2>/dev/null

# システム起動
echo "🔧 システムを起動中..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f $COMPOSE_FILE up --build -d
else
    docker compose -f $COMPOSE_FILE up --build -d
fi

# 起動確認
echo "⏳ サービスの起動を待機中..."
sleep 10

# ヘルスチェック
echo "🔍 サービスのヘルスチェック..."

# Backend確認
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend (FastAPI): http://localhost:8000"
else
    echo "❌ Backend が起動していません"
fi

# Frontend確認
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: http://localhost:3000"
else
    echo "❌ Frontend が起動していません"
fi

# vLLM確認
if curl -s http://localhost:8001/v1/models > /dev/null; then
    echo "✅ vLLM Server: http://localhost:8001"
else
    echo "⚠️  vLLM Server が起動中です (時間がかかる場合があります)"
fi

echo ""
echo "🎉 システム起動完了！"
echo "📱 フロントエンド: http://localhost:3000"
echo "🔧 API: http://localhost:8000"
echo "🤖 vLLM: http://localhost:8001"
echo ""
echo "💡 使用方法:"
echo "   1. ブラウザで http://localhost:3000 を開く"
echo "   2. プロンプトを入力して「生成開始」をクリック"
echo "   3. AI が応答を生成します"
echo ""
echo "🛑 停止するには: ./stop.sh を実行"
