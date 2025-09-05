from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.init_db import create_tables
from routers import auth
import os

# データベーステーブルを作成
create_tables()

app = FastAPI(title="StayConnect API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.jsのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを追加
app.include_router(auth.router, prefix="/api")
from routers import users, hosts, matching, bookings, messages, health
app.include_router(users.router, prefix="/api")
app.include_router(hosts.router)
app.include_router(matching.router)
app.include_router(bookings.router)
app.include_router(messages.router)
app.include_router(health.router)

# アップロードディレクトリの作成
os.makedirs("uploads", exist_ok=True)
os.makedirs("logs", exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Welcome to StayConnect API"}

# ヘルスチェックは health.py で定義

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
