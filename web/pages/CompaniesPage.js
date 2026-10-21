class CompaniesPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Покупатели' });
    this.legalTab = page.getByText('Юр. лица', { exact: true });
    this.physicalTab = page.getByText('Физ. лица', { exact: true });

    // Раньше здесь был page.getByPlaceholder('', { exact: false }).first() — все текстовые
    // поля на странице (и здесь, и на форме компании) имеют пустой placeholder, поэтому
    // локатор мог зацепить не то поле и зависнуть в ожидании видимости/доступности.
    this.companyNameInput = page.getByRole('textbox', { name: 'Название компании' });
    this.innInput = page.locator('text=ИНН').first().locator('xpath=following::input[1]');
    this.statusFilter = page.getByText('Все статусы');
    this.applyButton = page.getByRole('button', { name: 'Применить' });
    this.resetButton = page.getByRole('button', { name: 'Сбросить' });

    // "Добавить" здесь — ссылка (<a href="/companies/add">), как на товарах/акциях/категориях.
    this.addButton = page.getByRole('link', { name: 'Добавить' });
    this.exportExcelButton = page.getByRole('button', { name: 'Экспортировать Excel' });
    this.sendNewsletterButton = page.getByRole('button', { name: 'Отправить рассылку' });

    this.tableRows = page.locator('table tbody tr');

    this.statusOptions = {
      all: page.getByText('Все статусы', { exact: true }),
      approved: page.getByText('approved', { exact: true }),
      pendingVerification: page.getByText('pending_verification', { exact: true }),
    };
  }

  async goto() {
    // Прямой переход по URL вместо hover по сайдбару (см. products.page.js).
    await this.page.goto('/customers');
    await this.heading.waitFor({ timeout: 30000 });
    await this.legalTab.click();
    // Таблица компаний рендерится с задержкой уже ПОСЛЕ networkidle — ждём
    // появления самой строки, а не только сетевого простоя.
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
    await this.page.mouse.move(600, 400);
  }

  async filterByStatus(statusKey) {
    await this.statusFilter.click();
    await this.statusOptions[statusKey].click();
    await this.applyButton.click();
  }

  async filterByCompanyName(name) {
    // networkidle здесь ненадёжен: страница компаний (1700+ записей) никогда полностью
    // не затихает по сети и способен съесть весь таймаут теста (см. resetFilters).
    await this.companyNameInput.fill(name);
    await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('/api/companies'), { timeout: 20000 }).catch(() => {}),
      this.applyButton.click(),
    ]);
  }

  async resetFilters() {
    await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('/api/companies'), { timeout: 20000 }).catch(() => {}),
      this.resetButton.click(),
    ]);
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
  }

  async getRowByCompanyName(name) {
    return this.page.locator('table tbody tr').filter({ hasText: name }).first();
  }

  async openCompany(name) {
    const row = await this.getRowByCompanyName(name);
    await row.getByRole('link').first().click();
  }

  async editCompany(name) {
    const row = await this.getRowByCompanyName(name);
    await row.locator('a:has(svg), button:has(svg)').first().click();
  }

  async deleteCompany(name) {
    const row = await this.getRowByCompanyName(name);
    await row.locator('a:has(svg), button:has(svg)').last().click();
  }

  async rowsCount() {
    return this.tableRows.count();
  }
}

class CompanyFormPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Редактирование компании' });

    this.tabs = {
      mainData: page.getByText('Основные данные', { exact: true }),
      responsiblePersons: page.getByText('Ответственные лица', { exact: true }),
      orders: page.getByText('Заказы', { exact: true }),
    };

    // Таб "Основные данные"
    this.companyNameInput = page.locator('text=Название компании').locator('xpath=following::input[1]');
    this.innInput = page.locator('text=ИНН').locator('xpath=following::input[1]');
    this.statusInput = page.locator('text=Статус').first().locator('xpath=following::input[1]');

    this.saveButton = page.getByRole('button', { name: 'Сохранить', exact: true });
    this.saveAndCloseButton = page.getByRole('button', { name: 'Сохранить и закрыть' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });

    // Таб "Ответственные лица"
    this.responsiblePersonsTable = page.locator('table').filter({ hasText: 'ФИО' });
    this.responsiblePersonsPerPageSelect = page.getByText('20', { exact: true }).first();

    // Таб "Заказы"
    this.ordersAddButton = page.getByRole('button', { name: 'Добавить' });
    this.ordersStatusFilter = page.getByText('Все статусы');
    this.ordersIdSearchInput = page.getByPlaceholder('ID заказа');
    this.ordersEmptyText = page.getByText('Ничего не найдено');
  }

  async openTab(tabKey) {
    await this.tabs[tabKey].click();
  }

  async isMainFieldsDisabled() {
    return {
      name: await this.companyNameInput.isDisabled(),
      inn: await this.innInput.isDisabled(),
      status: await this.statusInput.isDisabled(),
    };
  }

  async save() {
    await this.saveButton.click();
  }
}

module.exports = { CompaniesPage, CompanyFormPage };
