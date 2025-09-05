describe('宿主検索フロー', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.visit('/search');
  });

  it('基本的な宿主検索', () => {
    // 検索フィルターの入力
    cy.get('input[placeholder="場所を検索"]').type('東京');
    cy.get('input[name="checkIn"]').type('2024-03-01');
    cy.get('input[name="checkOut"]').type('2024-03-03');
    cy.get('select[name="guests"]').select('2');

    // 検索実行
    cy.get('[data-testid="search-button"]').click();

    // 検索結果の確認
    cy.get('[data-testid="host-card"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="search-results-count"]').should('contain', '件の宿主が見つかりました');
  });

  it('フィルターを使用した詳細検索', () => {
    // 価格フィルター
    cy.get('[data-testid="price-filter"]').within(() => {
      cy.get('input[name="minPrice"]').clear().type('5000');
      cy.get('input[name="maxPrice"]').clear().type('15000');
    });

    // 設備フィルター
    cy.get('[data-testid="amenity-WiFi"]').check();
    cy.get('[data-testid="amenity-キッチン"]').check();

    // 並び順変更
    cy.get('select[name="sortBy"]').select('price');

    // フィルター適用
    cy.get('[data-testid="apply-filters"]').click();

    // フィルター結果の確認
    cy.get('[data-testid="host-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        // 価格が範囲内であることを確認
        cy.get('[data-testid="price"]').invoke('text').then((priceText) => {
          const price = parseInt(priceText.replace(/[^\d]/g, ''));
          expect(price).to.be.at.least(5000);
          expect(price).to.be.at.most(15000);
        });
      });
    });
  });

  it('宿主詳細ページへの遷移', () => {
    // 最初の宿主カードをクリック
    cy.get('[data-testid="host-card"]').first().within(() => {
      cy.get('[data-testid="view-details"]').click();
    });

    // 詳細ページに遷移
    cy.url().should('include', '/hosts/');
    cy.get('[data-testid="host-title"]').should('be.visible');
    cy.get('[data-testid="host-description"]').should('be.visible');
    cy.get('[data-testid="booking-form"]').should('be.visible');
  });

  it('お気に入り機能', () => {
    // お気に入りボタンをクリック
    cy.get('[data-testid="host-card"]').first().within(() => {
      cy.get('[data-testid="favorite-button"]').click();
    });

    // お気に入りに追加されたことを確認
    cy.get('[data-testid="favorite-button"]').should('have.class', 'text-red-500');

    // マイページでお気に入りを確認
    cy.visit('/profile');
    cy.get('[data-testid="favorites-tab"]').click();
    cy.get('[data-testid="favorite-host"]').should('have.length.greaterThan', 0);
  });

  it('検索結果なしの場合', () => {
    // 存在しない場所で検索
    cy.get('input[placeholder="場所を検索"]').clear().type('存在しない場所');
    cy.get('[data-testid="search-button"]').click();

    // 結果なしメッセージの確認
    cy.get('[data-testid="no-results"]').should('be.visible');
    cy.get('[data-testid="no-results"]').should('contain', '宿主が見つかりませんでした');
  });
});