export class CustomerModal {
  constructor(page) {
    this.page = page;
    // Селекторы для модального окна
    this.modal = '.modal';
    this.typeSelect = 'select[name="type"]';
    this.fullNameInput = 'input[name="full_name"]';
    this.phoneInput = 'input[name="phone"]';
    this.emailInput = 'input[name="email"]';
    this.addressInput = 'input[name="address"]';
    this.saveButton = 'button:has-text("Сохранить")';
    this.cancelButton = 'button:has-text("Отмена")';
    this.closeButton = '.modal .close';
  }

  async waitForModal() {
    await this.page.waitForSelector(this.modal, { state: 'visible' });
  }

  async fillPhysicalCustomer(data) {
    await this.page.selectOption(this.typeSelect, 'physical');
    await this.page.fill(this.fullNameInput, data.fullName);
    await this.page.fill(this.phoneInput, data.phone);
    if (data.email) {
      await this.page.fill(this.emailInput, data.email);
    }
    if (data.address) {
      await this.page.fill(this.addressInput, data.address);
    }
  }

  async fillLegalCustomer(data) {
    await this.page.selectOption(this.typeSelect, 'legal');
    await this.page.fill('input[name="company_name"]', data.companyName);
    await this.page.fill('input[name="inn"]', data.inn);
    await this.page.fill(this.fullNameInput, data.contactPerson);
    await this.page.fill(this.phoneInput, data.phone);
    if (data.address) {
      await this.page.fill(this.addressInput, data.address);
    }
  }

  async save() {
    await this.page.click(this.saveButton);
    await this.page.waitForLoadState('networkidle');
  }

  async close() {
    await this.page.click(this.closeButton);
    await this.page.waitForSelector(this.modal, { state: 'hidden' });
  }
}