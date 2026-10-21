const { test, expect } = require('@playwright/test');
const { ProductsPage } = require('../pages/products.page');
const { ProductFormPage } = require('../pages/productform.page');
const { loginAsAdmin } = require('../utils/auth');

// Полный жизненный цикл товара — то, чего не хватало в чек-листе ("редактирование и
// удаление"): создание → редактирование заголовка и цены → проверка сохранения → удаление.
test.describe('Товар — полный цикл (создание → редактирование → удаление)', () => {
  test('созданный товар можно отредактировать, а затем удалить без следов', async ({ page }) => {
    test.setTimeout(180000);
    await loginAsAdmin(page);

    const stamp = Date.now();
    const title = `Автотест цикл ${stamp}`;
    const editedTitle = `Автотест цикл ${stamp} (изм.)`;
    const products = new ProductsPage(page);
    const form = new ProductFormPage(page);
    let currentTitle = title;

    try {
      // 1. создание (приложение остаётся на форме — успех подтверждаем ответом API)
      await products.goto();
      await products.clickAdd();
      await form.fillBasicInfo({ price: 111, title });
      await form.selectCategory('Готовая продукция');
      const created = await form.saveAndWaitForApi();
      expect(created.status()).toBe(200);
      const productId = (await created.json()).data.id;
      expect(productId).toBeGreaterThan(0);

      // 2. редактирование заголовка и цены на странице /edit-product/:id
      await page.goto(`/edit-product/${productId}`);
      await expect(form.heading).toBeVisible();
      await expect(form.titleInput).toHaveValue(title);
      await form.titleInput.fill(editedTitle);
      await form.titleKyInput.fill(editedTitle);
      await form.titleEnInput.fill(editedTitle);
      await form.priceInput.fill('222');
      currentTitle = editedTitle;
      const edited = await form.saveAndWaitForApi();
      expect(edited.status()).toBeLessThan(300);

      // 3. изменения сохранились — открываем страницу редактирования заново
      await page.goto(`/edit-product/${productId}`);
      await expect(form.titleInput).toHaveValue(editedTitle);
      await expect(form.priceInput).toHaveValue(/^222(\.0+)?$/);

      // 4. товар находится в списке по новому заголовку
      await page.goto('/products');
      await products.searchByTitleWithButton(editedTitle);
      await expect(await products.getRowByTitle(editedTitle)).toBeVisible();
    } finally {
      // уборка выполняется при любом исходе теста
      await products.cleanupByTitle(currentTitle).catch(() => {});
      if (currentTitle !== title) await products.cleanupByTitle(title).catch(() => {});
    }

    // 5. после удаления товара в списке нет
    await page.goto('/products');
    await products.searchByTitleWithButton(editedTitle);
    await expect(await products.getRowByTitle(editedTitle)).toHaveCount(0);
  });
});
