import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import get_db, Base
from models import User, Host, Booking, Message

# テスト用のインメモリデータベース
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user(db_session):
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # secret
        full_name="テストユーザー",
        bio="テスト用のユーザーです",
        interests=["テスト", "開発"]
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_host(db_session, test_user):
    host = Host(
        user_id=test_user.id,
        title="テスト宿主",
        description="テスト用の宿主です",
        location="東京都渋谷区",
        price_per_night=10000,
        max_guests=2,
        amenities=["WiFi", "キッチン"],
        house_rules=["禁煙", "静かに"],
        available_from="2024-01-01",
        available_to="2024-12-31"
    )
    db_session.add(host)
    db_session.commit()
    db_session.refresh(host)
    return host

@pytest.fixture
def auth_headers(client, test_user):
    response = client.post("/auth/login", data={
        "username": test_user.email,
        "password": "secret"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}