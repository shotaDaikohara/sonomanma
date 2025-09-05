from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User
from schemas.user import UserResponse, UserUpdate, UserCreate, UserLogin
from utils.security import verify_token, create_access_token, hash_password, verify_password
import shutil
import os
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

def get_current_user(token: str, db: Session = Depends(get_db)):
    """現在のユーザーを取得"""
    user_id = verify_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """ユーザー登録"""
    # メールアドレスの重複チェック
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています"
        )
    
    # パスワードをハッシュ化
    hashed_password = hash_password(user_data.password)
    
    # 新しいユーザーを作成
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        name=user_data.name,
        age=user_data.age,
        interests=user_data.interests,
        location=user_data.location
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # アクセストークンを生成
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
async def login_user(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """ユーザーログイン"""
    # ユーザーを検索
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # アクセストークンを生成
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """現在のユーザー情報取得"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_info(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザー情報更新"""
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """特定ユーザー情報取得"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """プロフィール画像アップロード"""
    # ファイル形式チェック
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # ファイル保存
    file_extension = file.filename.split(".")[-1]
    filename = f"avatar_{current_user.id}.{file_extension}"
    file_path = f"uploads/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # データベース更新
    current_user.profile_image = file_path
    db.commit()
    
    return {"message": "Avatar uploaded successfully", "file_path": file_path}