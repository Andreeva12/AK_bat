const { test, expect } = require('@playwright/test');
const { ServicesPage } = require('../pages/Services.page');
const { loginAsAdmin } = require('../utils/auth');

test.describe('Услуги (Доплаты)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    const services = new ServicesPage(page);
    await services.goto();
  });

  test('страница открывается с нужными колонками', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Услуги (Доплаты)' })).toBeVisible();
    for (const col of ['ID', 'Ключ', 'Заголовок', 'Цена', 'Акт.', 'Действия']) {
      await expect(page.getByText(col, { exact: true })).toBeVisible();
    }
  });

  test('известная услуга "lift" — цена 10 с', async ({ page }) => {
    const row = page.locator('table tbody tr').filter({ hasText: 'lift' });
    await expect(row).toContainText('10');
  });

  // Цена изменилась с 350 на 300 сом между прогонами (реальные данные, не баг теста) —
  // если тест снова упадёт на числе, сверьте актуальную цену в /edit-service/2.
  test('известная услуга "damaged_bottle" — цена 300 с', async ({ page }) => {
    const row = page.locator('table tbody tr').filter({ hasText: 'damaged_bottle' });
    await expect(row).toContainText('300');
  });

  test('обе услуги по умолчанию активны', async ({ page }) => {
    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('⚠️ (дефект) поиск по заголовку не фильтрует список услуг', async ({ page }) => {
    // Подтверждено напрямую через API: GET /api/services?where=title(like)%Damaged%
    // возвращает те же 2 услуги, что и без фильтра — бэкенд игнорирует where. Тот же
    // класс бага, что и в категориях и в поиске пользователей по email. Тест фиксирует
    // текущее поведение: обе услуги остаются в списке после «поиска».
    const services = new ServicesPage(page);
    await services.searchByTitle('damaged_bottle');
    await expect(page.locator('table tbody tr').filter({ hasText: 'lift' })).toBeVisible();
    await expect(page.locator('table tbody tr').filter({ hasText: 'damaged_bottle' })).toBeVisible();
  });

  test('значения цены отображаются с суффиксом "с" (сом)', async ({ page }) => {
    const row = page.locator('table tbody tr').filter({ hasText: 'lift' });
    await expect(row).toContainText('10 с');
  });

  test('клик на заголовок услуги ведёт на форму редактирования', async ({ page }) => {
    const row = page.locator('table tbody tr').filter({ hasText: 'lift' });
    await row.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/edit-service\/\d+/);
  });

  // Форма редактирования только читается — "lift" и "damaged_bottle" используются в
  // реальной логике доплат приложения, менять их значения автотестом рискованно.
  test('форма редактирования услуги открывается с заполненными полями', async ({ page }) => {
    const row = page.locator('table tbody tr').filter({ hasText: 'lift' });
    await row.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/edit-service\/\d+/);
    await expect(page.getByRole('heading', { name: /Обновить услугу/ })).toBeVisible();
    await expect(page.getByText('Системный ключ')).toBeVisible();
    await expect(page.getByText('Цена', { exact: false })).toBeVisible();
    await expect(page.getByText('Название услуги')).toBeVisible();
    const inputs = page.locator('input[type="text"], input[type="number"]');
    await expect(inputs.nth(0)).toHaveValue('lift');
    await expect(inputs.nth(1)).toHaveValue('10');
    await expect(page.locator('input[type="checkbox"]')).toBeChecked();
  });
});
