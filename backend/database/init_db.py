from database.connection import engine, Base
from models.user import User
from models.host import Host
from models.booking import Booking
from models.message import Message

def create_tables():
    """データベーステーブルを作成"""
    Base.metadata.create_all(bind=engine)
    print("データベーステーブルが作成されました")

if __name__ == "__main__":
    create_tables()