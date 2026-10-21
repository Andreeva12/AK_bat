export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('h1:has-text("Главная")');
    this.statsTitle = page.locator('h4:has-text("Статистика")');
    this.statsCard = page.locator('h4:has-text("Статистика")').locator('..').locator('..');
    this.totalSales = this.statsCard.locator('h4').nth(0); // первая цифра
    this.revenueMonth = this.statsCard.locator('h4').nth(1); // вторая цифра
    this.legalClients = this.statsCard.locator('h4').nth(2);
    this.physicalClients = this.statsCard.locator('h4').nth(3);
    this.usersThisMonth = this.statsCard.locator('h4').nth(4);
    this.totalProducts = this.statsCard.locator('h4').nth(5);
    // Блок активных пользователей
    this.activeUsersTitle = page.locator('h4:has-text("Активные пользователи")');
    this.activeUsersTable = this.activeUsersTitle.locator('..').locator('..').locator('table');
    // Блок заказов пользователей (диаграмма)
    this.ordersChartTitle = page.locator('h4:has-text("Заказы пользователей")');
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForLoaded() {
    await this.title.waitFor({ state: 'visible' });
  }

  async getTotalSalesText() {
    return this.totalSales.textContent();
  }

  async getRevenueText() {
    return this.revenueMonth.textContent();
  }

  async getActiveUsersCount() {
    const rows = this.activeUsersTable.locator('tbody tr');
    return await rows.count();
  }
}