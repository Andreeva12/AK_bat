// pages/CheckoutPage.js
// Кнопки с задвоенной меткой в content-desc ("Label\nLabel") — это настоящие
// кликабельные элементы; одиночная метка — это заголовок/статичный текст
// (см. LoginPage/HomePage). Используем точное совпадение с "\n", где это
// возможно, чтобы не зацепить заголовок вместо кнопки.
class CheckoutPage {
  get heading() {
    return $('//*[contains(@content-desc,"Оформление заказа")]');
  }

  get backButton() {
    return $('~Назад');
  }

  get pickupTab() {
    return $('//android.widget.Button[@content-desc="Самовывоз\nСамовывоз"]');
  }

  get courierTab() {
    return $('//android.widget.Button[@content-desc="Курьер\nКурьер"]');
  }

  get editRecipientButton() {
    return $('//android.widget.Button[contains(@content-desc,"Изменить данные")]');
  }

  get commentButton() {
    return $('//android.widget.Button[@content-desc="Комментарий"]');
  }

  get pickupPointLabel() {
    return $('//*[contains(@content-desc,"Пункт выдачи")]');
  }

  get deliveryAddressButton() {
    return $('//android.widget.Button[contains(@content-desc,"Выбрать адрес")]');
  }

  get deliveryDateStandard() {
    return $('//android.widget.Button[contains(@content-desc,"Стандартная доставка")]');
  }

  get deliveryDateExpress() {
    return $('//android.widget.Button[contains(@content-desc,"Экспресс-доставка")]');
  }

  get deliveryDateScheduled() {
    return $('//android.widget.Button[contains(@content-desc,"Доставка по расписанию")]');
  }

  get paymentMethodButton() {
    return $('//android.widget.Button[contains(@content-desc,"Способ оплаты")]');
  }

  get placeOrderButton() {
    return $('//android.widget.Button[contains(@content-desc,"Оформить заказ")]');
  }

  async isDisplayed() {
    return this.heading.isExisting();
  }

  async isPickupSelected() {
    return (await this.pickupTab.getAttribute('selected')) === 'true';
  }

  async isCourierSelected() {
    return (await this.courierTab.getAttribute('selected')) === 'true';
  }

  async selectPickup() {
    await this.pickupTab.click();
  }

  async selectCourier() {
    await this.courierTab.click();
  }

  async openPaymentMethodSelector() {
    await this.paymentMethodButton.click();
  }

  async openAddressPicker() {
    await this.deliveryAddressButton.click();
  }

  async isPlaceOrderEnabled() {
    return (await this.placeOrderButton.getAttribute('enabled')) === 'true';
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }
}

module.exports = new CheckoutPage();
