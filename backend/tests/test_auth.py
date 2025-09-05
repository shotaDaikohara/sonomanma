import pytest
from fastapi.testclient import TestClient

def test_register_user(client):
    """ユーザー登録のテスト"""
    response = client.post("/auth/register", json={
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123",
        "full_name": "新規ユーザー",
        "interests": ["旅行", "料理"]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "新規ユーザー"
    assert "id" in data

def test_register_duplicate_email(client, test_user):
    """重複メールアドレスでの登録テスト"""
    response = client.post("/auth/register", json={
        "username": "anotheruser",
        "email": test_user.email,
        "password": "password123",
        "full_name": "別のユーザー",
        "interests": ["音楽"]
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_login_success(client, test_user):
    """ログイン成功のテスト"""
    response = client.post("/auth/login", data={
        "username": test_user.email,
        "password": "secret"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    """無効な認証情報でのログインテスト"""
    response = client.post("/auth/login", data={
        "username": "invalid@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Incorrect" in response.json()["detail"]

def test_get_current_user(client, auth_headers):
    """現在のユーザー情報取得のテスト"""
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"

def test_get_current_user_unauthorized(client):
    """認証なしでのユーザー情報取得テスト"""
    response = client.get("/auth/me")
    assert response.status_code == 401