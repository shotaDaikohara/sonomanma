import pytest
from fastapi.testclient import TestClient
from services.matching_service import MatchingService

def test_calculate_matching_score():
    """マッチングスコア計算のテスト"""
    user_interests = ["アート", "音楽", "カフェ巡り"]
    host_interests = ["アート", "写真", "カフェ巡り"]
    
    score = MatchingService.calculate_interest_score(user_interests, host_interests)
    # 共通の興味: アート、カフェ巡り (2/3 = 0.67)
    assert 0.6 <= score <= 0.7

def test_calculate_location_score():
    """立地スコア計算のテスト"""
    # 同じ都道府県
    score1 = MatchingService.calculate_location_score("東京都渋谷区", "東京都新宿区")
    assert score1 > 0.5
    
    # 異なる都道府県
    score2 = MatchingService.calculate_location_score("東京都渋谷区", "大阪府大阪市")
    assert score2 < 0.5

def test_get_matching_hosts(client, auth_headers, test_user, test_host):
    """マッチング宿主取得のテスト"""
    response = client.get("/matching/hosts", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    if len(data) > 0:
        host = data[0]
        assert "matching_score" in host
        assert "matching_reasons" in host
        assert 0 <= host["matching_score"] <= 100

def test_get_matching_hosts_with_filters(client, auth_headers):
    """フィルター付きマッチング宿主取得のテスト"""
    response = client.get("/matching/hosts?location=東京&min_price=5000&max_price=15000", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_host_recommendations(client, auth_headers, test_user):
    """宿主レコメンデーション取得のテスト"""
    response = client.get(f"/matching/recommendations/{test_user.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 10  # 最大10件のレコメンデーション