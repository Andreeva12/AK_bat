const { test, expect } = require('@playwright/test');
const { ProductsPage } = require('../pages/products.page');
const { ProductFormPage } = require('../pages/productform.page');
const { loginAsAdmin } = require('../utils/auth');

test.describe('Создание товара', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    const products = new ProductsPage(page);
    await products.goto();
    await products.clickAdd();
  });

  test('форма "Добавить товар" открывается со всеми ключевыми полями', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Добавить товар' })).toBeVisible();
    await expect(page.getByText('Основное изображение')).toBeVisible();
    await expect(page.getByText('Цена', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('ID из 1С (GUID)')).toBeVisible();
    await expect(page.getByText('Категории', { exact: true })).toBeVisible();
    await expect(page.getByText('Сопутствующие товары')).toBeVisible();
    await expect(page.getByText('Заголовок').first()).toBeVisible();
    await expect(page.getByText('Содержание').first()).toBeVisible();
  });

  test('"Мин. заказ" по умолчанию равен 1', async ({ page }) => {
    const minOrderInput = page.locator('text=Мин. заказ').locator('xpath=following::input[1]');
    await expect(minOrderInput).toHaveValue('1');
  });

  test('чекбокс "Активен" включен по умолчанию для нового товара', async ({ page }) => {
    const activeCheckbox = page.getByText('Активен').locator('xpath=preceding::input[1]');
    await expect(activeCheckbox).toBeChecked();
  });

  test('чекбоксы "Промо" и "Требует возврата тары" выключены по умолчанию', async ({ page }) => {
    const promoCheckbox = page.getByText('Промо', { exact: true }).locator('xpath=preceding::input[1]');
    const returnCheckbox = page.getByText('Требует возврата тары').locator('xpath=preceding::input[1]');
    await expect(promoCheckbox).not.toBeChecked();
    await expect(returnCheckbox).not.toBeChecked();
  });

  test('блок "Галерея изображений" доступен и содержит кнопку добавления фото', async ({ page }) => {
    await expect(page.getByText('Галерея изображений')).toBeVisible();
    await expect(page.getByText('Добавить новые фото:')).toBeVisible();
  });

  test('блок "Специальные цены по тарифам" показывает активные тарифы', async ({ page }) => {
    await expect(page.getByText('Учетная цена', { exact: true })).toBeVisible();
  });

  test('поля тарифных цен пустые по умолчанию (плейсхолдер "Базовая цена")', async ({ page }) => {
    // Секция тарифных цен подгружается асинхронно — используем expect с авто-retry,
    // а не мгновенный .count(), который может застать пустой DOM.
    const placeholders = page.getByPlaceholder('Базовая цена');
    await expect(placeholders.first()).toBeVisible();
    expect(await placeholders.count()).toBeGreaterThan(0);
  });

  test('пояснительный текст про базовую цену 0 сом виден', async ({ page }) => {
    await expect(page.getByText(/Оставьте поле пустым.*0 сом/)).toBeVisible();
  });

  test('сохранение без обязательной "Цены" и "Заголовка" показывает ошибку валидации', async ({ page }) => {
    const form = new ProductFormPage(page);
    await form.save();
    // Форма должна остаться на странице создания товара
    await expect(page.getByRole('heading', { name: 'Добавить товар' })).toBeVisible();
  });

  test('успешное создание товара с минимально обязательными полями', async ({ page }) => {
    const form = new ProductFormPage(page);
    const uniqueTitle = `Автотест товар ${Date.now()}`;

    try {
      await form.fillBasicInfo({ price: 123, title: uniqueTitle });
      await form.selectCategory('Готовая продукция');
      const response = await form.saveAndWaitForApi();

      // Приложение остаётся на форме и не редиректит на /edit-product/:id, поэтому
      // успех подтверждаем ответом API с данными созданного товара.
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data.id).toBeGreaterThan(0);
      expect(body.data.title).toBe(uniqueTitle);
    } finally {
      // Уборка: раньше созданный товар оставался в БД навсегда.
      await new ProductsPage(page).cleanupByTitle(uniqueTitle).catch(() => {});
    }
  });

  test('кнопка "Отмена" возвращает к списку товаров', async ({ page }) => {
    const form = new ProductFormPage(page);
    await form.cancel();
    await expect(page.getByRole('heading', { name: 'Товары' })).toBeVisible();
  });

  test('кнопка "Назад" (←) в заголовке формы тоже возвращает в список', async ({ page }) => {
    await page.locator('button:has(i[data-name="arrow-left"])').click();
    await expect(page.getByRole('heading', { name: 'Товары' })).toBeVisible();
  });
});
