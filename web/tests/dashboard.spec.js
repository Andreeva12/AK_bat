import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page.js';
import { loginAsAdmin } from '../utils/auth.js';

test.describe('Главная (дашборд)', () => {
  let dashboard;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);

    dashboard = new DashboardPage(page);
    await dashboard.waitForLoaded();
  });

  test('заголовок "Главная" отображается после входа', async () => {
    await expect(dashboard.title).toBeVisible();
  });

  test('блок "Статистика" виден', async () => {
    await expect(dashboard.statsTitle).toBeVisible();
  });

  test('блок "Активные пользователи" виден', async () => {
    await expect(dashboard.activeUsersTitle).toBeVisible();
  });

  test('блок "Заказы пользователей" (диаграмма) виден', async () => {
    await expect(dashboard.ordersChartTitle).toBeVisible();
  });

  test('переход в раздел "Заказы" из сайдбара', async ({ page }) => {
    await page.getByRole('link', { name: 'Заказы' }).click();
    await expect(page).toHaveURL(/\/orders/);
  });
});
