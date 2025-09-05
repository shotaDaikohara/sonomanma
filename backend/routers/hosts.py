from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from database.connection import get_db
from models.host import Host
from models.user import User
from schemas.host import HostCreate, HostUpdate, HostResponse
from routers.users import get_current_user
from typing import List, Optional
import shutil
import json

router = APIRouter(prefix="/api/hosts", tags=["hosts"])

@router.get("/", response_model=List[HostResponse])
@router.get("", response_model=List[HostResponse])
async def get_hosts(
    location: Optional[str] = Query(None),
    max_guests: Optional[int] = Query(None),
    skip: int = Query(0),
    limit: int = Query(100),
    db: Session = Depends(get_db)
):
    """宿主一覧取得（検索・フィルタリング）"""
    query = db.query(Host).filter(Host.is_active == True)
    
    if location:
        query = query.filter(Host.location.contains(location))
    if max_guests:
        query = query.filter(Host.max_guests >= max_guests)
    
    hosts = query.offset(skip).limit(limit).all()
    return hosts

@router.get("/{host_id}/", response_model=HostResponse)
@router.get("/{host_id}", response_model=HostResponse)
async def get_host_detail(host_id: int, db: Session = Depends(get_db)):
    """宿主詳細取得"""
    host = db.query(Host).filter(Host.id == host_id, Host.is_active == True).first()
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Host not found"
        )
    return host

@router.post("/", response_model=HostResponse)
async def create_host(
    host_data: HostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """宿主情報登録"""
    db_host = Host(
        user_id=current_user.id,
        title=host_data.title,
        description=host_data.description,
        location=host_data.location,
        property_type=host_data.property_type,
        max_guests=host_data.max_guests,
        amenities=host_data.amenities,
        house_rules=host_data.house_rules,
        price_per_night=host_data.price_per_night,
        available_dates=host_data.available_dates
    )
    
    db.add(db_host)
    db.commit()
    db.refresh(db_host)
    return db_host

@router.put("/{host_id}", response_model=HostResponse)
async def update_host(
    host_id: int,
    host_update: HostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """宿主情報更新"""
    host = db.query(Host).filter(Host.id == host_id, Host.user_id == current_user.id).first()
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Host not found or not authorized"
        )
    
    update_data = host_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(host, field, value)
    
    db.commit()
    db.refresh(host)
    return host

@router.post("/{host_id}/upload-photos")
async def upload_host_photos(
    host_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """宿主写真アップロード"""
    host = db.query(Host).filter(Host.id == host_id, Host.user_id == current_user.id).first()
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Host not found or not authorized"
        )
    
    uploaded_files = []
    for i, file in enumerate(files):
        if not file.content_type.startswith("image/"):
            continue
        
        file_extension = file.filename.split(".")[-1]
        filename = f"host_{host_id}_{i}.{file_extension}"
        file_path = f"uploads/{filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        uploaded_files.append(file_path)
    
    # 既存の写真リストに追加
    current_photos = host.photos or []
    host.photos = current_photos + uploaded_files
    db.commit()
    
    return {"message": f"{len(uploaded_files)} photos uploaded successfully", "photos": host.photos}