from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base

class Host(Base):
    __tablename__ = "hosts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    property_type = Column(String(50), nullable=False)  # "apartment", "house", etc.
    max_guests = Column(Integer, nullable=False)
    amenities = Column(JSON, default=list)
    house_rules = Column(JSON, default=list)
    photos = Column(JSON, default=list)  # 写真URLのリスト
    price_per_night = Column(Float, nullable=False)
    available_dates = Column(JSON, default=list)  # 利用可能日程
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())  
  # リレーション
    user = relationship("User", back_populates="hosts")