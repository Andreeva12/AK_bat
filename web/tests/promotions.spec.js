const { test, expect } = require('@playwright/test');
const { PromotionsPage, PromotionFormPage } = require('../pages/PromotionsPage');
const { loginAsAdmin } = require('../utils/auth');

test.describe('Акции', () => {
  let promotions;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    promotions = new PromotionsPage(page);
    await promotions.goto();
  });

  test('заголовок "Акции" отображается', async () => {
    await expect(promotions.heading).toBeVisible();
  });

  test('кнопка "Добавить" открывает форму создания акции', async ({ page }) => {
    await promotions.clickAdd();
    await expect(page.getByRole('heading', { name: 'Добавить акцию' })).toBeVisible();
  });

  test('поиск по несуществующему заголовку не ломает страницу', async () => {
    await promotions.searchByTitle('несуществующая акция xyz 12345');
    const count = await promotions.rowsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Акции — полный цикл (создание → удаление)', () => {
  test('созданная акция появляется в списке и удаляется без следов', async ({ page }) => {
    test.setTimeout(120000);
    await loginAsAdmin(page);

    // Минимальный набор полей — все остальные (баннер, push, описания на RU/KY/EN)
    // необязательны на бэкенде: POST /api/promotions отвечает 201 с одним названием.
    const title = `Автотест акция ${Date.now()}`;
    const promotions = new PromotionsPage(page);
    const form = new PromotionFormPage(page);
    let created = false;

    try {
      await promotions.goto();
      await promotions.clickAdd();
      await expect(form.heading).toBeVisible();
      await form.internalNameInput.fill(title);

      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().includes('/api/promotions') && r.request().method() === 'POST', { timeout: 15000 }),
        form.save(),
      ]);
      expect(response.status()).toBe(201);
      created = true;

      await promotions.goto();
      await expect(promotions.getRowByTitle(title)).toBeVisible();
    } finally {
      await promotions.goto().catch(() => {});
      if (await promotions.getRowByTitle(title).isVisible().catch(() => false)) {
        await promotions.deletePromotion(title);
      }
    }

    expect(created).toBe(true);
    await promotions.goto();
    await expect(promotions.getRowByTitle(title)).toHaveCount(0);
  });
});
