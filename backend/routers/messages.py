from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from database.connection import get_db
from models.message import Message
from models.booking import Booking
from models.user import User
from schemas.message import MessageCreate, MessageResponse, ConversationResponse
from routers.users import get_current_user
from typing import List

router = APIRouter(prefix="/api/messages", tags=["messages"])

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """会話一覧取得"""
    # ユーザーが関わっている予約を取得
    bookings = db.query(Booking).filter(
        or_(
            Booking.guest_id == current_user.id,
            Booking.host_id.in_(
                db.query(Host.id).filter(Host.user_id == current_user.id)
            )
        )
    ).all()
    
    conversations = []
    for booking in bookings:
        # 相手のユーザーIDを特定
        if booking.guest_id == current_user.id:
            # 現在のユーザーがゲストの場合、宿主を取得
            from models.host import Host
            host = db.query(Host).filter(Host.id == booking.host_id).first()
            other_user_id = host.user_id if host else None
        else:
            # 現在のユーザーが宿主の場合、ゲストを取得
            other_user_id = booking.guest_id
        
        if not other_user_id:
            continue
        
        other_user = db.query(User).filter(User.id == other_user_id).first()
        if not other_user:
            continue
        
        # 最新メッセージを取得
        last_message = db.query(Message).filter(
            Message.booking_id == booking.id
        ).order_by(desc(Message.created_at)).first()
        
        # 未読メッセージ数を取得
        unread_count = db.query(Message).filter(
            and_(
                Message.booking_id == booking.id,
                Message.receiver_id == current_user.id,
                Message.is_read == False
            )
        ).count()
        
        conversations.append(ConversationResponse(
            booking_id=booking.id,
            other_user_id=other_user_id,
            other_user_name=other_user.name,
            last_message=last_message.content if last_message else None,
            last_message_time=last_message.created_at if last_message else None,
            unread_count=unread_count
        ))
    
    return conversations

@router.get("/{booking_id}", response_model=List[MessageResponse])
async def get_messages(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """特定予約のメッセージ取得"""
    # 予約の権限チェック
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    from models.host import Host
    host = db.query(Host).filter(Host.id == booking.host_id).first()
    if booking.guest_id != current_user.id and host.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these messages"
        )
    
    # メッセージを取得
    messages = db.query(Message).filter(
        Message.booking_id == booking_id
    ).order_by(Message.created_at).all()
    
    # 受信メッセージを既読にする
    db.query(Message).filter(
        and_(
            Message.booking_id == booking_id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        )
    ).update({"is_read": True})
    db.commit()
    
    return messages

@router.post("/", response_model=MessageResponse)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """メッセージ送信"""
    # 予約の権限チェック
    booking = db.query(Booking).filter(Booking.id == message_data.booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    from models.host import Host
    host = db.query(Host).filter(Host.id == booking.host_id).first()
    if booking.guest_id != current_user.id and host.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to send messages for this booking"
        )
    
    # メッセージ作成
    db_message = Message(
        booking_id=message_data.booking_id,
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        content=message_data.content
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.put("/{message_id}/read")
async def mark_message_as_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """メッセージ既読更新"""
    message = db.query(Message).filter(
        and_(
            Message.id == message_id,
            Message.receiver_id == current_user.id
        )
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message.is_read = True
    db.commit()
    
    return {"message": "Message marked as read"}