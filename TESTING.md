# StayConnect テストガイド

このドキュメントでは、StayConnectアプリケーションのテスト実行方法について説明します。

## テストの種類

### 1. バックエンドテスト（Python/FastAPI）

#### 単体テスト
- **場所**: `backend/tests/`
- **フレームワーク**: pytest
- **カバレッジ**: pytest-cov

#### テスト対象
- 認証システム (`test_auth.py`)
- ユーザー管理API (`test_users.py`)
- 宿主管理API (`test_hosts.py`)
- マッチングアルゴリズム (`test_matching.py`)
- 予約システム (`test_bookings.py`)
- メッセージシステム (`test_messages.py`)

#### 実行方法
```bash
cd backend
python -m pytest tests/ -v --cov=. --cov-report=term-missing --cov-report=html
```

### 2. フロントエンドテスト（React/Next.js）

#### 単体・統合テスト
- **場所**: `frontend/src/**/__tests__/`
- **フレームワーク**: Jest + React Testing Library
- **カバレッジ**: Jest内蔵

#### テスト対象
- UIコンポーネント
- カスタムフック
- コンテキスト（AuthContext）
- ユーティリティ関数

#### 実行方法
```bash
cd frontend
npm test -- --coverage --watchAll=false
```

### 3. E2Eテスト（Cypress）

#### エンドツーエンドテスト
- **場所**: `frontend/cypress/e2e/`
- **フレームワーク**: Cypress

#### テスト対象
- 認証フロー (`auth.cy.ts`)
- 宿主検索フロー (`host-search.cy.ts`)
- 予約フロー (`booking.cy.ts`)

#### 実行方法
```bash
cd frontend
# ヘッドレスモード
npm run cy:run

# インタラクティブモード
npm run cy:open
```

## 一括テスト実行

すべてのテストを一括で実行するには：

```bash
./scripts/run-tests.sh

# E2Eテストも含める場合
./scripts/run-tests.sh --e2e
```

## テストカバレッジ

### バックエンド
- カバレッジレポート: `backend/htmlcov/index.html`
- 目標カバレッジ: 80%以上

### フロントエンド
- カバレッジレポート: `frontend/coverage/lcov-report/index.html`
- 目標カバレッジ: 70%以上

## テストデータ

### テスト用データベース
- バックエンドテストではインメモリSQLiteを使用
- 各テストは独立したデータベースインスタンスを使用

### モックデータ
- `backend/tests/conftest.py`: テスト用フィクスチャ
- `frontend/src/__mocks__/`: モックファイル

## CI/CD統合

### GitHub Actions
```yaml
# .github/workflows/test.yml の例
name: Tests
on: [push, pull_request]
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest tests/ --cov=. --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v1

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm test -- --coverage --watchAll=false
```

## トラブルシューティング

### よくある問題

1. **テストデータベースの問題**
   ```bash
   # データベースをリセット
   rm backend/test.db
   ```

2. **フロントエンドの依存関係エラー**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Cypressの問題**
   ```bash
   cd frontend
   npx cypress verify
   ```

### デバッグ

- バックエンド: `pytest -s -vv tests/test_specific.py::test_function`
- フロントエンド: `npm test -- --verbose ComponentName`
- E2E: `npx cypress run --spec "cypress/e2e/specific.cy.ts"`

## ベストプラクティス

1. **テスト駆動開発（TDD）**
   - 新機能開発前にテストを書く
   - Red-Green-Refactorサイクルを守る

2. **テストの独立性**
   - 各テストは他のテストに依存しない
   - テストデータは各テストで準備・クリーンアップ

3. **意味のあるテスト名**
   - テストが何をテストしているかが明確
   - 失敗時に問題を特定しやすい

4. **適切なアサーション**
   - 期待値と実際の値を明確に比較
   - エラーメッセージが分かりやすい

5. **モックの適切な使用**
   - 外部依存関係はモック
   - テストの実行速度を向上