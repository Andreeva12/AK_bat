class TariffsPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Тарифы и типы цен' });
    this.searchInput = page.getByPlaceholder('Поиск по названию...');
    this.typeFilter = page.getByText('Все типы');
    this.statusFilter = page.locator('text=Все').last();

    this.tableRows = page.locator('table tbody tr');
  }

  // Прямой переход по URL вместо hover по сайдбару (см. products.page.js).
  async goto() {
    await this.page.goto('/price-types');
    await this.heading.waitFor({ timeout: 30000 });
  }

  async searchByName(name) {
    await this.searchInput.fill(name);
    await this.page.keyboard.press('Enter');
  }

  async getRowByName(name) {
    return this.page.locator('table tbody tr').filter({ hasText: name }).first();
  }

  async toggleActive(name) {
    const row = await this.getRowByName(name);
    await row.locator('input[type="checkbox"]').click();
  }

  async rowsCount() {
    return this.tableRows.count();
  }
}

class TariffRequestsPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Заявки на тарифы' });
    this.sortSelect = page.getByText('Новые');

    this.tableRows = page.locator('table tbody tr');
  }

  // Прямой переход по URL вместо hover по сайдбару (см. products.page.js).
  async goto() {
    await this.page.goto('/tariff-requests');
    await this.heading.waitFor({ timeout: 30000 });
  }

  async getRowByClientPhone(phone) {
    return this.page.locator('table tbody tr').filter({ hasText: phone }).first();
  }

  async approveRequest(phone) {
    const row = await this.getRowByClientPhone(phone);
    await row.getByRole('button', { name: 'Одобрить' }).click();
  }

  async rejectRequest(phone) {
    const row = await this.getRowByClientPhone(phone);
    await row.getByRole('button', { name: 'Отклонить' }).click();
  }

  async expectProcessedStatusText(phone) {
    const row = await this.getRowByClientPhone(phone);
    return row.getByText('Заявка обработана');
  }

  async rowsCount() {
    return this.tableRows.count();
  }
}

module.exports = { TariffsPage, TariffRequestsPage };