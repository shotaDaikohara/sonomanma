# StayConnect デプロイメントガイド

このドキュメントでは、StayConnectアプリケーションのデプロイメント手順について説明します。

## 前提条件

### システム要件
- Docker 20.10+
- Docker Compose 2.0+
- 最小4GB RAM、2CPU
- 20GB以上の空きディスク容量

### 必要なポート
- 80: HTTP (Nginx)
- 443: HTTPS (Nginx)
- 3000: フロントエンド (開発時のみ)
- 8000: バックエンドAPI (開発時のみ)
- 5432: PostgreSQL (内部通信)
- 6379: Redis (内部通信)

## 環境設定

### 1. 環境変数の設定

```bash
# .env.example をコピーして設定
cp .env.example .env

# 必要な値を設定
nano .env
```

### 2. 必須環境変数

```bash
# データベース
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://stayconnect:your_secure_password_here@postgres:5432/stayconnect

# JWT認証
SECRET_KEY=your_very_secure_secret_key_here_at_least_32_characters
NEXTAUTH_SECRET=your_nextauth_secret_here

# 本番環境URL
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

## デプロイメント手順

### 開発環境

```bash
# リポジトリをクローン
git clone <repository-url>
cd stayconnect

# 環境変数を設定
cp .env.example .env
# .env ファイルを編集

# アプリケーションを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

### 本番環境

```bash
# 本番用設定でデプロイ
./scripts/deploy.sh production

# または手動で
docker-compose -f docker-compose.prod.yml up -d
```

## SSL証明書の設定

### Let's Encryptを使用する場合

```bash
# Certbotをインストール
sudo apt-get install certbot

# 証明書を取得
sudo certbot certonly --standalone -d yourdomain.com

# 証明書をコピー
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem

# 権限を設定
sudo chown $USER:$USER nginx/ssl/*
```

### 自己署名証明書（開発用）

```bash
# SSL証明書を生成
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=JP/ST=Tokyo/L=Tokyo/O=StayConnect/CN=localhost"
```

## データベース管理

### 初期セットアップ

```bash
# データベースマイグレーション
docker-compose exec backend python -c "
from database import engine, Base
from models import *
Base.metadata.create_all(bind=engine)
"
```

### バックアップ

```bash
# データベースバックアップ
docker-compose exec postgres pg_dump -U stayconnect stayconnect > backup_$(date +%Y%m%d_%H%M%S).sql

# ファイルバックアップ
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/
```

### リストア

```bash
# データベースリストア
docker-compose exec -T postgres psql -U stayconnect stayconnect < backup.sql

# ファイルリストア
tar -xzf uploads_backup.tar.gz
```

## モニタリング

### ヘルスチェック

```bash
# アプリケーション全体
curl http://localhost/health

# 個別サービス
curl http://localhost:8000/health  # バックエンド
curl http://localhost:3000/api/health  # フロントエンド
```

### ログ監視

```bash
# すべてのログ
docker-compose logs -f

# 特定のサービス
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# エラーログのみ
docker-compose logs -f | grep ERROR
```

### メトリクス監視

```bash
# PrometheusとGrafanaを起動
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# アクセス
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

## トラブルシューティング

### よくある問題

1. **ポート競合**
   ```bash
   # 使用中のポートを確認
   sudo netstat -tulpn | grep :80
   
   # プロセスを停止
   sudo kill -9 <PID>
   ```

2. **権限エラー**
   ```bash
   # ファイル権限を修正
   sudo chown -R $USER:$USER uploads/
   sudo chmod -R 755 uploads/
   ```

3. **データベース接続エラー**
   ```bash
   # PostgreSQLコンテナの状態確認
   docker-compose ps postgres
   
   # ログを確認
   docker-compose logs postgres
   
   # 接続テスト
   docker-compose exec postgres psql -U stayconnect -d stayconnect -c "SELECT 1;"
   ```

4. **メモリ不足**
   ```bash
   # メモリ使用量確認
   docker stats
   
   # 不要なコンテナを削除
   docker system prune -a
   ```

### パフォーマンス最適化

1. **データベース最適化**
   ```sql
   -- インデックスの作成
   CREATE INDEX idx_hosts_location ON hosts(location);
   CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
   CREATE INDEX idx_messages_users ON messages(sender_id, recipient_id);
   ```

2. **Nginx設定**
   ```nginx
   # キャッシュ設定
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Redis設定**
   ```bash
   # Redis設定の最適化
   echo "maxmemory 256mb" >> redis.conf
   echo "maxmemory-policy allkeys-lru" >> redis.conf
   ```

## セキュリティ

### ファイアウォール設定

```bash
# UFWを有効化
sudo ufw enable

# 必要なポートを開放
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# 不要なポートを閉じる
sudo ufw deny 3000   # フロントエンド直接アクセス
sudo ufw deny 8000   # バックエンド直接アクセス
```

### セキュリティヘッダー

Nginxの設定で以下のヘッダーが設定されています：

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`

### 定期的なセキュリティ更新

```bash
# システム更新
sudo apt update && sudo apt upgrade -y

# Dockerイメージ更新
docker-compose pull
docker-compose up -d

# 脆弱性スキャン
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image stayconnect_backend:latest
```

## スケーリング

### 水平スケーリング

```yaml
# docker-compose.scale.yml
services:
  backend:
    deploy:
      replicas: 3
  
  frontend:
    deploy:
      replicas: 2
```

### ロードバランサー設定

```nginx
upstream backend {
    server backend_1:8000;
    server backend_2:8000;
    server backend_3:8000;
}

upstream frontend {
    server frontend_1:3000;
    server frontend_2:3000;
}
```

## 運用チェックリスト

### デプロイ前
- [ ] 環境変数の設定確認
- [ ] SSL証明書の有効性確認
- [ ] データベースバックアップ
- [ ] テストの実行
- [ ] セキュリティスキャン

### デプロイ後
- [ ] ヘルスチェック確認
- [ ] ログエラーの確認
- [ ] パフォーマンス監視
- [ ] ユーザー機能テスト
- [ ] モニタリング設定

### 定期メンテナンス
- [ ] ログローテーション
- [ ] データベース最適化
- [ ] セキュリティ更新
- [ ] バックアップ確認
- [ ] 容量監視

## サポート

問題が発生した場合は、以下の情報を収集してください：

1. エラーログ
2. システム情報（CPU、メモリ、ディスク使用量）
3. Docker コンテナの状態
4. 環境変数の設定（機密情報は除く）
5. 再現手順