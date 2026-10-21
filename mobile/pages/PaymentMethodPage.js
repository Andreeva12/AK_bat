// pages/PaymentMethodPage.js
// Модальное окно (bottom sheet), открываемое кнопкой "Способ оплаты" на экране
// оформления заказа. Первые 2 варианта — android.widget.Button, остальные 4
// (онлайн-эквайринг) — android.widget.ImageView, но всё равно кликабельны.
class PaymentMethodPage {
  get cancelButton() {
    return $('~Отмена');
  }

  get onlinePaymentHeading() {
    return $('~Онлайн оплата');
  }

  get cashToCourier() {
    return $('//android.widget.Button[@content-desc="Наличными курьеру\nНаличными курьеру"]');
  }

  get cardToCourier() {
    return $('//android.widget.Button[@content-desc="Картой курьеру\nКартой курьеру"]');
  }

  get megaPay() {
    return $('//*[@content-desc="MegaPay\nMegaPay"]');
  }

  get mbank() {
    return $('//*[@content-desc="Mbank\nMbank"]');
  }

  get bakaiBank() {
    return $('//*[@content-desc="Бакай Банк\nБакай Банк"]');
  }

  get kicb() {
    return $('//*[@content-desc="KICB\nKICB"]');
  }

  async isDisplayed() {
    return this.cashToCourier.isExisting();
  }

  async selectCashToCourier() {
    await this.cashToCourier.click();
  }

  async selectCardToCourier() {
    await this.cardToCourier.click();
  }

  async selectMegaPay() {
    await this.megaPay.click();
  }

  async selectMbank() {
    await this.mbank.click();
  }

  async selectBakaiBank() {
    await this.bakaiBank.click();
  }

  async selectKicb() {
    await this.kicb.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}

module.exports = new PaymentMethodPage();
