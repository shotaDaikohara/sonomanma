from typing import List, Dict
from sqlalchemy.orm import Session
from models.host import Host
from models.user import User

class MatchingService:
    @staticmethod
    def calculate_match_rate(
        guest_interests: List[str], 
        host_interests: List[str],
        location_preference: str,
        host_location: str,
        host_rating: float = 0.0
    ) -> float:
        """マッチング率を計算"""
        
        # 興味関心の一致率 (60%の重み)
        if not guest_interests:
            interest_score = 0
        else:
            common_interests = set(guest_interests) & set(host_interests)
            interest_score = len(common_interests) / len(guest_interests) * 0.6
        
        # 立地の一致 (25%の重み)
        location_score = 0.25 if location_preference and location_preference.lower() in host_location.lower() else 0
        
        # 宿主の評価 (15%の重み)
        rating_score = (host_rating / 5.0) * 0.15 if host_rating > 0 else 0
        
        return min((interest_score + location_score + rating_score) * 100, 100)
    
    @staticmethod
    def get_matched_hosts(db: Session, user_id: int, limit: int = 20) -> List[Dict]:
        """ユーザーにマッチした宿主一覧を取得"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []
        
        hosts = db.query(Host).filter(Host.is_active == True).all()
        matched_hosts = []
        
        for host in hosts:
            # 宿主のユーザー情報を取得
            host_user = db.query(User).filter(User.id == host.user_id).first()
            if not host_user:
                continue
            
            match_rate = MatchingService.calculate_match_rate(
                guest_interests=user.interests or [],
                host_interests=host_user.interests or [],
                location_preference=user.location or "",
                host_location=host.location,
                host_rating=host_user.rating
            )
            
            # マッチング理由を生成
            match_reason = MatchingService.generate_match_reason(
                user.interests or [],
                host_user.interests or [],
                user.location or "",
                host.location
            )
            
            matched_hosts.append({
                "host": host,
                "host_user": host_user,
                "match_rate": round(match_rate, 1),
                "match_reason": match_reason
            })
        
        # マッチング率でソート
        matched_hosts.sort(key=lambda x: x["match_rate"], reverse=True)
        return matched_hosts[:limit]
    
    @staticmethod
    def generate_match_reason(
        guest_interests: List[str],
        host_interests: List[str], 
        guest_location: str,
        host_location: str
    ) -> str:
        """マッチング理由を生成"""
        reasons = []
        
        # 共通の興味関心
        common_interests = set(guest_interests) & set(host_interests)
        if common_interests:
            interests_text = "、".join(common_interests)
            reasons.append(f"{interests_text}の共通趣味があります")
        
        # 立地の一致
        if guest_location and guest_location.lower() in host_location.lower():
            reasons.append(f"{host_location}という希望エリアと一致しています")
        
        if not reasons:
            reasons.append("新しい出会いと体験を楽しめそうです")
        
        return "。".join(reasons) + "。"