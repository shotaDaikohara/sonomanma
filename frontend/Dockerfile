# マルチステージビルド
FROM node:18-alpine AS deps

WORKDIR /app

# 依存関係ファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install --legacy-peer-deps

# ビルダーステージ
FROM node:18-alpine AS builder

WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# アプリケーションをビルド
RUN npm run build

# 本番用イメージ
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# 非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 必要なファイルをコピー
COPY --from=builder /app/public ./public

# Next.jsの出力をコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# ポートを公開
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# アプリケーションを起動
CMD ["node", "server.js"]