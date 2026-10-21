// pages/OrderSuccessPage.js
// Экран после успешного подтверждения заказа (после тапа "Подтвердить" на
// OrderConfirmationPage). Показывает статус оплаты/заказа и номер заказа.
class OrderSuccessPage {
  get paymentProcessingStatus() {
    return $('~Оплата в обработке');
  }

  get orderNumberLabel() {
    return $('~Номер заказа');
  }

  get orderStatusLabel() {
    return $('~Статус заказа');
  }

  get totalAmount() {
    return $('~Итого');
  }

  async isDisplayed() {
    return this.paymentProcessingStatus.isExisting();
  }
}

module.exports = new OrderSuccessPage();
