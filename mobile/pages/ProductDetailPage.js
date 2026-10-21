// pages/ProductDetailPage.js
class ProductDetailPage {
  get retailPriceLabel() {
    return $('~Розничная цена');
  }

  get descriptionHeading() {
    return $('~Описание товара');
  }

  // Точное совпадение по одному значению ломается, т.к. content-desc этой
  // кнопки переключается между "Добавить в избранное" и "Удалить из
  // избранного" в зависимости от текущего состояния — локатор должен
  // совпадать с обоими вариантами.
  get addToFavoritesButton() {
    return $('//*[@content-desc="Добавить в избранное" or @content-desc="Удалить из избранного"]');
  }

  get addToCartButton() {
    return $('//*[contains(@content-desc,"Добавить в корзину")]');
  }

  get openCartBar() {
    return $('//*[contains(@content-desc,"Открыть корзину")]');
  }

  get backButton() {
    return $('~Назад');
  }

  productTitle(name) {
    return $(`~${name}`);
  }

  async isDisplayed() {
    return this.descriptionHeading.isExisting();
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async openCart() {
    await this.openCartBar.click();
  }
}

module.exports = new ProductDetailPage();
