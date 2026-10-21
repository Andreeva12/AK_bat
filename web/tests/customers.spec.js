import { test, expect } from '@playwright/test';
import { CustomersPage } from '../pages/customers.page.js';
import { CustomerFormPage } from '../pages/customerForm.page.js';
import { loginAsAdmin } from '../utils/auth.js';

test.describe('Покупатели — Физ. лица', () => {
  let customers;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);

    customers = new CustomersPage(page);
    await customers.goto();
  });

  test('таб "Юр. лица" переключает контент таблицы', async ({ page }) => {
    await page.getByText('Юр. лица', { exact: true }).click();
    await expect(page.getByText('НАЗВАНИЕ КОМПАНИИ')).toBeVisible();
  });

  test('фильтр по ФИО возвращает релевантный результат', async ({ page }) => {
    await customers.filterByFio('Камчыбеков');
    await expect(page.locator('table tbody tr').first()).toContainText('Камчыбеков');
  });

  test('кнопки "Экспортировать Excel" и "Отправить рассылку" видны', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Экспортировать Excel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Отправить рассылку' })).toBeVisible();
  });

  test('кнопка "Сбросить" очищает примененные фильтры', async ({ page }) => {
    await customers.filterByFio('Камчыбеков');
    await customers.resetButton.click();
    const count = await customers.rowsCount();
    expect(count).toBeGreaterThan(1);
  });
});

test.describe('Покупатели — форма "Добавить покупателя"', () => {
  let customers;
  let form;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);

    customers = new CustomersPage(page);
    await customers.goto();
    await customers.clickAdd();
    form = new CustomerFormPage(page);
  });




  test('успешное создание покупателя со всеми обязательными полями + удаление', async ({ page }) => {
      const timestamp = Date.now();
      const uniquePhone = `+99655${Math.floor(1000000 + Math.random() * 8999999)}`;
      const uniqueName = `Auto test ${timestamp}`;
      const uniqueEmail = `auto_test_${timestamp}@akbata.fun`;
      const password = '123456789';

      await form.fillRequired({ fio: uniqueName, phone: uniquePhone });
      await form.fillEmail(uniqueEmail);
      await form.fillPassword(password);
      await form.selectPriceType('Учетная цена');
      await form.selectAccessStatus('Активен'); // проверьте, какая опция в интерфейсе
      await form.saveAndClose();

      //  /customers
      await page.waitForURL(/customers/, { timeout: 15000 });

      //  фильтр по телефону
      await customers.filterByPhone(uniquePhone);

      const row = page.locator('table tbody tr', { hasText: uniquePhone });
      await expect(row).toBeVisible();

      // Удаляить
      await customers.deleteFirstRow();

      // Проверка, что удалилось
      await customers.filterByPhone(uniquePhone);
      await expect(page.locator('table tbody tr', { hasText: uniquePhone })).not.toBeVisible();
    });

    test('кнопка "Отмена" возвращает в список покупателей', async ({ page }) => {
      await page.getByRole('button', { name: 'Отмена' }).click();
      await expect(page.getByRole('heading', { name: 'Пользователи' })).toBeVisible();
    });
  });