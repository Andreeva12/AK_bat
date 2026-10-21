class ServicesPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Услуги (Доплаты)' });

    this.perPageSelect = page.locator('select').first();
    this.titleSearchInput = page.getByPlaceholder('Введите заголовок');
    this.searchButton = page.locator('button:has(svg)').first();
    this.statusFilter = page.getByText('Все', { exact: true });

    this.tableRows = page.locator('table tbody tr');
  }

  // Прямой переход по URL: навигация через раскрывающийся сайдбар (hover по "Магазин")
  // давала нестабильные таймауты, а сам переход из сайдбара проверяет dashboard.spec.js.
  async goto() {
    await this.page.goto('/services');
    await this.heading.waitFor({ timeout: 30000 });
  }

  async searchByTitle(title) {
    await this.titleSearchInput.fill(title);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async getRowByKey(key) {
    return this.page.locator('table tbody tr').filter({ hasText: key }).first();
  }

  async editService(key) {
    const row = await this.getRowByKey(key);
    await row.locator('a:has(svg), button:has(svg)').first().click();
  }

  async toggleActive(key) {
    const row = await this.getRowByKey(key);
    await row.locator('input[type="checkbox"]').click();
  }

  async rowsCount() {
    return this.tableRows.count();
  }
}

module.exports = { ServicesPage };