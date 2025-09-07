# 宿主一覧画面（Host Listings）ドキュメント

対象ファイル: `docs/index.html`（宿主一覧 UI の抜粋）

概要
- モバイル幅を想定した宿泊マッチングの宿主一覧画面。複数のホストカードがリスト表示され、各カードをタップすると詳細モーダルが表示される構成。
- フロントエンド上の主要要素: マッチ率、評価、ロケーション、宿泊可能日、マッチ理由、タグ（興味関心）

表示コンポーネント（カード単位）
- Avatar（左側丸アイコン）
  - 表示例: 名前の一部（田中 / 佐藤 など）を背景カラーの丸で表示
- Host name（例: 田中 花子）
- Match rate（例: "98%マッチ"）
  - 強調表示（`match-rate` クラス、緑グラデーション）
- Rating（星アイコン + 数値、例: 4.9）
- Location summary（例: 渋谷駅徒歩5分 • 1K アパート）
- Available dates（バッジ群）
  - 例: `12/23-25 (年末)`, `1/6-8 (週末)` 等のテキストバッジ
- Match reason（`match-reason`）
  - AI によるマッチング解説文（趣味の一致・立地などの短い説明）
- Interest tags（小さなタグ群、絵文字付き）
- Card interaction
  - カード全体がクリック可能（onclick="showHostDetails('hostX')"）で詳細モーダルを開く

ホスト詳細モーダル（`#host-details-modal`）
- 表示内容
  - 大きめの Avatar / 名前 / ロケーション / 総合評価（レビュー数付き）
  - カレンダービュー（`.calendar-day` クラスで日付を色分け: available / partially-available）
  - 自己紹介（テキスト）
  - 興味関心・設備・宿泊についての詳細ブロック
  - アクションボタン: 友達申請（sendFriendRequest）、お気に入り追加（addToFavorites）
- カレンダー
  - 日付セルに `available` / `partially-available` クラスで視覚化
  - クリックで日付選択→予約フローに接続する想定

ページ内ナビゲーションとタブ
- サインアップ画面（`#signup-screen`）→ 完了後 Search tab を表示
- タブは DOM 上で `tab-content` を切り替える方式（`active` クラスで表示制御）
- 下部固定ナビ（4 ボタン）で MyPage / Search / Chat / Reviews を切り替え

UX / 実装上の観察点
- カード上のマッチ理由は長文になる可能性あり。行数制限や折りたたみが必要。
- 画像ではなくイニシャルでのアバター表示。実運用では avatar URL を取り扱う API を用意する。
- カレンダーは静的 HTML で埋められているが、実際は host の availability API を参照して動的に描画する必要がある。
- カードクリックで `showHostDetails('host1')` のように ID を渡しているため、フロントは各カードにホストIDを紐付ける必要がある。

提案する API マッピング（サンプル）
- GET /api/hosts?location=&max_guests=&skip=&limit=
  - レスポンス: HostResponse[]
    - HostResponse: { id, name, avatar_url?, match_rate, rating, review_count, location_summary, short_description, interest_tags: string[], available_badges: string[] }
- GET /api/hosts/{host_id}
  - レスポンス: HostDetailResponse
    - HostDetailResponse: { id, name, avatar_url, location, rating, review_count, bio, interest_tags, amenities, availability: [{ date, status }], photos: string[] }
- POST /api/bookings
  - ボディ: { host_id, check_in, check_out, guests_count, message }
  - レスポンス: BookingResponse
- POST /users/{user_id}/favorites or POST /api/hosts/{host_id}/favorite
  - アクション: お気に入り登録
- POST /api/friends/requests
  - ボディ: { from_user_id, to_host_id, message }

アクセシビリティ・パフォーマンスの注意点
- 画像の遅延読み込み（lazy loading）と代替テキスト
- 長いリストは仮想化（infinite scroll / windowing）で性能対策
- 色だけで情報を伝えない（class に aria-label や tooltip を付与）

短期改善案（ハッカソン向け即効）
- カード内の "Match reason" を 3 行程度に制限し、"続きを読む" を付与
- カレンダーは最初は月 1 表示で良いが、availability を API から取得する仕組みを追加
- クリックで詳細モーダルを開いた際に、API から HostDetail を遅延ロードする（初期は軽量データ）

備考
- このドキュメントは `docs/index.html` の宿主一覧画面構造を元に作成しました。実装時はフロントとバックエンドで API スキーマを合わせ、認証/レートリミット/キャッシュの要件を決めてください。
