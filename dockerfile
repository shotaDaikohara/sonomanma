# ========== Frontend ==========
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY frontend/ .
RUN pnpm build

# ========== Backend ==========
FROM python:3.11 AS backend
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# ========== Final Stage ==========
FROM python:3.11-slim
WORKDIR /app

# --- Frontend 配置 ---
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/

# --- Backend 配置 ---
COPY --from=backend /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=backend /app/backend ./backend

# 環境変数
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1

# 起動スクリプト（uvicorn + next）
CMD uvicorn backend.main:app --host 0.0.0.0 --port 8000 & \
    npx next start -p 3000 --dir ./frontend && wait
