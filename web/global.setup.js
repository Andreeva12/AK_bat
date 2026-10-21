require('dotenv').config();
const { test: setup, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/login.page');

const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

setup('authenticate as admin', async ({ page }) => {
  if (!ADMIN_LOGIN || !ADMIN_PASSWORD) {
    throw new Error(
      'ADMIN_LOGIN / ADMIN_PASSWORD не заданы. Создайте .env на основе .env.example'
    );
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(ADMIN_LOGIN, ADMIN_PASSWORD);

  // Признак успешного логина — переход на главную и видимость сайдбара
  await expect(page.getByText('Главная')).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: '.auth/admin.json' });
});