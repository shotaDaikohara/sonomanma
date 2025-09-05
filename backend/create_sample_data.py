#!/usr/bin/env python3
"""
サンプルデータ作成スクリプト
宿主データを20個作成します
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
import random

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db
from models.user import User
from models.host import Host
from sqlalchemy.orm import Session

# サンプルデータ
SAMPLE_USERS = [
    {"name": "田中太郎", "email": "tanaka@example.com", "interests": ["旅行", "料理", "写真"]},
    {"name": "佐藤花子", "email": "sato@example.com", "interests": ["音楽", "アート", "ヨガ"]},
    {"name": "鈴木一郎", "email": "suzuki@example.com", "interests": ["スポーツ", "映画", "読書"]},
    {"name": "高橋美咲", "email": "takahashi@example.com", "interests": ["料理", "ガーデニング", "手芸"]},
    {"name": "伊藤健太", "email": "ito@example.com", "interests": ["テクノロジー", "ゲーム", "アニメ"]},
    {"name": "渡辺さくら", "email": "watanabe@example.com", "interests": ["文化", "歴史", "美術館"]},
    {"name": "山本大輔", "email": "yamamoto@example.com", "interests": ["アウトドア", "キャンプ", "釣り"]},
    {"name": "中村あい", "email": "nakamura@example.com", "interests": ["ダンス", "ファッション", "カフェ"]},
    {"name": "小林正樹", "email": "kobayashi@example.com", "interests": ["ビジネス", "投資", "ワイン"]},
    {"name": "加藤みどり", "email": "kato@example.com", "interests": ["自然", "ハイキング", "鳥観察"]},
    {"name": "吉田拓也", "email": "yoshida@example.com", "interests": ["音楽", "ライブ", "楽器"]},
    {"name": "松本ゆり", "email": "matsumoto@example.com", "interests": ["旅行", "語学", "文化交流"]},
    {"name": "井上隆", "email": "inoue@example.com", "interests": ["料理", "お酒", "グルメ"]},
    {"name": "木村恵", "email": "kimura@example.com", "interests": ["ヨガ", "瞑想", "健康"]},
    {"name": "林大介", "email": "hayashi@example.com", "interests": ["写真", "デザイン", "建築"]},
    {"name": "清水美穂", "email": "shimizu@example.com", "interests": ["手芸", "DIY", "インテリア"]},
    {"name": "森田健", "email": "morita@example.com", "interests": ["スポーツ", "マラソン", "筋トレ"]},
    {"name": "池田さとみ", "email": "ikeda@example.com", "interests": ["読書", "映画", "カフェ"]},
    {"name": "橋本雄一", "email": "hashimoto@example.com", "interests": ["テクノロジー", "プログラミング", "AI"]},
    {"name": "石川なな", "email": "ishikawa@example.com", "interests": ["アート", "絵画", "陶芸"]},
]

SAMPLE_HOSTS = [
    {
        "title": "渋谷の中心地にあるモダンなアパート",
        "description": "渋谷駅から徒歩5分の便利な立地。モダンで清潔なお部屋で、東京観光の拠点に最適です。近くにはカフェやレストランも豊富にあります。",
        "location": "東京都渋谷区",
        "max_guests": 2,
        "price_per_night": 8000,
        "amenities": ["WiFi", "エアコン", "キッチン", "洗濯機"],
        "house_rules": ["禁煙", "ペット不可", "パーティー禁止"],
        "photos": ["https://example.com/photo1.jpg"]
    },
    {
        "title": "新宿の静かな住宅街の一軒家",
        "description": "新宿の喧騒から離れた静かな住宅街にある一軒家。家族連れやグループでの滞在に最適です。庭もあり、リラックスできる環境です。",
        "location": "東京都新宿区",
        "max_guests": 6,
        "price_per_night": 15000,
        "amenities": ["WiFi", "エアコン", "キッチン", "洗濯機", "駐車場", "庭"],
        "house_rules": ["禁煙", "ペット相談可", "22時以降静かに"],
        "photos": ["https://example.com/photo2.jpg"]
    },
    {
        "title": "浅草の伝統的な町家",
        "description": "浅草寺から徒歩10分の伝統的な町家。日本の文化を感じられる空間で、外国人観光客にも人気です。畳の部屋でゆっくりとお過ごしください。",
        "location": "東京都台東区",
        "max_guests": 4,
        "price_per_night": 12000,
        "amenities": ["WiFi", "エアコン", "キッチン", "布団"],
        "house_rules": ["禁煙", "ペット不可", "靴を脱いで入室"],
        "photos": ["https://example.com/photo3.jpg"]
    },
    {
        "title": "品川駅近くのビジネスホテル風ルーム",
        "description": "品川駅から徒歩3分の好立地。ビジネス利用にも観光にも便利です。シンプルで機能的なお部屋です。",
        "location": "東京都港区",
        "max_guests": 2,
        "price_per_night": 9000,
        "amenities": ["WiFi", "エアコン", "デスク", "冷蔵庫"],
        "house_rules": ["禁煙", "ペット不可", "チェックイン15時以降"],
        "photos": ["https://example.com/photo4.jpg"]
    },
    {
        "title": "吉祥寺のおしゃれなマンション",
        "description": "吉祥寺駅から徒歩8分のおしゃれなマンション。井の頭公園も近く、自然を感じながら滞在できます。カフェ巡りにも最適な立地です。",
        "location": "東京都武蔵野市",
        "max_guests": 3,
        "price_per_night": 10000,
        "amenities": ["WiFi", "エアコン", "キッチン", "洗濯機", "バルコニー"],
        "house_rules": ["禁煙", "ペット不可", "近隣への配慮をお願いします"],
        "photos": ["https://example.com/photo5.jpg"]
    },
    {
        "title": "下北沢のアーティスティックなロフト",
        "description": "下北沢の文化的な雰囲気を感じられるロフトタイプのお部屋。アーティストやクリエイターの方におすすめです。",
        "location": "東京都世田谷区",
        "max_guests": 2,
        "price_per_night": 7500,
        "amenities": ["WiFi", "エアコン", "キッチン", "アート用品"],
        "house_rules": ["禁煙", "ペット不可", "創作活動歓迎"],
        "photos": ["https://example.com/photo6.jpg"]
    },
    {
        "title": "恵比寿の高級マンション",
        "description": "恵比寿ガーデンプレイス近くの高級マンション。上質な滞在をお求めの方に最適です。コンシェルジュサービスもあります。",
        "location": "東京都渋谷区",
        "max_guests": 4,
        "price_per_night": 18000,
        "amenities": ["WiFi", "エアコン", "キッチン", "洗濯機", "ジム", "コンシェルジュ"],
        "house_rules": ["禁煙", "ペット不可", "ドレスコード有り"],
        "photos": ["https://example.com/photo7.jpg"]
    },
    {
        "title": "上野の美術館近くのアパート",
        "description": "上野の美術館や博物館から徒歩圏内。文化的な東京を楽しみたい方におすすめです。アメ横も近くにあります。",
        "location": "東京都台東区",
        "max_guests": 3,
        "price_per_night": 8500,
        "amenities": ["WiFi", "エアコン", "キッチン", "洗濯機"],
        "house_rules": ["禁煙", "ペット不可", "文化施設利用歓迎"],
        "photos": ["https://example.com/photo8.jpg"]
    },
    {
        "title": "原宿のポップなスタジオ",
        "description": "原宿の中心地にあるカラフルでポップなスタジオ。若い方やファッション好きの方におすすめです。",
        "location": "東京都渋谷区",
        "max_guests": 2,
        "price_per_night": 9500,
        "amenities": ["WiFi", "エアコン", "キッチン", "撮影機材"],
        "house_rules": ["禁煙", "ペット不可", "撮影OK"],
        "photos": ["https://example.com/photo9.jpg"]
    },
    {
        "title": "銀座の高級ホテル風ルーム",
        "description": "銀座の中心地にある高級ホテル風のお部屋。ショッピングやグルメを楽しみたい方に最適です。",
        "location": "東京都中央区",
        "max_guests": 2,
        "price_per_night": 20000,
        "amenities": ["WiFi", "エアコン", "キッチン", "バスタブ", "高級アメニティ"],
        "house_rules": ["禁煙", "ペット不可", "高級感を保ってください"],
        "photos": ["https://example.com/photo10.jpg"]
    },
    {
        "title": "秋葉原のテック系シェアハウス",
        "description": "秋葉原駅から徒歩5分のテクノロジー好きのためのシェアハウス。最新のガジェットや高速インターネットを完備。",
        "location": "東京都千代田区",
        "max_guests": 1,
        "price_per_night": 6000,
        "amenities": ["WiFi", "エアコン", "共用キッチン", "ゲーミングPC", "VR機器"],
        "house_rules": ["禁煙", "ペット不可", "テクノロジー談義歓迎"],
        "photos": ["https://example.com/photo11.jpg"]
    },
    {
        "title": "六本木のインターナショナルアパート",
        "description": "六本木ヒルズ近くのインターナショナルな雰囲気のアパート。外国人の方も多く、国際交流ができます。",
        "location": "東京都港区",
        "max_guests": 3,
        "price_per_night": 14000,
        "amenities": ["WiFi", "エアコン", "キッチン", "洗濯機", "多言語対応"],
        "house_rules": ["禁煙", "ペット不可", "国際交流歓迎"],
        "photos": ["https://example.com/photo12.jpg"]
    },
    {
        "title": "表参道のデザイナーズマンション",
        "description": "表参道のおしゃれなデザイナーズマンション。ファッションやデザインに興味のある方におすすめです。",
        "location": "東京都港区",
        "max_guests": 2,
        "price_per_night": 16000,
        "amenities": ["WiFi", "エアコン", "キッチン", "デザイナー家具", "アート作品"],
        "house_rules": ["禁煙", "ペット不可", "デザインを大切に"],
        "photos": ["https://example.com/photo13.jpg"]
    },
    {
        "title": "池袋のアニメファン向けルーム",
        "description": "池袋駅から徒歩7分のアニメファン向けのお部屋。アニメグッズやマンガが豊富にあります。",
        "location": "東京都豊島区",
        "max_guests": 2,
        "price_per_night": 7000,
        "amenities": ["WiFi", "エアコン", "キッチン", "アニメグッズ", "マンガ"],
        "house_rules": ["禁煙", "ペット不可", "アニメ談義歓迎"],
        "photos": ["https://example.com/photo14.jpg"]
    },
    {
        "title": "神楽坂の和モダンな町家",
        "description": "神楽坂の石畳の街にある和モダンな町家。伝統と現代が融合した空間で特別な滞在を。",
        "location": "東京都新宿区",
        "max_guests": 4,
        "price_per_night": 13000,
        "amenities": ["WiFi", "エアコン", "キッチン", "畳", "茶道具"],
        "house_rules": ["禁煙", "ペット不可", "和の心を大切に"],
        "photos": ["https://example.com/photo15.jpg"]
    },
    {
        "title": "中目黒のカフェ併設ルーム",
        "description": "中目黒の桜並木近くのカフェ併設ルーム。コーヒー好きの方におすすめです。朝食付きプランもあります。",
        "location": "東京都目黒区",
        "max_guests": 2,
        "price_per_night": 11000,
        "amenities": ["WiFi", "エアコン", "カフェ", "コーヒーマシン", "朝食"],
        "house_rules": ["禁煙", "ペット不可", "カフェタイム歓迎"],
        "photos": ["https://example.com/photo16.jpg"]
    },
    {
        "title": "自由が丘のスイーツ好き向けルーム",
        "description": "自由が丘のスイーツ店巡りに最適な立地。お部屋にはスイーツ作りの道具も完備しています。",
        "location": "東京都目黒区",
        "max_guests": 3,
        "price_per_night": 9500,
        "amenities": ["WiFi", "エアコン", "キッチン", "製菓道具", "レシピ本"],
        "house_rules": ["禁煙", "ペット不可", "スイーツ作り歓迎"],
        "photos": ["https://example.com/photo17.jpg"]
    },
    {
        "title": "代官山のセレブ向けペントハウス",
        "description": "代官山の高級住宅街にあるペントハウス。プライベートテラス付きで、特別な滞在をお約束します。",
        "location": "東京都渋谷区",
        "max_guests": 6,
        "price_per_night": 25000,
        "amenities": ["WiFi", "エアコン", "キッチン", "テラス", "ジャグジー", "コンシェルジュ"],
        "house_rules": ["禁煙", "ペット不可", "プライバシー重視"],
        "photos": ["https://example.com/photo18.jpg"]
    },
    {
        "title": "築地の料理好き向けアパート",
        "description": "築地市場近くの料理好きのためのアパート。新鮮な食材を使った料理を楽しめます。調理器具も充実。",
        "location": "東京都中央区",
        "max_guests": 4,
        "price_per_night": 12000,
        "amenities": ["WiFi", "エアコン", "プロ仕様キッチン", "調理器具", "食材配達"],
        "house_rules": ["禁煙", "ペット不可", "料理教室開催可"],
        "photos": ["https://example.com/photo19.jpg"]
    },
    {
        "title": "お台場のベイエリアマンション",
        "description": "お台場の海が見えるベイエリアマンション。東京湾の夜景を楽しみながらリラックスできます。",
        "location": "東京都港区",
        "max_guests": 4,
        "price_per_night": 15000,
        "amenities": ["WiFi", "エアコン", "キッチン", "オーシャンビュー", "バルコニー"],
        "house_rules": ["禁煙", "ペット不可", "夜景を楽しんでください"],
        "photos": ["https://example.com/photo20.jpg"]
    }
]

async def create_sample_data():
    """サンプルデータを作成"""
    db = next(get_db())
    
    try:
        print("サンプルデータの作成を開始します...")
        
        # 既存のホストデータを確認
        existing_hosts = db.query(Host).count()
        if existing_hosts > 0:
            print(f"既に{existing_hosts}件のホストデータが存在します。")
            response = input("既存のデータを削除して新しいデータを作成しますか？ (y/N): ")
            if response.lower() != 'y':
                print("処理を中止しました。")
                return
            
            # 既存のホストデータを削除
            db.query(Host).delete()
            db.commit()
            print("既存のホストデータを削除しました。")
        
        # ユーザーとホストデータを作成
        for i, (user_data, host_data) in enumerate(zip(SAMPLE_USERS, SAMPLE_HOSTS)):
            # ユーザーを作成
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                password_hash="$2b$12$dummy_hash_for_sample_data",  # ダミーハッシュ
                interests=user_data["interests"]
            )
            db.add(user)
            db.flush()  # IDを取得するためにflush
            
            # ホストを作成
            # 利用可能日程を30日分作成
            available_dates = []
            start_date = datetime.now().date()
            for j in range(30):
                date = start_date + timedelta(days=j)
                available_dates.append({
                    "date": date.isoformat(),
                    "available": True,
                    "price": host_data["price_per_night"]
                })
            
            # 物件タイプをランダムに選択
            property_types = ["apartment", "house", "studio", "loft", "townhouse"]
            
            host = Host(
                user_id=user.id,
                title=host_data["title"],
                description=host_data["description"],
                location=host_data["location"],
                property_type=random.choice(property_types),
                max_guests=host_data["max_guests"],
                price_per_night=host_data["price_per_night"],
                amenities=host_data["amenities"],
                house_rules=host_data["house_rules"],
                photos=host_data["photos"],
                available_dates=available_dates,
                is_active=True
            )
            db.add(host)
            
            print(f"作成中... {i+1}/20: {user_data['name']} - {host_data['title']}")
        
        db.commit()
        print("\n✅ サンプルデータの作成が完了しました！")
        print("20人のユーザーと20件のホストデータを作成しました。")
        
    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(create_sample_data())