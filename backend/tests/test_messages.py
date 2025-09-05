import pytest
from fastapi.testclient import TestClient

def test_send_message(client, auth_headers, test_user, db_session):
    """メッセージ送信のテスト"""
    # 受信者ユーザーを作成
    from models import User
    recipient = User(
        username="recipient",
        email="recipient@example.com",
        hashed_password="hashed",
        full_name="受信者"
    )
    db_session.add(recipient)
    db_session.commit()
    db_session.refresh(recipient)
    
    message_data = {
        "recipient_id": recipient.id,
        "content": "こんにちは、メッセージのテストです"
    }
    response = client.post("/messages/", json=message_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["sender_id"] == test_user.id
    assert data["recipient_id"] == recipient.id
    assert data["content"] == message_data["content"]

def test_get_conversations(client, auth_headers):
    """会話一覧取得のテスト"""
    response = client.get("/messages/conversations", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_conversation_messages(client, auth_headers, db_session, test_user):
    """特定の会話のメッセージ取得のテスト"""
    from models import User, Message
    
    # 相手ユーザーを作成
    other_user = User(
        username="otheruser",
        email="other@example.com",
        hashed_password="hashed",
        full_name="相手ユーザー"
    )
    db_session.add(other_user)
    db_session.commit()
    db_session.refresh(other_user)
    
    # メッセージを作成
    message = Message(
        sender_id=test_user.id,
        recipient_id=other_user.id,
        content="テストメッセージ"
    )
    db_session.add(message)
    db_session.commit()
    
    response = client.get(f"/messages/conversation/{other_user.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert data[0]["content"] == "テストメッセージ"

def test_mark_messages_as_read(client, auth_headers, db_session, test_user):
    """メッセージ既読マークのテスト"""
    from models import User, Message
    
    # 送信者ユーザーを作成
    sender = User(
        username="sender",
        email="sender@example.com",
        hashed_password="hashed",
        full_name="送信者"
    )
    db_session.add(sender)
    db_session.commit()
    db_session.refresh(sender)
    
    # 未読メッセージを作成
    message = Message(
        sender_id=sender.id,
        recipient_id=test_user.id,
        content="未読メッセージ",
        is_read=False
    )
    db_session.add(message)
    db_session.commit()
    db_session.refresh(message)
    
    response = client.put(f"/messages/{message.id}/read", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_read"] == True

def test_get_unread_count(client, auth_headers):
    """未読メッセージ数取得のテスト"""
    response = client.get("/messages/unread-count", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "unread_count" in data
    assert isinstance(data["unread_count"], int)