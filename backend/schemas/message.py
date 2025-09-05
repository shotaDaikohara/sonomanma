from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    booking_id: int
    receiver_id: int

class MessageResponse(MessageBase):
    id: int
    booking_id: int
    sender_id: int
    receiver_id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    booking_id: int
    other_user_id: int
    other_user_name: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int