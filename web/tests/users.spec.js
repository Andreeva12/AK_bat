const { test, expect } = require('@playwright/test');
const { UsersPage, UserFormPage } = require('../pages/UsersPage');
const { loginAsAdmin, REQUIRED_FIELD_TEXT } = require('../utils/auth');

test.describe('Пользователи (админ-раздел) — список', () => {
  let users;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    users = new UsersPage(page);
    await users.goto();
  });

  test('страница открывается с нужными колонками', async () => {
    await expect(users.heading).toBeVisible();
    const headers = (await users.columnHeaders.allTextContents()).map((h) => h.trim());
    for (const name of ['Id', 'ФИО', 'Email', 'Роли', 'Телефон', 'Тип', 'Действия']) {
      expect(headers).toContain(name);
    }
  });

  test('таблица не пуста и у пользователя указана роль', async () => {
    expect(await users.rowsCount()).toBeGreaterThan(0);
    const firstRoles = await users.tableRows.first().locator('td').nth(3).textContent();
    expect(firstRoles.trim().length).toBeGreaterThan(0);
  });

  test('поиск по email существующего пользователя ничего не находит (дефект)', async () => {
    // ДЕФЕКТ: запрос `where=email(like)%<email>%;type(=)employee,courier` возвращает пустой
    // список, хотя этот пользователь есть в общем списке. Тест фиксирует ТЕКУЩЕЕ поведение:
    // когда баг починят, он упадёт — это сигнал заменить проверку на "строка найдена".
    const email = (await users.tableRows.first().locator('td').nth(2).textContent()).trim();
    await users.searchByEmail(email);
    await users.page.waitForTimeout(1500);
    await expect(users.getRowByEmail(email)).toHaveCount(0);
  });

  test('поиск по несуществующему email не ломает страницу', async () => {
    await users.searchByEmail('нет-такого-пользователя-xyz12345@example.com');
    await expect(users.heading).toBeVisible();
    expect(await users.rowsCount()).toBeGreaterThanOrEqual(0);
  });

  test('в строке есть иконка удаления', async () => {
    const deleteButtons = users.tableRows.first().locator('button[data-bs-target="#list-delete-modal"]');
    await expect(deleteButtons).toHaveCount(1);
  });

  test('кнопка "Добавить" открывает форму создания пользователя', async ({ page }) => {
    await users.addButton.click();
    await expect(page).toHaveURL(/\/add-user/);
    await expect(page.getByRole('heading', { name: 'Добавить пользователя' })).toBeVisible();
  });
});

test.describe('Пользователи (админ-раздел) — форма', () => {
  let form;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    form = new UserFormPage(page);
    await form.goto();
  });

  test('форма содержит поля ФИО, Email, Пароль, Телефон, Роли (обязательные помечены *)', async ({ page }) => {
    for (const label of ['ФИО', 'Email', 'Пароль', 'Телефон', 'Роли']) {
      await expect(page.locator('label', { hasText: label }).first()).toBeVisible();
    }
    await expect(page.locator('label', { hasText: 'ФИО' }).first()).toContainText('*');
    await expect(page.locator('label', { hasText: 'Роли' }).first()).toContainText('*');
  });

  test('сохранение пустой формы не создаёт пользователя', async ({ page }) => {
    await form.saveAndClose();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/add-user/);
    await expect(page.getByText(REQUIRED_FIELD_TEXT).first()).toBeVisible();
  });

  test('⚠️ пароль при создании обязателен, хотя поле не помечено *', async ({ page }) => {
    // Особенность формы: у "Пароля" нет звёздочки, но пустой пароль даёт ошибку валидации.
    await form.fill({ fio: 'Автотест', email: `autotest_nopass_${Date.now()}@example.com`, phone: '+996555000222' });
    await form.selectRole('courier');
    await form.saveAndClose();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/add-user/);
    await expect(page.getByText(REQUIRED_FIELD_TEXT).first()).toBeVisible();
  });

  test('кнопка "Отмена" возвращает к списку пользователей', async ({ page }) => {
    await form.cancelButton.click();
    await expect(page.getByRole('heading', { name: 'Пользователи' })).toBeVisible();
  });
});

test.describe('Пользователи (админ-раздел) — полный цикл', () => {
  test('созданный пользователь появляется в списке и удаляется без следов', async ({ page }) => {
    test.setTimeout(150000);
    await loginAsAdmin(page);

    const email = `autotest_user_${Date.now()}@example.com`;
    const form = new UserFormPage(page);
    const users = new UsersPage(page);
    let created = false;

    try {
      await form.goto();
      await form.fill({ fio: 'Автотест Пользователь', email, password: 'AutoTest#12345', phone: '+996555000111' });
      await form.selectRole('courier');
      await form.saveAndClose();

      await users.heading.waitFor({ timeout: 30000 });
      await users.searchByEmail(email);
      await expect(users.getRowByEmail(email)).toBeVisible();
      created = true;
    } finally {
      // уборка при любом исходе — иначе упавший тест оставит пользователя в БД
      await users.goto().catch(() => {});
      await users.searchByEmail(email).catch(() => {});
      if (await users.getRowByEmail(email).isVisible().catch(() => false)) {
        await users.deleteUser(email);
      }
    }

    expect(created).toBe(true);
    await users.goto();
    await users.searchByEmail(email);
    await expect(users.getRowByEmail(email)).toHaveCount(0);
  });
});
