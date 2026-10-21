import { test, expect } from '@playwright/test';

test('Успешный вход в админку', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  //  заголовок на странице логина
  await expect(page.locator('h2:has-text("Ак-бата")')).toBeVisible();

  //  логин и пароль
  await page.fill('input[name="login"]', process.env.ADMIN_LOGIN);
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD);

  //   "Войти"
  await page.click('.btn.btn-primary.w-100');

  //
  await expect(page).toHaveURL('/', { timeout: 15000 });

  //   заголовок "Главная"
  await expect(page.locator('h1:has-text("Главная")')).toBeVisible({ timeout: 10000 });
});

test('Вход с неверным паролем', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('h2:has-text("Ак-бата")')).toBeVisible();

  await page.fill('input[name="login"]', process.env.ADMIN_LOGIN);
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.click('.btn.btn-primary.w-100');


  const errorMessage = page.locator('.toastify-error, .toast-error, .alert-danger, .text-danger, .error-message');

  await expect(errorMessage).toBeVisible({ timeout: 5000 }).catch(() => {

    expect(page.url()).toContain('/login');
  });


  await expect(page).toHaveURL('/login');
});

test('Вход с пустыми полями', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  //  кнопку, не заполняя поля
  await page.click('.btn.btn-primary.w-100');

  //  появилось сообщение об ошибке
  const errorMessage = page.locator('.toastify-error, .toast-error, .alert-danger, .text-danger, .error-message');

  if (await errorMessage.isVisible({ timeout: 2000 })) {
    await expect(errorMessage).toBeVisible();
  } else {

    await expect(page).toHaveURL('/login');
  }


  await expect(page).toHaveURL('/login');
});