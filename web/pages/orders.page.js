// pages/orders.page.js
export class OrdersPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('h1:has-text("Заказы")');
    this.table = page.locator('table');
    this.tableRows = this.table.locator('tbody tr');
    this.showSelect = page.locator('select').first();
    // точный селектор для фильтра статуса по атрибуту name
    this.statusFilter = page.locator('select').nth(1)
    this.searchInput = page.locator('input[placeholder="ID заказа"]');
    this.searchButton = page.locator('.input-group button');
    this.addOrderButton = page.locator('a.dt-button.btn-primary.btn-add-record');
    this.pagination = page.locator('.pagination');
  }

  async goto() {
    await this.page.goto('/orders');
  }

  async waitForLoaded() {
    await this.title.waitFor({ state: 'visible' });
    await this.table.waitFor({ state: 'visible' });
  }

  async getRowCount() {
    return await this.tableRows.count();
  }

  async filterByStatus(statusValue) {
    // Опции фильтра статуса подгружаются асинхронно после первого рендера —
    // ждём, пока список реально заполнится, иначе selectOption может сработать
    // до готовности Vue-модели и фильтр молча не применится.
    await this.page.waitForFunction(() => {
      const select = document.querySelectorAll('select')[1];
      return select && select.options.length > 1;
    });
    await this.statusFilter.selectOption(statusValue);
    await this.page.waitForLoadState('networkidle');
    await this.table.waitFor({ state: 'visible' });
  }

  async searchByOrderId(orderId) {
    await this.searchInput.fill(orderId);
    // нажимаем Enter
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddOrder() {
    await this.addOrderButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickEditOrder(rowIndex = 0) {
    const row = this.tableRows.nth(rowIndex);
    const editLink = row.locator('a[href^="/edit-order/"]').filter({ has: this.page.locator('i[data-name="edit"]') });
    await editLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickDeleteOrder(rowIndex = 0) {
    const row = this.tableRows.nth(rowIndex);
    const deleteBtn = row.locator('button[data-bs-target="#list-delete-modal"]');
    await deleteBtn.click();
    await this.page.locator('#list-delete-modal').waitFor({ state: 'visible' });
    await this.page.locator('#list-delete-modal button:has-text("Удалить")').click();
    await this.page.waitForLoadState('networkidle');
  }

  async getOrderStatus(rowIndex = 0) {
    const row = this.tableRows.nth(rowIndex);
    // Берем первый div в ячейке статуса (индекс 6)
    const statusDiv = row.locator('td').nth(6).locator('div').first();
    return await statusDiv.textContent();
  }

  async getOrderId(rowIndex = 0) {
    const row = this.tableRows.nth(rowIndex);
    return await row.locator('td').nth(0).textContent();
  }

  async hasPagination() {
    return await this.pagination.isVisible();
  }
}