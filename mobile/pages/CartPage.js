// pages/CartPage.js
// Строка товара в корзине (android.widget.ImageView с полным content-desc
// товара) содержит 3 безымянных дочерних android.widget.Button без
// content-desc — их роль не видна из дерева accessibility и пришлось
// вычислять живьём: [1] = "-" (уменьшить), [2] = "+" (увеличить,
// подтверждено координатным совпадением с рабочим тапом (640,521) из
// стороннего теста), [3] = переход на карточку товара (НЕ связано с
// количеством — при тапе открывается ProductDetailPage).
class CartPage {
  get heading() {
    return $('~Корзина');
  }

  get checkoutButton() {
    return $('//*[contains(@content-desc,"Оформить заказ")]');
  }

  get backButton() {
    return $('~Назад');
  }

  cartItemRow(productName) {
    return $(`//*[contains(@content-desc,"${productName}")]`);
  }

  decreaseQuantityButton(productName) {
    return $(`//android.widget.ImageView[contains(@content-desc,"${productName}")]/android.widget.Button[1]`);
  }

  increaseQuantityButton(productName) {
    return $(`//android.widget.ImageView[contains(@content-desc,"${productName}")]/android.widget.Button[2]`);
  }

  // content-desc строки товара выглядит как "Название\nЦена за шт\nКол-во\nСумма".
  async getItemQuantity(productName) {
    const desc = await this.cartItemRow(productName).getAttribute('content-desc');
    const parts = desc.split('\n');
    return parseInt(parts[2], 10);
  }

  async isDisplayed() {
    return this.heading.isExisting();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}

module.exports = new CartPage();
