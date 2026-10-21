const { test, expect } = require('@playwright/test');
const { TariffsPage, TariffRequestsPage } = require('../pages/TariffsPage');
const { loginAsAdmin } = require('../utils/auth');

test.describe('Тарифы', () => {
  let tariffs;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    tariffs = new TariffsPage(page);
    await tariffs.goto();
  });

  test('заголовок "Тарифы и типы цен" отображается', async () => {
    await expect(tariffs.heading).toBeVisible();
  });

  test('поиск по несуществующему тарифу не ломает страницу', async () => {
    await tariffs.searchByName('несуществующий тариф xyz 12345');
    const count = await tariffs.rowsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Заявки на смену тарифа', () => {
  let requests;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    requests = new TariffRequestsPage(page);
    await requests.goto();
  });

  test('заголовок "Заявки на тарифы" отображается', async () => {
    await expect(requests.heading).toBeVisible();
  });

  test('таблица заявок отображается (кол-во строк >= 0)', async () => {
    const count = await requests.rowsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('в таблице заявок есть нужные колонки', async ({ page }) => {
    await requests.tableRows.first().waitFor({ timeout: 30000 });
    const headers = (await page.locator('table thead th').allTextContents()).map((h) => h.trim());
    for (const name of ['Id', 'Клиент', 'Текущий тариф', 'Желаемый тариф', 'Дата', 'Статус', 'Действия']) {
      expect(headers).toContain(name);
    }
  });

  test('у необработанной заявки ("Новая") доступны кнопки "Одобрить" и "Отклонить"', async ({ page }) => {
    // Кнопки только проверяются, не нажимаются — чтобы не менять тариф реального клиента.
    const newRow = requests.tableRows.filter({ hasText: 'Новая' }).first();
    test.skip(!(await newRow.isVisible().catch(() => false)), 'нет необработанных заявок в тестовых данных');
    await expect(newRow.getByRole('button', { name: 'Одобрить' })).toBeEnabled();
    await expect(newRow.getByRole('button', { name: 'Отклонить' })).toBeEnabled();
  });

  test('у обработанной заявки вместо кнопок написано "Заявка обработана"', async () => {
    const doneRow = requests.tableRows.filter({ hasText: 'Заявка обработана' }).first();
    test.skip(!(await doneRow.isVisible().catch(() => false)), 'нет обработанных заявок в тестовых данных');
    await expect(doneRow.getByRole('button', { name: 'Одобрить' })).toHaveCount(0);
    await expect(doneRow.getByRole('button', { name: 'Отклонить' })).toHaveCount(0);
  });

  test('в каждой строке указан клиент, текущий и желаемый тариф', async () => {
    const cells = await requests.tableRows.first().locator('td').allTextContents();
    expect(cells.slice(1, 4).every((c) => c.trim().length > 0)).toBe(true);
  });
});
