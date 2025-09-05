// カスタムコマンドの型定義
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      createTestUser(): Chainable<void>;
      createTestHost(): Chainable<void>;
    }
  }
}

// ログインコマンド
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
  });
});

// ログアウトコマンド
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

// テストユーザー作成コマンド
Cypress.Commands.add('createTestUser', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      full_name: 'テストユーザー',
      interests: ['旅行', '料理', '音楽']
    }
  });
});

// テスト宿主作成コマンド
Cypress.Commands.add('createTestHost', () => {
  cy.request({
    method: 'POST',
    url: '/api/hosts',
    body: {
      title: 'テスト宿主',
      description: 'テスト用の宿主です',
      location: '東京都渋谷区',
      price_per_night: 10000,
      max_guests: 2,
      amenities: ['WiFi', 'キッチン'],
      house_rules: ['禁煙'],
      available_from: '2024-01-01',
      available_to: '2024-12-31'
    },
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('access_token')}`
    }
  });
});

export {};