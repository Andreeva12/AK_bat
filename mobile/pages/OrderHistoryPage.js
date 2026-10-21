// pages/OrderHistoryPage.js
class OrderHistoryPage {
  get heading() {
    return $('~История заказов');
  }

  get periodFilterButton() {
    return $('//android.widget.Button[@content-desc="Выбрать период\nВыбрать период"]');
  }

  get emptyStateMessage() {
    return $('~Ваша история заказов пуста!');
  }

  orderRow(orderIdOrLabel) {
    return $(`//*[contains(@content-desc,"${orderIdOrLabel}")]`);
  }

  async isDisplayed() {
    return this.heading.isExisting();
  }

  async isEmpty() {
    return this.emptyStateMessage.isExisting();
  }
}

module.exports = new OrderHistoryPage();
