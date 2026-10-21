class UsersPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Пользователи' });
    this.addButton = page.getByRole('link', { name: 'Добавить' });
    this.emailSearchInput = page.getByPlaceholder('Введите email');
    // Как и на категориях, поиск запускает только кнопка-лупа (Enter не работает).
    this.searchButton = page.locator('button.input-group-text');

    this.tableRows = page.locator('table tbody tr');
    this.columnHeaders = page.locator('table thead th');

    this.deleteConfirmButton = page.getByRole('button', { name: 'Удалить навсегда' });
  }

  async goto() {
    await this.page.goto('/users');
    await this.heading.waitFor({ timeout: 30000 });
    await this.tableRows.first().waitFor({ timeout: 30000 });
  }

  async searchByEmail(email) {
    await this.emailSearchInput.fill(email);
    await Promise.all([
      this.page.waitForResponse(
        (r) => r.url().includes('/api/users') && decodeURIComponent(r.url()).includes('(like)'),
        { timeout: 30000 },
      ),
      this.searchButton.click(),
    ]);
    await this.page.waitForLoadState('networkidle');
  }

  getRowByEmail(email) {
    return this.tableRows.filter({ hasText: email }).first();
  }

  async deleteUser(email) {
    await this.getRowByEmail(email).locator('button[data-bs-target="#list-delete-modal"]').click();
    await this.deleteConfirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await Promise.all([
      this.page.waitForResponse(
        (r) => /\/api\/users\/\d+$/.test(new URL(r.url()).pathname) && r.request().method() !== 'GET',
        { timeout: 30000 },
      ),
      this.deleteConfirmButton.click(),
    ]);
  }

  async rowsCount() {
    return this.tableRows.count();
  }
}

class UserFormPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: /Добавить пользователя|Редактировать пользователя/ });

    // Поля по порядку в форме: ФИО, Email, Пароль, Телефон, Роли (vue-select с поиском).
    this.fioInput = page.locator('input[type="text"]').nth(0);
    this.emailInput = page.locator('input[type="text"]').nth(1);
    this.passwordInput = page.locator('input[type="password"]');
    this.phoneInput = page.locator('input[type="text"]').nth(2);
    this.rolesInput = page.locator('input[type="search"]').first();
    this.roleOptions = page.locator('.vs__dropdown-option');

    this.saveButton = page.getByRole('button', { name: 'Сохранить', exact: true });
    this.saveAndCloseButton = page.getByRole('button', { name: 'Сохранить и закрыть' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });
  }

  async goto() {
    await this.page.goto('/add-user');
    await this.heading.waitFor({ timeout: 30000 });
  }

  async fill({ fio, email, password, phone }) {
    if (fio !== undefined) await this.fioInput.fill(fio);
    if (email !== undefined) await this.emailInput.fill(email);
    if (password !== undefined) await this.passwordInput.fill(password);
    if (phone !== undefined) await this.phoneInput.fill(phone);
  }

  async selectRole(roleName) {
    await this.rolesInput.click();
    await this.roleOptions.first().waitFor({ state: 'visible', timeout: 10000 });
    await this.roleOptions.filter({ hasText: roleName }).first().click();
    // После выбора выпадающий список остаётся раскрытым и перекрывает кнопки формы.
    await this.page.keyboard.press('Escape');
  }

  async saveAndClose() {
    await this.saveAndCloseButton.click();
  }
}

module.exports = { UsersPage, UserFormPage };
