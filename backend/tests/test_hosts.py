import pytest
from fastapi.testclient import TestClient

def test_create_host(client, auth_headers, test_user):
    """宿主登録のテスト"""
    host_data = {
        "title": "新しい宿主",
        "description": "素晴らしい体験を提供します",
        "location": "大阪府大阪市",
        "price_per_night": 8000,
        "max_guests": 3,
        "amenities": ["WiFi", "エアコン"],
        "house_rules": ["禁煙"],
        "available_from": "2024-02-01",
        "available_to": "2024-11-30"
    }
    response = client.post("/hosts/", json=host_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == host_data["title"]
    assert data["user_id"] == test_user.id
    assert data["price_per_night"] == host_data["price_per_night"]

def test_get_host_detail(client, test_host):
    """宿主詳細取得のテスト"""
    response = client.get(f"/hosts/{test_host.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == test_host.title
    assert data["description"] == test_host.description
    assert data["location"] == test_host.location

def test_update_host(client, auth_headers, test_host):
    """宿主情報更新のテスト"""
    update_data = {
        "title": "更新された宿主",
        "price_per_night": 12000,
        "max_guests": 4
    }
    response = client.put(f"/hosts/{test_host.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "更新された宿主"
    assert data["price_per_night"] == 12000
    assert data["max_guests"] == 4

def test_search_hosts(client):
    """宿主検索のテスト"""
    response = client.get("/hosts/search?location=東京&max_guests=2")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_host_availability(client, test_host):
    """宿主の空き状況取得のテスト"""
    response = client.get(f"/hosts/{test_host.id}/availability?start_date=2024-02-01&end_date=2024-02-28")
    assert response.status_code == 200
    data = response.json()
    assert "available_dates" in data

def test_delete_host(client, auth_headers, test_host):
    """宿主削除のテスト"""
    response = client.delete(f"/hosts/{test_host.id}", headers=auth_headers)
    assert response.status_code == 200
    
    # 削除後の確認
    response = client.get(f"/hosts/{test_host.id}")
    assert response.status_code == 404