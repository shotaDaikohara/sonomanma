from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class AvailableDate(BaseModel):
    date: str
    available: bool = True
    price: Optional[float] = None

class HostBase(BaseModel):
    title: str
    description: str
    location: str
    property_type: str
    max_guests: int
    amenities: List[str] = []
    house_rules: List[str] = []
    price_per_night: float

class HostCreate(HostBase):
    available_dates: List[AvailableDate] = []

class HostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    property_type: Optional[str] = None
    max_guests: Optional[int] = None
    amenities: Optional[List[str]] = None
    house_rules: Optional[List[str]] = None
    price_per_night: Optional[float] = None
    available_dates: Optional[List[AvailableDate]] = None
    is_active: Optional[bool] = None

class HostResponse(HostBase):
    id: int
    user_id: int
    photos: List[str] = []
    available_dates: List[AvailableDate] = []
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True