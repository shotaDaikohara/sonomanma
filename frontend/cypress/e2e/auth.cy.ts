describe('認証フロー', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('ユーザー登録からログインまでの完全なフロー', () => {
    // ホームページから登録ページへ
    cy.get('[data-testid="register-button"]').click();
    cy.url().should('include', '/register');

    // ユーザー登録フォームの入力
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('input[name="fullName"]').type('テストユーザー');

    // 興味関心の選択
    cy.get('[data-testid="interest-旅行"]').click();
    cy.get('[data-testid="interest-料理"]').click();
    cy.get('[data-testid="interest-音楽"]').click();

    // 登録ボタンをクリック
    cy.get('button[type="submit"]').click();

    // 登録成功後、ダッシュボードにリダイレクト
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'テストユーザー');
  });

  it('ログインフロー', () => {
    // ログインページへ
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/login');

    // ログインフォームの入力
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // ログイン成功後、ダッシュボードにリダイレクト
    cy.url().should('include', '/dashboard');
  });

  it('無効な認証情報でのログイン失敗', () => {
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // エラーメッセージの表示
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('ログアウトフロー', () => {
    // まずログイン
    cy.login('test@example.com', 'password123');
    
    // ログアウト
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();

    // ホームページにリダイレクト
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});