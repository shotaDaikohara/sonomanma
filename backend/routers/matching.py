from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database.connection import get_db
from services.matching_service import MatchingService
from routers.users import get_current_user
from models.user import User
from typing import List, Dict, Any

router = APIRouter(prefix="/api/matching", tags=["matching"])

@router.get("/hosts")
async def get_matched_hosts(
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """マッチング率順の宿主一覧取得"""
    matched_hosts = MatchingService.get_matched_hosts(db, current_user.id, limit)
    
    # レスポンス用にデータを整形
    result = []
    for item in matched_hosts:
        host = item["host"]
        host_user = item["host_user"]
        
        result.append({
            "id": host.id,
            "title": host.title,
            "description": host.description,
            "location": host.location,
            "property_type": host.property_type,
            "max_guests": host.max_guests,
            "price_per_night": host.price_per_night,
            "photos": host.photos or [],
            "available_dates": host.available_dates or [],
            "host_user": {
                "id": host_user.id,
                "name": host_user.name,
                "interests": host_user.interests or [],
                "rating": host_user.rating,
                "review_count": host_user.review_count
            },
            "match_rate": item["match_rate"],
            "match_reason": item["match_reason"]
        })
    
    return result

@router.get("/rate/{host_id}")
async def calculate_match_rate(
    host_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """特定の宿主とのマッチング率計算"""
    from models.host import Host
    
    host = db.query(Host).filter(Host.id == host_id).first()
    if not host:
        return {"error": "Host not found"}
    
    host_user = db.query(User).filter(User.id == host.user_id).first()
    if not host_user:
        return {"error": "Host user not found"}
    
    match_rate = MatchingService.calculate_match_rate(
        guest_interests=current_user.interests or [],
        host_interests=host_user.interests or [],
        location_preference=current_user.location or "",
        host_location=host.location,
        host_rating=host_user.rating
    )
    
    match_reason = MatchingService.generate_match_reason(
        current_user.interests or [],
        host_user.interests or [],
        current_user.location or "",
        host.location
    )
    
    return {
        "host_id": host_id,
        "match_rate": round(match_rate, 1),
        "match_reason": match_reason
    }