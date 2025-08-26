# ---------- Frontend Build ----------
FROM node:20 AS fe-build
WORKDIR /app
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm i
COPY frontend/ .
RUN pnpm build   # => .next/standalone/server.js 生成

# ---------- Backend Build ----------
FROM python:3.11-slim AS be-build
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# ---------- Final ----------
FROM python:3.11-slim
WORKDIR /app

# Node.jsをインストール（Next.js standalone実行に必要）
RUN apt-get update && apt-get install -y curl \
  && rm -rf /var/lib/apt/lists/* \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

# --- Backend ---
COPY --from=be-build /app/backend /app/backend
COPY --from=be-build /app/backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# --- Frontend (standalone) ---
# standalone の「中身」を直下にコピーするのがポイント！
COPY --from=fe-build /app/.next/standalone/ ./frontend
COPY --from=fe-build /app/.next/static ./frontend/.next/static
COPY --from=fe-build /app/public ./frontend/public

# --- 起動設定 ---
WORKDIR /app
ENV PYTHONPATH=/app NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000 8000

CMD bash -c "\
  uvicorn backend.main:app --host 0.0.0.0 --port 8000 & \
  node /app/frontend/server.js"
