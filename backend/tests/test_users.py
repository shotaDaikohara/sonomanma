import pytest
from fastapi.testclient import TestClient

def test_get_user_profile(client, auth_headers, test_user):
    """ユーザープロフィール取得のテスト"""
    response = client.get(f"/users/{test_user.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_user.username
    assert data["full_name"] == test_user.full_name
    assert data["bio"] == test_user.bio
    assert data["interests"] == test_user.interests

def test_update_user_profile(client, auth_headers, test_user):
    """ユーザープロフィール更新のテスト"""
    update_data = {
        "full_name": "更新されたユーザー",
        "bio": "更新された自己紹介",
        "interests": ["新しい趣味", "別の趣味"]
    }
    response = client.put(f"/users/{test_user.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "更新されたユーザー"
    assert data["bio"] == "更新された自己紹介"
    assert data["interests"] == ["新しい趣味", "別の趣味"]

def test_update_other_user_profile_forbidden(client, auth_headers, db_session):
    """他のユーザーのプロフィール更新テスト（権限なし）"""
    # 別のユーザーを作成
    from models import User
    other_user = User(
        username="otheruser",
        email="other@example.com",
        hashed_password="hashed",
        full_name="他のユーザー"
    )
    db_session.add(other_user)
    db_session.commit()
    db_session.refresh(other_user)
    
    update_data = {"full_name": "悪意のある更新"}
    response = client.put(f"/users/{other_user.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 403

def test_get_nonexistent_user(client, auth_headers):
    """存在しないユーザーの取得テスト"""
    response = client.get("/users/99999", headers=auth_headers)
    assert response.status_code == 404