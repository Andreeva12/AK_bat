// pages/OrderConfirmationPage.js
// Экран "Подтверждение заказа", открывается после тапа по "Оформить заказ".
// ВАЖНО: на экране ДВА элемента содержат "Подтвердить" в content-desc —
// текст дисклеймера о политике конфиденциальности ("Подтвердить\nНажимая на
// кнопку...") и настоящая кнопка ("Подтвердить\nПодтвердить", задвоенная
// метка). Нужно точное совпадение, иначе клик уйдёт в текст дисклеймера и
// откроет "Политика конфиденциальности" вместо подтверждения заказа.
class OrderConfirmationPage {
  get heading() {
    return $('~Подтверждение заказа');
  }

  get backButton() {
    return $('~Назад');
  }

  get totalAmount() {
    return $('~Итого');
  }

  get bonusesAccrued() {
    return $('//*[contains(@content-desc,"Начислено бонусов")]');
  }

  get confirmButton() {
    return $('//android.widget.Button[@content-desc="Подтвердить\nПодтвердить"]');
  }

  get requiredFieldErrorBanner() {
    return $('//*[contains(@content-desc,"Поле обязательно для заполнения")]');
  }

  async isDisplayed() {
    return this.heading.isExisting();
  }

  async hasValidationError() {
    return this.requiredFieldErrorBanner.isExisting();
  }

  async confirm() {
    await this.confirmButton.click();
  }
}

module.exports = new OrderConfirmationPage();
