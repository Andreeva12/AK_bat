const { expect } = require('chai');
const HomePage = require('../../pages/HomePage');
const CatalogPage = require('../../pages/CatalogPage');
const ProductDetailPage = require('../../pages/ProductDetailPage');
const CartPage = require('../../pages/CartPage');
const LoginPage = require('../../pages/LoginPage');
const { ensureOnHomeScreen } = require('../../utils/appLaunch');

// Бизнес-правило, найденное при разведке: просмотр каталога/поиск/корзина доступны
// гостю без входа, но "Избранное", "Уведомления" и "Оформить заказ" в корзине
// требуют авторизации — приложение молча редиректит на экран логина.
describe('Ограничения гостевого доступа (без логина)', () => {
  beforeEach(async () => {
    await ensureOnHomeScreen();
  });

  it('"Избранные" без логина открывает экран логина', async () => {
    await HomePage.favoritesIcon.click();
    expect(await LoginPage.isDisplayed(), 'ожидался экран логина').to.be.true;
  });

  it('"Уведомления" без логина открывает экран логина', async () => {
    await HomePage.notificationsIcon.click();
    expect(await LoginPage.isDisplayed(), 'ожидался экран логина').to.be.true;
  });

  it('"Оформить заказ" в корзине без логина открывает экран логина', async () => {
    await CatalogPage.openCategory('Готовая продукция');
    await CatalogPage.openProduct('Вода питьевая Ак-Бата 18л.');
    await ProductDetailPage.addToCart();
    await driver.waitUntil(async () => ProductDetailPage.openCartBar.isExisting(), { timeout: 10000 });
    await ProductDetailPage.openCart();
    await CartPage.checkout();
    expect(await LoginPage.isDisplayed(), 'ожидался экран логина').to.be.true;
  });
});
