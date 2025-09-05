#!/bin/bash

# フロントエンドのセットアップスクリプト

echo "🎨 フロントエンドの依存関係をセットアップ中..."

cd frontend

# 既存のnode_modulesとpackage-lock.jsonを削除
echo "🧹 既存の依存関係をクリーンアップ中..."
rm -rf node_modules package-lock.json

# 依存関係を再インストール
echo "📦 依存関係をインストール中..."
npm install --legacy-peer-deps

echo "✅ フロントエンドのセットアップ完了"