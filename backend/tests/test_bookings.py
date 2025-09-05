import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

def test_create_booking(client, auth_headers, test_user, test_host):
    """予約作成のテスト"""
    booking_data = {
        "host_id": test_host.id,
        "check_in_date": "2024-03-01",
        "check_out_date": "2024-03-03",
        "guest_count": 2,
        "message": "よろしくお願いします"
    }
    response = client.post("/bookings/", json=booking_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["host_id"] == test_host.id
    assert data["guest_id"] == test_user.id
    assert data["status"] == "pending"
    assert data["guest_count"] == 2

def test_get_user_bookings(client, auth_headers, test_user):
    """ユーザーの予約一覧取得のテスト"""
    response = client.get("/bookings/user", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_host_bookings(client, auth_headers, test_host):
    """宿主の予約一覧取得のテスト"""
    response = client.get(f"/bookings/host/{test_host.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_update_booking_status(client, auth_headers, db_session, test_user, test_host):
    """予約ステータス更新のテスト"""
    # まず予約を作成
    from models import Booking
    booking = Booking(
        host_id=test_host.id,
        guest_id=test_user.id,
        check_in_date=datetime(2024, 3, 1),
        check_out_date=datetime(2024, 3, 3),
        guest_count=2,
        total_price=20000,
        status="pending"
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)
    
    # ステータス更新
    response = client.put(f"/bookings/{booking.id}/status", 
                         json={"status": "confirmed"}, 
                         headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "confirmed"

def test_cancel_booking(client, auth_headers, db_session, test_user, test_host):
    """予約キャンセルのテスト"""
    from models import Booking
    booking = Booking(
        host_id=test_host.id,
        guest_id=test_user.id,
        check_in_date=datetime(2024, 3, 1),
        check_out_date=datetime(2024, 3, 3),
        guest_count=2,
        total_price=20000,
        status="confirmed"
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)
    
    response = client.delete(f"/bookings/{booking.id}", headers=auth_headers)
    assert response.status_code == 200
    
    # キャンセル後の確認
    response = client.get(f"/bookings/{booking.id}", headers=auth_headers)
    data = response.json()
    assert data["status"] == "cancelled"

def test_booking_date_conflict(client, auth_headers, db_session, test_user, test_host):
    """予約日程重複のテスト"""
    from models import Booking
    # 既存の予約を作成
    existing_booking = Booking(
        host_id=test_host.id,
        guest_id=test_user.id,
        check_in_date=datetime(2024, 3, 1),
        check_out_date=datetime(2024, 3, 5),
        guest_count=1,
        total_price=40000,
        status="confirmed"
    )
    db_session.add(existing_booking)
    db_session.commit()
    
    # 重複する日程で予約を試行
    booking_data = {
        "host_id": test_host.id,
        "check_in_date": "2024-03-03",
        "check_out_date": "2024-03-07",
        "guest_count": 1,
        "message": "重複テスト"
    }
    response = client.post("/bookings/", json=booking_data, headers=auth_headers)
    assert response.status_code == 400
    assert "already booked" in response.json()["detail"]