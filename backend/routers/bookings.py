from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.booking import Booking
from models.host import Host
from schemas.booking import BookingCreate, BookingUpdate, BookingResponse
from routers.users import get_current_user
from models.user import User
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

@router.get("/", response_model=List[BookingResponse])
async def get_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """予約一覧取得"""
    bookings = db.query(Booking).filter(
        (Booking.guest_id == current_user.id) | 
        (Booking.host_id.in_(
            db.query(Host.id).filter(Host.user_id == current_user.id)
        ))
    ).all()
    return bookings

@router.post("/", response_model=BookingResponse)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """予約申し込み"""
    # 宿主情報を取得
    host = db.query(Host).filter(Host.id == booking_data.host_id).first()
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Host not found"
        )
    
    # 自分の宿泊先には予約できない
    if host.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book your own property"
        )
    
    # 宿泊日数を計算
    days = (booking_data.check_out - booking_data.check_in).days
    if days <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date"
        )
    
    # 合計金額を計算
    total_price = days * host.price_per_night
    
    # 予約作成
    db_booking = Booking(
        guest_id=current_user.id,
        host_id=booking_data.host_id,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        guests_count=booking_data.guests_count,
        total_price=total_price,
        message=booking_data.message,
        status="pending"
    )
    
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking_detail(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """予約詳細取得"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # 権限チェック（ゲストまたは宿主のみアクセス可能）
    host = db.query(Host).filter(Host.id == booking.host_id).first()
    if booking.guest_id != current_user.id and host.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking"
        )
    
    return booking

@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking_status(
    booking_id: int,
    booking_update: BookingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """予約ステータス更新"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # 宿主のみステータス変更可能
    host = db.query(Host).filter(Host.id == booking.host_id).first()
    if host.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only host can update booking status"
        )
    
    if booking_update.status:
        booking.status = booking_update.status
    
    db.commit()
    db.refresh(booking)
    return booking

@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """予約キャンセル"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # ゲストのみキャンセル可能
    if booking.guest_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only guest can cancel booking"
        )
    
    booking.status = "cancelled"
    db.commit()
    
    return {"message": "Booking cancelled successfully"}