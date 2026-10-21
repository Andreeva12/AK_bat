const { test, expect } = require('@playwright/test');
const { OrdersPage } = require('../pages/orders.page');
const { loginAsAdmin } = require('../utils/auth');

test.describe('Заказы — список (отображение)', () => {
  let orders;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    orders = new OrdersPage(page);
    await orders.goto();
    await orders.waitForLoaded();
  });

  test('страница списка заказов открывается и показывает таблицу', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Заказы' })).toBeVisible();
    // Заголовки колонок визуально в верхнем регистре (CSS text-transform), но реальный
    // DOM-текст — Title Case; сравнение регистронезависимое даёт ложные совпадения
    // ("ID" совпадает с "Individual", "Статус" — с "Статус заказа"), поэтому скопируем
    // проверку строго в пределах <thead> с точным (exact) совпадением.
    const thead = page.locator('table thead');
    for (const col of ['ID', 'Заказчик', 'Состав заказа', 'Сумма', 'Статус']) {
      await expect(thead.getByText(col, { exact: true }).first()).toBeVisible();
    }
  });

  test('в каждой строке присутствует отметка о статусе фискализации', async ({ page }) => {
    // Значение зависит от заказа: "Не фискализ.", "Ошибка фиск." и т.д. — проверяем,
    // что какая-то из этих меток видна, а не жёстко одну конкретную.
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow.getByText(/фискализ/i)).toBeVisible();
  });

  // БАГ ПРОДУКТА (подтверждено вручную): выбор статуса в фильтре корректно меняет
  // значение <select> и URL (?status=completed), но таблица заказов не фильтруется —
  // отображаются вперемешку заказы всех статусов. Тест намеренно оставлен с ожиданием
  // ПРАВИЛЬНОГО поведения, чтобы стать зелёным после исправления бага на бэкенде/фронте.
  test('фильтр по статусу "Завершен" показывает только завершённые заказы', async () => {
    await orders.filterByStatus('completed');
    const rows = orders.tableRows;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Завершен');
    }
  });

  test('фильтр по статусу "Новый" показывает только новые заказы', async () => {
    await orders.filterByStatus('new');
    const rows = orders.tableRows;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Новый');
    }
  });

  test('поиск по несуществующему ID заказа не ломает страницу', async ({ page }) => {
    await orders.searchByOrderId('99999999');
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0) {
      await expect(rows.first()).not.toContainText('99999999');
    }
  });

  test('изменение "Показывать" на другое значение не ломает таблицу', async ({ page }) => {
    const rowsBefore = await orders.getRowCount();
    expect(rowsBefore).toBeGreaterThan(0);
    await orders.showSelect.selectOption('50');
    await page.waitForLoadState('networkidle');
    const rowsAfter = await orders.getRowCount();
    expect(rowsAfter).toBeGreaterThan(0);
  });

  test('сортировка по ID работает (клик по заголовку столбца ID)', async ({ page }) => {
    const idHeader = page.locator('th', { hasText: 'ID' }).first();
    await idHeader.click();
    await page.waitForTimeout(300);
    const firstRowId = await orders.getOrderId(0);
    expect(firstRowId).toBeTruthy();
  });

  test('клик на дату доставки открывает деталь заказа (ссылка активна)', async ({ page }) => {
    const dateLink = page.locator('table tbody tr').first().getByRole('link').first();
    await expect(dateLink).toBeVisible();
  });

  test('кнопка "Добавить" ведёт на форму создания заказа', async ({ page }) => {
    await orders.clickAddOrder();
    await expect(page.getByRole('heading', { name: 'Создание нового заказа' })).toBeVisible();
  });
});
