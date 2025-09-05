from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    host_id = Column(Integer, ForeignKey("hosts.id"), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests_count = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(20), default="pending")  # "pending", "confirmed", "cancelled", "completed"
    message = Column(Text, nullable=True)  # 予約時のメッセージ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # リレーション
    guest = relationship("User", foreign_keys=[guest_id])
    host = relationship("Host", foreign_keys=[host_id])