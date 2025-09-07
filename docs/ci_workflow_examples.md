# CI ワークフロー例

目的: 各チームの PR マージ時に必須チェックを自動化し、統合の安全性を高めるための CI ワークフロー例。

前提
- GitHub Actions を想定
- CI マトリクス: python 3.11 (backend), node 18 (frontend)

ワークフロー: pull_request.yml（概要）
1. トリガー: pull_request 対象ブランチ: main, feat/*, develop
2. ジョブ:
  - backend-tests:
    - runs-on: ubuntu-latest
    - steps:
      - checkout
      - set up python 3.11
      - install dependencies (backend/requirements.txt)
      - run pytest tests/ --cov
      - upload coverage
  - frontend-tests:
    - runs-on: ubuntu-latest
    - steps:
      - checkout
      - set up node 18
      - install (pnpm install)
      - run lint, build, jest
  - integration-e2e (optional, slower):
    - runs-on: ubuntu-latest
    - needs: [backend-tests, frontend-tests]
    - steps:
      - checkout
      - start backend (uvicorn) in background
      - start frontend (next) in background
      - run cypress run --headless

必須チェック
- backend-tests は必須。カバレッジが低すぎる場合は fail を検討
- schema check: openapi スキーマの差分がないかを検査。API 変更がある場合は PR に schema 更新を求める

デプロイ用ワークフロー（main ブランチへマージ時）
1. build コンテナイメージ
2. run unit tests
3. push image to registry
4. deploy to staging と最小限の smoke test
5. 承認後に production deploy

着手テンプレート: .github/workflows/pull_request.yml に貼り付け可能な簡易テンプレ

```yaml
name: PR checks
on: [pull_request]
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install deps
        run: |
          cd backend
          python -m venv .venv
          source .venv/bin/activate
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          source .venv/bin/activate
          pytest tests/ -q --cov
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install frontend deps
        run: |
          cd frontend
          pnpm install --frozen-lockfile
      - name: Run frontend tests
        run: |
          cd frontend
          pnpm test --silent
``` 

注意点
- CI 上では SQLite の file lock を避けるため、DB は :memory: を使うか Postgres サービスを追加する
- secrets には HF_TOKEN, DOCKER_REGISTRY, DEPLOY_KEY 等を設定

