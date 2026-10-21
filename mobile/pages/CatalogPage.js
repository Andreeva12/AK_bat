// pages/CatalogPage.js — категории и список товаров внутри категории
class CatalogPage {
  categoryTab(name) {
    return $(`//*[contains(@content-desc,"${name}")]`);
  }

  productTile(name) {
    return $(`//*[contains(@content-desc,"${name}")]`);
  }

  get backButton() {
    return $('~Назад');
  }

  // Кол-во товаров на экране категории — считаем по количеству кнопок
  // "Добавить в избранное" (по одной на каждую карточку товара).
  get favoriteButtonsOnScreen() {
    return $$('//*[contains(@content-desc,"Добавить в избранное")]');
  }

  // Главный экран теперь может показывать переменное число секций НАД
  // "Категории" (баннер активного заказа "Ожидает курьера", "График
  // следующих доставок" — появляются только при наличии активных/будущих
  // заказов на аккаунте), из-за чего плитка категории не всегда попадает в
  // изначальный вьюпорт. Скроллим вниз, пока не найдём её.
  async openCategory(name) {
    const { execFileSync } = require('child_process');
    const DEVICE = process.env.ANDROID_DEVICE || 'emulator-5554';
    for (let i = 0; i < 6 && !(await this.categoryTab(name).isExisting()); i++) {
      execFileSync('adb', ['-s', DEVICE, 'shell', 'input', 'swipe', '1038', '1800', '1038', '600', '300']);
      await new Promise((r) => setTimeout(r, 500));
    }
    await this.categoryTab(name).click();
    // Список товаров категории подгружается не мгновенно (сетевой запрос);
    // без паузы клик по товару ниже иногда происходит до появления карточек.
    await new Promise((r) => setTimeout(r, 1500));
  }

  async openProduct(name) {
    await this.productTile(name).click();
  }
}

module.exports = new CatalogPage();
