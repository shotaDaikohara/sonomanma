from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    age: Optional[int] = None
    interests: List[str] = []
    location: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    interests: Optional[List[str]] = None
    location: Optional[str] = None
    bio: Optional[str] = None

class UserResponse(UserBase):
    id: int
    profile_image: Optional[str] = None
    rating: float
    review_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True