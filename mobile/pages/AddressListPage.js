// pages/AddressListPage.js
// Модальное окно "Выберите адрес доставки", открывается кнопкой "Выбрать адрес"
// на вкладке "Курьер" экрана оформления заказа.
class AddressListPage {
  get heading() {
    return $('~Выберите адрес доставки');
  }

  get cancelButton() {
    return $('~Отмена');
  }

  get addAddressButton() {
    return $('//*[@content-desc="Добавить адрес\nДобавить адрес"]');
  }

  savedAddressItem(label) {
    return $(`//android.widget.Button[contains(@content-desc,"${label}")]`);
  }

  // ИСПРАВЛЕНО (2026-07-15): ранее задокументированная "нерешённая проблема"
  // (клик по элементу списка адресов якобы не срабатывает) оказалась
  // нестабильностью окружения того конкретного прогона (падение
  // инстанса UiAutomator2 сразу после), а не реальным блокером — обычный
  // webdriverio `.click()` по `contains(@content-desc, label)` работает
  // надёжно, подтверждено вживую (успешно оформлен реальный заказ выбором
  // "Токтогула, д. 126" из списка).
  async selectSavedAddress(label) {
    await this.savedAddressItem(label).click();
  }

  async isDisplayed() {
    return this.heading.isExisting();
  }

  async openAddAddress() {
    await this.addAddressButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}

module.exports = new AddressListPage();
