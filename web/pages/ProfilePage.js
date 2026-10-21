// Страница "Профиль" (/profile) — редактирование собственного аккаунта администратора.
class ProfilePage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: /Редактировать профиль/ });
    this.emailInput = page.locator('input[type="text"]').first();
    this.passwordInput = page.locator('input[type="password"]');
    this.rolesInput = page.locator('input[type="search"]').first();

    this.saveButton = page.getByRole('button', { name: 'Сохранить', exact: true });
    this.saveAndCloseButton = page.getByRole('button', { name: 'Сохранить и закрыть' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });
  }

  async goto() {
    await this.page.goto('/profile');
    await this.heading.waitFor({ timeout: 30000 });
    // значение email подгружается асинхронно после рендера формы
    await this.page.waitForFunction(() => {
      const el = document.querySelector('input[type="text"]');
      return el && el.value.length > 0;
    }, null, { timeout: 30000 });
  }
}

module.exports = { ProfilePage };
