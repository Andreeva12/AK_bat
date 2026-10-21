// pages/orderForm.page.js
export class OrderFormPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: /Создание нового заказа|Редактирование заказа/ });

    // Тип заказчика
    this.physicalRadio = page.getByText('Физическое лицо');
    this.legalRadio = page.getByText('Юридическое лицо');

    // Клиент / компания
    this.clientSearchInput = page.getByPlaceholder('Начните вводить ФИО, телефон или email...');
    this.companySearchInput = page.getByPlaceholder('Начните вводить название или ИНН...');

    // Лейблы селектов (используются как якоря для selectFromDropdown)
    this.deliveryMethodLabel = 'Способ доставки';
    this.paymentMethodLabel = 'Способ оплаты';
    this.paymentStatusLabel = 'Статус оплаты';
    this.orderStatusLabel = 'Статус заказа';

    // Нативные <select> (для проверки списка опций и значения по умолчанию)
    this.deliveryMethodSelect = page.locator('label:has-text("Способ доставки")').locator('xpath=following::select[1]');
    this.paymentMethodSelect = page.locator('label:has-text("Способ оплаты")').locator('xpath=following::select[1]');
    this.paymentStatusSelect = page.locator('label:has-text("Статус оплаты")').locator('xpath=following::select[1]');
    this.orderStatusSelect = page.locator('label:has-text("Статус заказа")').locator('xpath=following::select[1]');

    this.addressSelect = page.getByText('Выберите адрес...');
    this.addressSelectInput = page.getByPlaceholder('Выберите адрес...');
    this.deliveryTimeInput = page.getByPlaceholder(/Время доставки|^$/).first();
    this.liftToggleLabel = page.getByText('Подъем на этаж');
    this.liftCheckbox = this.liftToggleLabel.locator('xpath=preceding-sibling::*[1]');

    // Карта
    this.mapCardHeading = page.getByText('Адрес на карте', { exact: true });
    this.mapSectionHeading = page.getByText('Адрес доставки на карте', { exact: true });

    // Навигация
    this.backButton = page.locator('button:has(i[data-name="arrow-left"])');

    this.recipientNameInput = page.getByPlaceholder('Имя получателя (если отличается от заказчика)');
    this.recipientPhoneInput = page.getByPlaceholder('Телефон получателя (если отличается)');
    this.clientCommentInput = page.getByPlaceholder('Отображается в приложении клиента...');
    this.staffCommentInput = page.getByPlaceholder('Внутренняя заметка для диспетчера/курьера...');

    // Состав заказа
    this.productSearchInput = page.getByPlaceholder('Начните вводить название товара...');
    this.addProductButton = page.getByRole('button', { name: 'Добавить' });
    this.compositionTable = page.locator('table').filter({ hasText: 'НАЗВАНИЕ' });
    this.emptyCompositionText = page.getByText('В заказе пока нет товаров');

    this.itemsTotalText = page.getByText('Сумма по товарам:');
    this.deliveryTotalText = page.getByText('Доставка:');
    this.grandTotalText = page.getByText('Итого к оплате:');

    // Логистика
    this.courierSelect = page.getByText('Выберите курьера...');
    this.noCourierWarning = page.getByText('Заказ висит в воздухе без исполнителя.');

    // Кнопки
    this.saveButton = page.getByRole('button', { name: 'Сохранить изменения' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });
  }

  // ВСЕ МЕТОДЫ ДОЛЖНЫ БЫТЬ ВНУТРИ КЛАССА

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async selectCustomerType(type) {
    if (type === 'physical') {
      await this.physicalRadio.click();
    } else {
      await this.legalRadio.click();
    }
    await this.page.waitForLoadState('networkidle');
  }

  // Поиск клиента (физическое лицо)
  async searchClient(query) {
    await this.clientSearchInput.click();
    await this.clientSearchInput.fill(query);
    const option = this.page.locator('li.vs__dropdown-option').first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Поиск компании (юридическое лицо)
  async searchCompany(query) {
    await this.companySearchInput.click();
    await this.companySearchInput.fill(query);
    const option = this.page.locator('li.vs__dropdown-option').first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Универсальный helper выбора значения в кастомном select-компоненте по соседству с лейблом.
  async selectFromDropdown(labelText, optionText) {
    const container = this.page.locator(`text=${labelText}`).locator('xpath=ancestor::*[1]/following-sibling::*[1]');
    await container.click();
    await this.page.getByText(optionText, { exact: true }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async setDeliveryMethod(optionText) {
    await this.selectFromDropdown(this.deliveryMethodLabel, optionText);
  }

  async setPaymentMethod(optionText) {
    await this.selectFromDropdown(this.paymentMethodLabel, optionText);
  }

  async setPaymentStatus(optionText) {
    await this.selectFromDropdown(this.paymentStatusLabel, optionText);
  }

  async setOrderStatus(optionText) {
    await this.selectFromDropdown(this.orderStatusLabel, optionText);
  }

  // Установка времени доставки через flatpickr
  async setDeliveryTime(timeString) {
    await this.deliveryTimeInput.click();
    // Выбираем сегодняшний день
    await this.page.locator('.flatpickr-day.today').click();
    // Устанавливаем время (например, "14:00")
    const [hours, minutes] = timeString.split(':');
    const hourInput = this.page.locator('.flatpickr-hour');
    const minuteInput = this.page.locator('.flatpickr-minute');
    await hourInput.fill(hours);
    await minuteInput.fill(minutes);
    // Закрываем календарь (клик вне)
    await this.page.click('body');
    await this.page.waitForLoadState('networkidle');
  }

  // Установка адреса доставки
  async setDeliveryAddress(addressText) {
    // Клик по тексту плейсхолдера ("Выберите адрес...") ненадёжен — кликаем по
    // самому полю ввода v-select и форсируем клик, т.к. поле нулевой ширины.
    await this.addressSelectInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.addressSelectInput.click({ force: true });
    // fill() вместо keyboard.type(): посимвольный ввод заставляет список опций
    // перефильтровываться на каждую букву, и клик иногда попадает в момент
    // между перерисовками ("element was detached from the DOM, retrying").
    // fill() обновляет значение одним действием — один цикл перерисовки.
    await this.addressSelectInput.fill(addressText);
    const option = this.page.locator('li.vs__dropdown-option').first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForLoadState('networkidle');
  }

  async toggleLift() {
    await this.liftToggleLabel.locator('xpath=preceding-sibling::*[1]').click();
  }

  async fillRecipient(name, phone) {
    if (name) await this.recipientNameInput.fill(name);
    if (phone) await this.recipientPhoneInput.fill(phone);
  }

  async fillComments(clientComment, staffComment) {
    if (clientComment) await this.clientCommentInput.fill(clientComment);
    if (staffComment) await this.staffCommentInput.fill(staffComment);
  }

  async addProductToOrder(productName) {
    await this.productSearchInput.click();
    await this.productSearchInput.fill(productName);
    const option = this.page.locator('li.vs__dropdown-option', { hasText: productName }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.addProductButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async assignCourier(courierName) {
    await this.courierSelect.click();
    await this.page.getByText(courierName, { exact: true }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async save() {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async cancel() {
    await this.cancelButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}