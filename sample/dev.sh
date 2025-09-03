#!/bin/bash

# ローカル開発用スクリプト
# Docker を使わずに直接起動（開発時用）

echo "🔧 開発モードで起動中..."

# Python 仮想環境の確認
if [ ! -d "backend/venv" ]; then
    echo "📦 Python仮想環境を作成中..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# バックエンド起動 (バックグラウンド)
echo "🔧 FastAPI サーバー起動中..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# フロントエンド用シンプルサーバー起動
echo "🌐 フロントエンドサーバー起動中..."
cd frontend
python3 -m http.server 3000 &
FRONTEND_PID=$!
cd ..

echo "✅ 開発サーバー起動完了！"
echo "📱 フロントエンド: http://localhost:3000"
echo "🔧 API: http://localhost:8000"
echo ""
echo "🛑 停止するには Ctrl+C"

# プロセス終了時のクリーンアップ
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# 待機
wait
