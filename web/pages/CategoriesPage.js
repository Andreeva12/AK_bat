class CategoriesPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Категории товаров' });
    // Как и на товарах/акциях, "Добавить" — это ссылка (<a href="/add-category">).
    this.addButton = page.getByRole('link', { name: 'Добавить' });
    this.titleSearchInput = page.getByPlaceholder('Введите заголовок');
    this.searchButton = page.locator('button.input-group-text');
    this.perPageSelect = page.locator('select').first();

    this.tableRows = page.locator('table tbody tr');
    this.columnHeaders = page.locator('table thead th');

    this.deleteConfirmButton = page.getByRole('button', { name: 'Удалить навсегда' });
    this.deleteCancelButton = page.getByRole('button', { name: 'Отменить' });
  }

  async goto() {
    await this.page.goto('/categories');
    await this.heading.waitFor({ timeout: 30000 });
    await this.tableRows.first().waitFor({ timeout: 30000 });
  }

  async searchByTitle(title) {
    await this.titleSearchInput.fill(title);
    // Enter поиск не запускает — работает только кнопка-лупа рядом с полем.
    await Promise.all([
      this.page.waitForResponse(
        (r) => r.url().includes('/api/categories') && decodeURIComponent(r.url()).includes('(like)'),
        { timeout: 30000 },
      ),
      this.searchButton.click(),
    ]);
    await this.page.waitForLoadState('networkidle');
  }

  getRowByTitle(title) {
    return this.tableRows.filter({ hasText: title }).first();
  }

  async editCategory(title) {
    await this.getRowByTitle(title).locator('a:has(svg)').first().click();
  }

  async deleteCategory(title) {
    await this.getRowByTitle(title).locator('button[data-bs-target="#list-delete-modal"]').click();
    await this.deleteConfirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await Promise.all([
      this.page.waitForResponse(
        (r) => /\/api\/categories\/\d+$/.test(new URL(r.url()).pathname) && r.request().method() !== 'GET',
        { timeout: 30000 },
      ),
      this.deleteConfirmButton.click(),
    ]);
  }

  async rowsCount() {
    return this.tableRows.count();
  }
}

class CategoryFormPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: /Добавить категорию|Редактировать категорию/ });

    this.positionInput = page.locator('input[type="number"]').first();
    // Два чекбокса: "Активный" и "Требует платного подъема (для воды)" — по порядку в форме.
    this.activeCheckbox = page.locator('input[type="checkbox"]').nth(0);
    this.paidLiftCheckbox = page.locator('input[type="checkbox"]').nth(1);
    // Заголовок/содержание идут парами по языкам RU → KY → EN, активна вкладка RU.
    this.titleInputs = page.locator('input[type="text"]');
    this.titleInputRu = this.titleInputs.nth(0);
    this.titleInputKy = this.titleInputs.nth(1);
    this.titleInputEn = this.titleInputs.nth(2);

    this.saveButton = page.getByRole('button', { name: 'Сохранить', exact: true });
    this.saveAndCloseButton = page.getByRole('button', { name: 'Сохранить и закрыть' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });
  }

  async goto() {
    await this.page.goto('/add-category');
    await this.heading.waitFor({ timeout: 30000 });
  }

  // Заголовок обязателен на всех трёх языках — без KY/EN бэкенд отвечает 422.
  async fillTitle(title) {
    await this.titleInputRu.fill(title);
    await this.titleInputKy.fill(title);
    await this.titleInputEn.fill(title);
  }

  async save() {
    await this.saveButton.click();
  }

  async saveAndClose() {
    await this.saveAndCloseButton.click();
  }
}

module.exports = { CategoriesPage, CategoryFormPage };
