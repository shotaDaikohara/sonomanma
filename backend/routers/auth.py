from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.auth import UserSignup, UserLogin, Token
from schemas.user import UserResponse
from services.auth_service import AuthService
from utils.security import verify_token

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    """ユーザー登録"""
    user = AuthService.create_user(db, user_data)
    return user

@router.post("/register")
async def register(user_data: UserSignup, db: Session = Depends(get_db)):
    """ユーザー登録（フロントエンド用）"""
    print(f"受信したデータ: {user_data}")
    try:
        user = AuthService.create_user(db, user_data)
        tokens = AuthService.create_tokens(user.id)
        
        # ユーザー情報を辞書形式に変換
        user_dict = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "interests": user.interests or [],
            "location": user.location,
            "bio": user.bio,
            "profile_image": user.profile_image,
            "rating": user.rating,
            "review_count": user.review_count,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        }
        
        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "user": user_dict
        }
    except Exception as e:
        print(f"登録エラー: {e}")
        raise

@router.post("/login")
async def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """ログイン"""
    print(f"ログインリクエスト受信: {login_data.email}")
    user = AuthService.authenticate_user(db, login_data)
    print(f"認証成功 - ユーザーID: {user.id}")
    tokens = AuthService.create_tokens(user.id)
    
    print(f"ログイン成功 - ユーザー: {user}")
    print(f"トークン: {tokens}")
    
    # リフレッシュトークンをhttpOnlyクッキーに設定
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=False,  # 開発環境ではFalse
        samesite="lax",
        max_age=7 * 24 * 60 * 60  # 7日間
    )
    
    # ユーザー情報を辞書形式に変換
    user_dict = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "interests": user.interests or [],
        "location": user.location,
        "bio": user.bio,
        "profile_image": user.profile_image,
        "rating": user.rating,
        "review_count": user.review_count,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }
    
    result = {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": tokens["token_type"],
        "user": user_dict
    }
    print(f"レスポンス: {result}")
    return result

@router.post("/logout")
async def logout(response: Response):
    """ログアウト"""
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

@router.get("/me")
async def get_current_user(db: Session = Depends(get_db)):
    """現在のユーザー情報を取得"""
    from fastapi import Request
    from utils.security import get_current_user
    
    # この実装は後で適切な認証ミドルウェアに置き換える
    # 現在は簡易実装
    return {"message": "Not implemented yet"}

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """トークンリフレッシュ"""
    user_id = verify_token(refresh_token)
    tokens = AuthService.create_tokens(user_id)
    return tokens