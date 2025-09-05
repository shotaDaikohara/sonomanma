describe('予約フロー', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('宿主詳細から予約申し込みまでの完全なフロー', () => {
    // 宿主詳細ページへ
    cy.visit('/hosts/1');

    // 予約フォームの入力
    cy.get('[data-testid="booking-form"]').within(() => {
      cy.get('input[name="checkIn"]').type('2024-03-15');
      cy.get('input[name="checkOut"]').type('2024-03-17');
      cy.get('select[name="guests"]').select('2');
      cy.get('textarea[name="message"]').type('よろしくお願いします。楽しみにしています！');
    });

    // 料金計算の確認
    cy.get('[data-testid="total-price"]').should('contain', '¥');
    cy.get('[data-testid="nights-count"]').should('contain', '2泊');

    // 予約リクエスト送信
    cy.get('[data-testid="booking-request-button"]').click();

    // 確認ダイアログ
    cy.get('[data-testid="booking-confirmation"]').should('be.visible');
    cy.get('[data-testid="confirm-booking"]').click();

    // 予約完了ページまたは予約管理ページへリダイレクト
    cy.url().should('match', /\/(bookings|booking-success)/);
    cy.get('[data-testid="booking-success-message"]').should('be.visible');
  });

  it('予約管理ページでの予約確認', () => {
    cy.visit('/bookings');

    // 予約一覧の確認
    cy.get('[data-testid="booking-item"]').should('have.length.greaterThan', 0);

    // 今後の予約タブ
    cy.get('[data-testid="upcoming-bookings-tab"]').click();
    cy.get('[data-testid="booking-item"]').each(($booking) => {
      cy.wrap($booking).within(() => {
        cy.get('[data-testid="booking-status"]').should('be.visible');
        cy.get('[data-testid="check-in-date"]').should('be.visible');
        cy.get('[data-testid="host-name"]').should('be.visible');
      });
    });
  });

  it('予約詳細ページでの操作', () => {
    cy.visit('/bookings');
    
    // 最初の予約をクリック
    cy.get('[data-testid="booking-item"]').first().click();
    
    // 予約詳細ページ
    cy.url().should('include', '/bookings/');
    cy.get('[data-testid="booking-details"]').should('be.visible');

    // メッセージ送信
    cy.get('[data-testid="message-button"]').click();
    cy.get('[data-testid="message-input"]').type('追加の質問があります');
    cy.get('[data-testid="send-message"]').click();

    // メッセージが送信されたことを確認
    cy.get('[data-testid="message-sent"]').should('be.visible');
  });

  it('予約キャンセル', () => {
    cy.visit('/bookings');
    
    // キャンセル可能な予約を選択
    cy.get('[data-testid="booking-item"]').first().within(() => {
      cy.get('[data-testid="cancel-booking"]').click();
    });

    // キャンセル確認ダイアログ
    cy.get('[data-testid="cancel-confirmation"]').should('be.visible');
    cy.get('[data-testid="cancel-reason"]').select('予定変更');
    cy.get('[data-testid="confirm-cancel"]').click();

    // キャンセル完了の確認
    cy.get('[data-testid="cancel-success"]').should('be.visible');
    cy.get('[data-testid="booking-status"]').should('contain', 'キャンセル');
  });

  it('無効な日程での予約エラー', () => {
    cy.visit('/hosts/1');

    // 過去の日付で予約を試行
    cy.get('[data-testid="booking-form"]').within(() => {
      cy.get('input[name="checkIn"]').type('2023-01-01');
      cy.get('input[name="checkOut"]').type('2023-01-03');
    });

    cy.get('[data-testid="booking-request-button"]').click();

    // エラーメッセージの確認
    cy.get('[data-testid="date-error"]').should('be.visible');
    cy.get('[data-testid="date-error"]').should('contain', '過去の日付');
  });

  it('既に予約済みの日程での予約エラー', () => {
    cy.visit('/hosts/1');

    // 既に予約済みの日程で予約を試行
    cy.get('[data-testid="booking-form"]').within(() => {
      cy.get('input[name="checkIn"]').type('2024-03-01');
      cy.get('input[name="checkOut"]').type('2024-03-03');
    });

    cy.get('[data-testid="booking-request-button"]').click();

    // エラーメッセージの確認
    cy.get('[data-testid="availability-error"]').should('be.visible');
    cy.get('[data-testid="availability-error"]').should('contain', '既に予約済み');
  });
});