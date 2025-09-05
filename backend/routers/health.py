from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import redis
import os
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    アプリケーションのヘルスチェック
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {}
    }
    
    # データベース接続チェック
    try:
        db.execute(text("SELECT 1"))
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Redis接続チェック
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        r = redis.from_url(redis_url)
        r.ping()
        health_status["services"]["redis"] = "healthy"
    except Exception as e:
        health_status["services"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # ディスク容量チェック
    try:
        import shutil
        total, used, free = shutil.disk_usage("/")
        disk_usage_percent = (used / total) * 100
        
        if disk_usage_percent > 90:
            health_status["services"]["disk"] = f"warning: {disk_usage_percent:.1f}% used"
        else:
            health_status["services"]["disk"] = f"healthy: {disk_usage_percent:.1f}% used"
    except Exception as e:
        health_status["services"]["disk"] = f"unknown: {str(e)}"
    
    # メモリ使用量チェック
    try:
        import psutil
        memory = psutil.virtual_memory()
        memory_usage_percent = memory.percent
        
        if memory_usage_percent > 90:
            health_status["services"]["memory"] = f"warning: {memory_usage_percent:.1f}% used"
        else:
            health_status["services"]["memory"] = f"healthy: {memory_usage_percent:.1f}% used"
    except Exception as e:
        health_status["services"]["memory"] = f"unknown: {str(e)}"
    
    if health_status["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=health_status)
    
    return health_status

@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """
    アプリケーションの準備状態チェック
    """
    try:
        # データベース接続確認
        db.execute(text("SELECT 1"))
        
        # 必要なテーブルの存在確認
        from models import User, Host, Booking, Message
        db.query(User).first()
        
        return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=503, detail={"status": "not ready", "error": str(e)})

@router.get("/live")
async def liveness_check():
    """
    アプリケーションの生存確認
    """
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}