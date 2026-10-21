class ProductFormPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: /Добавить товар|Редактировать товар/ });

    this.imageInput = page.locator('input[type="file"]').first();

    // Первое поле type=number в форме — "Цена *" (раньше локатор попадал в input[type=file]).
    this.priceInput = page.locator('input[type="number"]').first();
    this.guid1cInput = page.locator('text=ID из 1С').locator('xpath=following::input[1]');
    this.minOrderInput = page.locator('text=Мин. заказ').locator('xpath=following::input[1]');
    this.maxOrderInput = page.locator('text=Макс. заказ').locator('xpath=following::input[1]');
    this.packagingInput = page.locator('text=Упаковка').locator('xpath=following::input[1]');

    this.activeCheckbox = page.getByText('Активен').locator('xpath=preceding-sibling::input | preceding::input[1]').first();
    this.promoCheckbox = page.getByText('Промо', { exact: true }).locator('xpath=preceding::input[1]').first();
    this.requiresReturnCheckbox = page.getByText('Требует возврата тары').locator('xpath=preceding::input[1]').first();

    // "Категории" без exact совпадает и с пунктом сайдбара "Категории товаров" —
    // уточняем точное совпадение, иначе следующий xpath ищет элемент не от той метки.
    this.categoriesSelect = page.getByText('Категории', { exact: true }).locator('xpath=following::*[self::select or @role="combobox"][1]');
    this.relatedProductsSelect = page.getByText('Сопутствующие товары', { exact: true }).locator('xpath=following::*[self::select or @role="combobox"][1]');

    // "Заголовок *" обязателен на всех трёх языках (RU/KY/EN) — без KY/EN бэкенд
    // отвечает 422 и товар не создаётся. Поля идут в порядке RU → KY → EN.
    const titleByIndex = (n) => page.locator(`xpath=(//label[contains(normalize-space(.),"Заголовок")])[${n}]/following::input[1]`);
    this.titleInput = titleByIndex(1);
    this.titleKyInput = titleByIndex(2);
    this.titleEnInput = titleByIndex(3);
    this.contentEditor = page.locator('[contenteditable="true"]').first();

    this.addPhotoButton = page.getByText('+', { exact: true });

    this.tariffPriceInputs = {
      accounting: page.locator('text=Учетная цена').first().locator('xpath=following::input[1]'),
      accountingLegal: page.locator('text=Учетная цена (юр. лица тест)').locator('xpath=following::input[1]'),
      testPhysical: page.locator('text=Тестовая цена (Физ. лицо)').locator('xpath=following::input[1]'),
    };

    this.saveButton = page.getByRole('button', { name: 'Сохранить', exact: true });
    this.saveAndCloseButton = page.getByRole('button', { name: 'Сохранить и закрыть' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });
  }

  async fillBasicInfo({ price, title, content, minOrder, maxOrder, packaging, guid1c }) {
    if (price !== undefined) await this.priceInput.fill(String(price));
    if (title !== undefined) {
      await this.titleInput.fill(title);
      await this.titleKyInput.fill(title);
      await this.titleEnInput.fill(title);
    }
    if (content !== undefined) await this.contentEditor.fill(content);
    if (minOrder !== undefined) await this.minOrderInput.fill(String(minOrder));
    if (maxOrder !== undefined) await this.maxOrderInput.fill(String(maxOrder));
    if (packaging !== undefined) await this.packagingInput.fill(packaging);
    if (guid1c !== undefined) await this.guid1cInput.fill(guid1c);
  }

  async setActive(value) {
    const isChecked = await this.activeCheckbox.isChecked();
    if (isChecked !== value) await this.activeCheckbox.click();
  }

  async setPromo(value) {
    const isChecked = await this.promoCheckbox.isChecked();
    if (isChecked !== value) await this.promoCheckbox.click();
  }

  async selectCategory(categoryName) {
    // Это мультиселект (vs--multiple) — клик по контейнеру не открывает список,
    // нужно кликнуть и печатать именно во внутреннее поле поиска .vs__search.
    const searchInput = this.categoriesSelect.locator('input.vs__search');
    await searchInput.click();
    await searchInput.fill(categoryName);
    const option = this.page.locator('li.vs__dropdown-option', { hasText: categoryName }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  async setTariffPrice(tariffKey, price) {
    await this.tariffPriceInputs[tariffKey].fill(String(price));
  }

  async save() {
    await this.saveButton.click();
  }

  // После "Сохранить" приложение остаётся на странице формы (редиректа на
  // /edit-product/:id нет), поэтому успех подтверждаем ответом API:
  // POST /api/products (создание, 200 + данные товара) или POST /api/products/:id (правка, 204).
  async saveAndWaitForApi() {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (r) => /\/api\/products(\/\d+)?$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST',
        { timeout: 30000 },
      ),
      this.saveButton.click(),
    ]);
    return response;
  }

  async saveAndClose() {
    await this.saveAndCloseButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}

module.exports = { ProductFormPage };
