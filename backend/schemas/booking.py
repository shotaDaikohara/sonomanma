from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class BookingBase(BaseModel):
    host_id: int
    check_in: date
    check_out: date
    guests_count: int
    message: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    status: Optional[str] = None  # "pending", "confirmed", "cancelled", "completed"

class BookingResponse(BookingBase):
    id: int
    guest_id: int
    total_price: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True