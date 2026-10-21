class ProductsPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Товары' });
    // "Добавить" на странице списка товаров — это ссылка (<a href="/add-product">), не <button>.
    this.addButton = page.getByRole('link', { name: 'Добавить' });

    this.titleSearchInput = page.getByPlaceholder('Введите заголовок');
    this.searchButton = page.locator('button:has(svg)').first();

    // Все три — нативные <select>, найдены по стабильным классам-обёрткам.
    // "Категория" подгружает свои <option> асинхронно после первого рендера, поэтому
    // выбирать значение нужно только после того, как список опций реально заполнился.
    this.perPageSelect = page.locator('.top-limit select');
    this.categorySelect = page.locator('.top-category select');
    this.activitySelect = page.locator('.top-active select');

    this.categoryLabels = {
      all: 'Все категории',
      readyProducts: 'Готовая продукция',
      materials: 'Материалы',
      dispensers: 'Диспенсеры',
      services: 'Услуги',
      relatedProducts: 'Сопутствующие товары',
    };

    this.activityLabels = {
      all: 'Все',
      active: 'Актив.',
      inactive: 'Неактив.',
    };

    this.tableRows = page.locator('table tbody tr');
  }

  // Прямой переход по URL: навигация через раскрывающийся сайдбар (hover по "Магазин")
  // давала нестабильные таймауты, а сам переход из сайдбара проверяет dashboard.spec.js.
  async goto() {
    await this.page.goto('/products');
    await this.heading.waitFor({ timeout: 30000 });
  }

  async searchByTitle(title) {
    await this.titleSearchInput.fill(title);
    await this.page.keyboard.press('Enter');
  }

  async filterByCategory(categoryKey) {
    await this.page.waitForFunction(() => {
      const select = document.querySelector('.top-category select');
      return select && select.options.length > 1;
    });
    await this.categorySelect.selectOption({ label: this.categoryLabels[categoryKey] });
    await this.page.waitForLoadState('networkidle');
  }

  async filterByActivity(activityKey) {
    await this.activitySelect.selectOption({ label: this.activityLabels[activityKey] });
    await this.page.waitForLoadState('networkidle');
  }

  async clickAdd() {
    await this.addButton.click();
  }

  async getRowByTitle(title) {
    return this.page.locator('table tbody tr').filter({ hasText: title }).first();
  }

  async editProduct(title) {
    const row = await this.getRowByTitle(title);
    await row.locator('a:has(svg), button:has(svg)').first().click();
  }

  async deleteProduct(title) {
    const row = await this.getRowByTitle(title);
    await row.locator('a:has(svg), button:has(svg)').last().click();
  }

  async toggleActive(title) {
    const row = await this.getRowByTitle(title);
    await row.locator('input[type="checkbox"]').click();
  }

  async rowsCount() {
    return this.tableRows.count();
  }

  // Поиск на списке товаров, как и на категориях/пользователях, запускается кнопкой-лупой.
  async searchByTitleWithButton(title) {
    await this.titleSearchInput.fill(title);
    // Ждём именно ответ отфильтрованного запроса (where=...like...), иначе проверка
    // строк может увидеть ещё не отфильтрованный список.
    await Promise.all([
      this.page.waitForResponse(
        (r) => r.url().includes('/api/products') && decodeURIComponent(r.url()).includes('(like)'),
        { timeout: 30000 },
      ),
      this.page.locator('button.input-group-text').click(),
    ]);
    await this.page.waitForLoadState('networkidle');
  }

  // Удаление с подтверждением в модалке "Удалить навсегда".
  async deleteProductConfirmed(title) {
    const row = await this.getRowByTitle(title);
    await row.locator('button[data-bs-target="#list-delete-modal"]').click();
    const confirm = this.page.getByRole('button', { name: 'Удалить навсегда' });
    await confirm.waitFor({ state: 'visible', timeout: 10000 });
    // Удаление — POST /api/products/:id (204); ждём его завершения, иначе следующая
    // проверка списка может увидеть ещё не удалённую строку.
    await Promise.all([
      this.page.waitForResponse(
        (r) => /\/api\/products\/\d+$/.test(new URL(r.url()).pathname) && r.request().method() !== 'GET',
        { timeout: 30000 },
      ),
      confirm.click(),
    ]);
  }

  // Уборка тестовых данных: ищет товар по заголовку и удаляет, если он есть.
  async cleanupByTitle(title) {
    await this.page.goto('/products');
    await this.heading.waitFor({ timeout: 30000 });
    await this.searchByTitleWithButton(title);
    const row = await this.getRowByTitle(title);
    if (await row.isVisible().catch(() => false)) {
      await this.deleteProductConfirmed(title);
      await this.page.waitForLoadState('networkidle');
    }
  }
}

module.exports = { ProductsPage };