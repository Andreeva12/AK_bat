// pages/customers.page.js
export class CustomersPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('h1:has-text("Покупатели")');
    this.table = page.locator('table');
    this.tableRows = this.table.locator('tbody tr');
    this.searchInput = page.locator('input.form-control[type="text"]').first();
    this.filterButton = page.locator('button:has-text("Фильтровать")');
    this.resetButton = page.locator('button:has-text("Сбросить")');
    this.addButton = page.locator('a.dt-button.btn-primary.btn-add-record');
    this.exportButton = page.locator('button:has-text("Экспортировать Excel")');
    this.sendButton = page.locator('button:has-text("Отправить рассылку")');
    this.physicalTab = page.getByText('Физ. лица', { exact: true });
    this.legalTab = page.getByText('Юр. лица', { exact: true });
  }

  async goto() {
    await this.page.goto('/customers');
    await this.page.waitForURL(/customers/);
    await this.title.waitFor({ state: 'visible', timeout: 30000 });
    await this.addButton.waitFor({ state: 'visible', timeout: 30000 });
  }

  async filterByFio(fio) {
    await this.searchInput.fill(fio);
    await this.filterButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByPhone(phone) {
    await this.searchInput.fill(phone);
    await this.filterButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickAdd() {
    await this.addButton.click();
    await this.page.waitForURL(/physical-users\/add/);
  }

  async deleteFirstRow() {
    const row = this.tableRows.first();
    const deleteBtn = row.locator('button[data-bs-target="#list-delete-modal"]');
    await deleteBtn.click();
    await this.page.locator('#list-delete-modal').waitFor({ state: 'visible' });
    await this.page.locator('#list-delete-modal button:has-text("Удалить навсегда")').click();
    await this.page.waitForLoadState('networkidle');
    await this.page.locator('#list-delete-modal').waitFor({ state: 'hidden' });
  }

  async getFirstRowPhone() {
    const row = this.tableRows.first();
    return await row.locator('td').nth(3).textContent();
  }

  async rowsCount() {
    return await this.tableRows.count();
  }
}