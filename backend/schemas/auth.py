from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    interests: List[str] = []
    location: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None