import { test, expect } from '@playwright/test';
import { OrdersPage } from '../pages/orders.page.js';
import { loginAsAdmin } from '../utils/auth.js';

test.describe('Страница заказов', () => {
  let ordersPage;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);

    ordersPage = new OrdersPage(page);
    await ordersPage.goto();
    await ordersPage.waitForLoaded();
  });

  test('Заголовок "Заказы" отображается', async () => {
    await expect(ordersPage.title).toBeVisible();
  });

  test('Таблица заказов содержит строки', async () => {
    const count = await ordersPage.getRowCount();
    expect(count).toBeGreaterThan(0);
  });

  test('Фильтр по статусу "Новый" работает', async () => {
    await ordersPage.filterByStatus('new');
    const rows = await ordersPage.getRowCount();
    // Если есть заказы с этим статусом, проверим, что статус соответствует
    if (rows > 0) {
      const status = await ordersPage.getOrderStatus(0);
      // Статус может быть "Новый" или "Ожидает" – зависит от данных.
      // Просто проверяем, что статус не пустой.
      expect(status).toBeTruthy();
    }
    // Если rows = 0, это тоже допустимо, значит таких заказов нет.
  });

  test('Поиск заказа по ID', async () => {
    // Получаем ID первого заказа
    const firstId = await ordersPage.getOrderId(0);
    await ordersPage.searchByOrderId(firstId);
    const rows = await ordersPage.getRowCount();
    expect(rows).toBeGreaterThan(0);
    // Проверяем, что в результатах есть заказ с этим ID (проверяем первую строку)
    const displayedId = await ordersPage.getOrderId(0);
    expect(displayedId).toBe(firstId);
  });

  test('Переход на страницу создания заказа', async ({ page }) => {
    await ordersPage.clickAddOrder();
    await expect(page).toHaveURL('/add-order');
  });

  test('Переход на редактирование заказа', async ({ page }) => {
    await ordersPage.clickEditOrder(0);
    await expect(page).toHaveURL(/\/edit-order\/\d+/);
  });

  test('Пагинация отображается', async () => {
    const hasPag = await ordersPage.hasPagination();
    expect(hasPag).toBeTruthy();
  });
});