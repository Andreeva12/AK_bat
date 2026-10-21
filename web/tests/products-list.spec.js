const { test, expect } = require('@playwright/test');
const { ProductsPage } = require('../pages/products.page');
const { loginAsAdmin } = require('../utils/auth');

test.describe('Товары — список', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    const products = new ProductsPage(page);
    await products.goto();
  });

  test('страница списка товаров открывается с нужными колонками', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Товары' })).toBeVisible();
    for (const col of ['Id', 'Заголовок', 'Категория', 'Цена', 'Изображение', 'Поз.', 'Акт.', 'Действия']) {
      await expect(page.getByText(col, { exact: true })).toBeVisible();
    }
  });

  test('известный товар виден с верной категорией и ценой', async ({ page }) => {
    await page.getByPlaceholder('Введите заголовок').fill('YL 1635S-W white color');
    await page.keyboard.press('Enter');
    const row = page.locator('table tbody tr').filter({ hasText: 'YL 1635S-W white color' });
    await expect(row).toContainText('Диспенсеры');
    await expect(row).toContainText('15000');
  });

  test('фильтр по категории "Диспенсеры" показывает только диспенсеры', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.filterByCategory('dispensers');

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Диспенсеры');
    }
  });

  test('фильтр по категории "Услуги" показывает только услуги', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.filterByCategory('services');

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Услуги');
    }
  });

  test('дропдаун категорий содержит все ожидаемые категории + "Все категории"', async ({ page }) => {
    const products = new ProductsPage(page);
    await page.waitForFunction(() => {
      const select = document.querySelector('.top-category select');
      return select && select.options.length > 1;
    });
    const options = await products.categorySelect.locator('option').allTextContents();
    expect(options.map((t) => t.trim())).toEqual([
      'Все категории', 'Готовая продукция', 'Материалы',
      'Диспенсеры', 'Услуги', 'Сопутствующие товары',
    ]);
  });

  test('фильтр активности "Актив." скрывает неактивные товары', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.filterByActivity('active');

    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('поиск по несуществующему товару не ломает страницу', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.searchByTitle('Несуществующий товар XYZ 12345');

    const count = await page.locator('table tbody tr').count();
    const notFoundVisible = await page.getByText(/не найдено|нет данных/i).isVisible().catch(() => false);
    expect(count === 0 || notFoundVisible).toBeTruthy();
  });

  test('кнопка "Добавить" открывает форму создания товара', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.clickAdd();
    await expect(page.getByRole('heading', { name: 'Добавить товар' })).toBeVisible();
  });

  test('переключение чекбокса "Акт." у товара меняет его статус активности', async ({ page }) => {
    const row = page.locator('table tbody tr').first();
    const checkbox = row.locator('input[type="checkbox"]');
    const initialState = await checkbox.isChecked();

    await checkbox.click();
    await page.waitForTimeout(300);
    const newState = await checkbox.isChecked();

    expect(newState).toBe(!initialState);

    // Возвращаем исходное состояние, чтобы тест не оставлял side-effect в данных
    await checkbox.click();
  });

  test('иконки редактирования и удаления присутствуют в каждой строке', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow.locator('a:has(svg), button:has(svg)')).toHaveCount(2);
  });
});
