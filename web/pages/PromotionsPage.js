class PromotionsPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Акции' });
    // Как и на странице товаров, "Добавить" здесь — это <a>, а не <button>.
    this.addButton = page.getByRole('link', { name: 'Добавить' });
    this.titleSearchInput = page.getByPlaceholder('Введите заголовок');

    this.tableRows = page.locator('table tbody tr');
  }

  // Прямой переход по URL: навигация через раскрывающийся сайдбар (hover по "Магазин")
  // давала нестабильные таймауты, а сам переход из сайдбара проверяет dashboard.spec.js.
  async goto() {
    await this.page.goto('/promotions');
    await this.heading.waitFor({ timeout: 30000 });
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
  }

  async clickAdd() {
    await this.addButton.click();
  }

  async searchByTitle(title) {
    await this.titleSearchInput.fill(title);
    await this.page.keyboard.press('Enter');
  }

  getRowByTitle(title) {
    return this.page.locator('table tbody tr').filter({ hasText: title }).first();
  }

  async editPromotion(title) {
    const row = await this.getRowByTitle(title);
    await row.locator('a:has(svg), button:has(svg)').first().click();
  }

  async deletePromotion(title) {
    const row = await this.getRowByTitle(title);
    await row.locator('button[data-bs-target="#list-delete-modal"]').click();
    const confirmButton = this.page.getByRole('button', { name: 'Удалить навсегда' });
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await Promise.all([
      this.page.waitForResponse(
        (r) => /\/api\/promotions\/\d+$/.test(new URL(r.url()).pathname) && r.request().method() !== 'GET',
        { timeout: 30000 },
      ),
      confirmButton.click(),
    ]);
  }

  async getBadgeType(title) {
    const row = await this.getRowByTitle(title);
    return row.locator('span').filter({ hasText: /Глобальная|День Рождения/ }).first();
  }

  async rowsCount() {
    return this.tableRows.count();
  }
}

class PromotionFormPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: /Редактировать акцию|Добавить акцию/ });

    this.internalNameInput = page.locator('text=Внутреннее название').locator('xpath=following::input[1]');
    this.typeSelect = page.locator('text=Тип акции').locator('xpath=following::*[self::select or @role="combobox"][1]');
    this.dateInput = page.locator('text=Дата (ММ-ДД)').locator('xpath=following::input[1]');
    this.bonusAmountInput = page.locator('text=Сумма бонусов').locator('xpath=following::input[1]');
    this.activeCheckbox = page.getByText('Активна').locator('xpath=preceding::input[1]');

    this.bannerImageInput = page.locator('input[type="file"]').first();
    this.bannerTitleRuInput = page.locator('text=Заголовок на баннере (в приложении) (RU)').locator('xpath=following::input[1]');
    this.descriptionRuTextarea = page.locator('text=Описание акции (RU)').locator('xpath=following::textarea[1]');
    this.pushTitleRuInput = page.locator('text=Заголовок Push-уведомления (RU)').locator('xpath=following::input[1]');
    this.pushTextRuInput = page.locator('text=Текст Push-уведомления (RU)').locator('xpath=following::input[1]');

    this.bannerTitleKyInput = page.locator('text=Заголовок на баннере (в приложении) (KY)').locator('xpath=following::input[1]');
    this.descriptionKyTextarea = page.locator('text=Описание акции (KY)').locator('xpath=following::textarea[1]');

    this.saveButton = page.getByRole('button', { name: 'Сохранить', exact: true });
    this.saveAndCloseButton = page.getByRole('button', { name: 'Сохранить и закрыть' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });
  }

  async selectType(typeName) {
    await this.typeSelect.click();
    await this.page.getByText(typeName, { exact: true }).click();
  }

  async fillCommon({ internalName, bonusAmount, bannerTitleRu, descriptionRu, pushTitleRu, pushTextRu }) {
    if (internalName !== undefined) await this.internalNameInput.fill(internalName);
    if (bonusAmount !== undefined) await this.bonusAmountInput.fill(String(bonusAmount));
    if (bannerTitleRu !== undefined) await this.bannerTitleRuInput.fill(bannerTitleRu);
    if (descriptionRu !== undefined) await this.descriptionRuTextarea.fill(descriptionRu);
    if (pushTitleRu !== undefined) await this.pushTitleRuInput.fill(pushTitleRu);
    if (pushTextRu !== undefined) await this.pushTextRuInput.fill(pushTextRu);
  }

  async setActive(value) {
    const isChecked = await this.activeCheckbox.isChecked();
    if (isChecked !== value) await this.activeCheckbox.click();
  }

  async save() {
    await this.saveButton.click();
  }

  async saveAndClose() {
    await this.saveAndCloseButton.click();
  }
}

module.exports = { PromotionsPage, PromotionFormPage };