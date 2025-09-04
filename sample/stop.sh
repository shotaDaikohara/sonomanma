#!/bin/bash

echo "🛑 ハッカソン AI テキスト生成システム 停止中..."

# 全てのコンテナを停止
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.yml down 2>/dev/null
    docker-compose -f docker-compose.cpu.yml down 2>/dev/null
else
    docker compose -f docker-compose.yml down 2>/dev/null
    docker compose -f docker-compose.cpu.yml down 2>/dev/null
fi

echo "✅ システムを停止しました"
