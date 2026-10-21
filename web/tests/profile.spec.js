const { test, expect } = require('@playwright/test');
const { ProfilePage } = require('../pages/ProfilePage');
const { loginAsAdmin } = require('../utils/auth');

// Тесты только читают профиль и не сохраняют форму — чтобы не менять/не ломать
// пароль и роли тестового администратора, под которым идут все остальные тесты.
test.describe('Профиль', () => {
  let profile;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    profile = new ProfilePage(page);
    await profile.goto();
  });

  test('страница открывается с заголовком "Редактировать профиль #<id>"', async () => {
    await expect(profile.heading).toBeVisible();
    await expect(profile.heading).toContainText(/#\d+/);
  });

  test('в поле Email указан логин текущего администратора', async () => {
    await expect(profile.emailInput).toHaveValue(process.env.ADMIN_LOGIN);
  });

  test('поле пароля пустое по умолчанию (пароль не подставляется)', async () => {
    await expect(profile.passwordInput).toHaveValue('');
  });

  test('подписи полей: Email *, Пароль, Роли', async ({ page }) => {
    await expect(page.locator('label', { hasText: 'Email' }).first()).toContainText('*');
    await expect(page.locator('label', { hasText: 'Пароль' }).first()).toBeVisible();
    await expect(page.locator('label', { hasText: 'Роли' }).first()).toBeVisible();
  });

  test('видны кнопки "Сохранить", "Сохранить и закрыть", "Отмена"', async () => {
    await expect(profile.saveButton).toBeVisible();
    await expect(profile.saveAndCloseButton).toBeVisible();
    await expect(profile.cancelButton).toBeVisible();
  });

  test('ссылка "Профиль" в меню пользователя ведёт на /profile', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: process.env.ADMIN_LOGIN }).click();
    await page.getByRole('link', { name: 'Профиль' }).click();
    await expect(page).toHaveURL(/\/profile/);
  });
});
