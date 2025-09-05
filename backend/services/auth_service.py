from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.user import User
from schemas.auth import UserSignup, UserLogin
from utils.security import get_password_hash, verify_password, create_access_token, create_refresh_token

class AuthService:
    @staticmethod
    def create_user(db: Session, user_data: UserSignup):
        # メールアドレスの重複チェック
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # パスワードをハッシュ化
        hashed_password = get_password_hash(user_data.password)
        
        # ユーザー作成
        db_user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hashed_password,
            interests=user_data.interests,
            location=user_data.location
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin):
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        return user
    
    @staticmethod
    def create_tokens(user_id: int):
        access_token = create_access_token(data={"sub": str(user_id)})
        refresh_token = create_refresh_token(data={"sub": str(user_id)})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }