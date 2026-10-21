export class CustomerFormPage {
  constructor(page) {
    this.page = page;

    // Заголовок
    this.title = page.locator('h1:has-text("Добавить покупателя")');

    // Поля ввода
    this.fioInput = page.locator('label.form-label:has-text("ФИО")').locator('xpath=..').locator('input');
    this.phoneInput = page.locator('label.form-label:has-text("Телефон")').locator('xpath=..').locator('input');
    this.emailInput = page.locator('label.form-label:has-text("Email")').locator('xpath=..').locator('input');
    this.passwordInput = page.locator('label.form-label:has-text("Пароль")').locator('xpath=..').locator('input');

    // v-select компоненты
    this.priceTypeSelect = page.locator('label.form-label:has-text("Тип цены")').locator('xpath=..').locator('.v-select');
    this.accessStatusSelect = page.locator('label.form-label:has-text("Статус доступа")').locator('xpath=..').locator('.v-select');

    // Кнопки
    this.saveButton = page.getByRole('button', { name: 'Сохранить' });
    this.saveAndCloseButton = page.getByRole('button', { name: 'Сохранить и закрыть' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });

    this.invalidValueToast = page.locator('.toastify-error:has-text("Выбранное значение некорректно.")');

    // Табы
    this.tabs = {
      params: page.getByRole('button', { name: 'Параметры' }),
      orders: page.getByRole('button', { name: 'Заказы' }),
      addresses: page.getByRole('button', { name: 'Адреса' }),
      bonuses: page.getByRole('button', { name: 'Бонусы' }),
      prices: page.getByRole('button', { name: 'Цены' }),
    };

    this.ordersEmptyText = page.locator('text=Ничего не найдено');
    this.bonusHistoryEmptyText = page.locator('text=Ничего не найдено');
    this.changeBalanceButton = page.getByRole('button', { name: 'Изменить баланс' });
  }

  async fillRequired({ fio, phone }) {
    if (fio) await this.fioInput.fill(fio);
    if (phone) await this.phoneInput.fill(phone);
  }

  async fillEmail(email) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  // Универсальный
  async selectOption(selectLocator, optionText) {
    const input = selectLocator.locator('input.vs__search');
    await input.click();
    //  появления списка опций
    const option = this.page.locator('li.vs__dropdown-option', { hasText: optionText }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  async selectPriceType(optionText) {
    await this.selectOption(this.priceTypeSelect, optionText);
  }

  async selectAccessStatus(optionText) {
    await this.selectOption(this.accessStatusSelect, optionText);
  }

  async save() {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async saveAndClose() {
    await this.saveAndCloseButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async openTab(tabName) {
    await this.tabs[tabName].click();
    await this.page.waitForLoadState('networkidle');
  }

  async getEmailValue() {
    return await this.emailInput.inputValue();
  }

  async clearEmail() {
    await this.emailInput.fill('');
  }
}