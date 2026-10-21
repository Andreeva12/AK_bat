const { expect } = require('chai');
const HomePage = require('../../pages/HomePage');
const LoginPage = require('../../pages/LoginPage');
const CatalogPage = require('../../pages/CatalogPage');
const ProductDetailPage = require('../../pages/ProductDetailPage');
const CartPage = require('../../pages/CartPage');
const { ensureOnHomeScreen, returnToHomeScreen } = require('../../utils/appLaunch');

const TEST_PHONE_LOCAL = process.env.TEST_PHONE_LOCAL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;
const KNOWN_CATEGORY = 'Готовая продукция';
const KNOWN_PRODUCT = 'Вода питьевая Ак-Бата 18л.';

async function loginIfNeeded() {
  await HomePage.openProfile();
  if (await LoginPage.isDisplayed()) {
    await LoginPage.login(TEST_PHONE_LOCAL, TEST_PASSWORD);
    await driver.waitUntil(async () => HomePage.isDisplayed(), {
      timeout: 15000,
      timeoutMsg: 'не удалось залогиниться тестовым аккаунтом',
    });
  } else {
    await returnToHomeScreen();
  }
}

async function openCartWithKnownProduct() {
  await CatalogPage.openCategory(KNOWN_CATEGORY);
  await CatalogPage.openProduct(KNOWN_PRODUCT);
  await ProductDetailPage.addToCart();
  await driver.waitUntil(async () => ProductDetailPage.openCartBar.isExisting(), {
    timeout: 10000,
    timeoutMsg: 'товар не добавился в корзину',
  });
  await ProductDetailPage.openCart();
  await driver.waitUntil(async () => CartPage.isDisplayed(), {
    timeout: 10000,
    timeoutMsg: 'не открылась корзина',
  });
}

describe('Корзина: управление количеством', () => {
  before(async function () {
    this.timeout(60000);
    await ensureOnHomeScreen();
    await loginIfNeeded();
  });

  beforeEach(async function () {
    this.timeout(60000);
    await returnToHomeScreen();
    await openCartWithKnownProduct();
  });

  it('кнопка "+" увеличивает количество и сумму по товару', async function () {
    this.timeout(30000);
    const before = await CartPage.getItemQuantity(KNOWN_PRODUCT);
    await CartPage.increaseQuantityButton(KNOWN_PRODUCT).click();
    await driver.waitUntil(async () => (await CartPage.getItemQuantity(KNOWN_PRODUCT)) === before + 1, {
      timeout: 10000,
      timeoutMsg: `количество должно было увеличиться с ${before} до ${before + 1}`,
    });
  });

  it('кнопка "-" уменьшает количество товара', async function () {
    this.timeout(30000);
    // Сначала увеличиваем, чтобы после уменьшения товар не пропал из корзины
    // (минимальное кол-во покупки для этого товара - 2 шт., см. карточку товара).
    await CartPage.increaseQuantityButton(KNOWN_PRODUCT).click();
    await new Promise((r) => setTimeout(r, 800));
    const before = await CartPage.getItemQuantity(KNOWN_PRODUCT);
    await CartPage.decreaseQuantityButton(KNOWN_PRODUCT).click();
    await driver.waitUntil(async () => (await CartPage.getItemQuantity(KNOWN_PRODUCT)) === before - 1, {
      timeout: 10000,
      timeoutMsg: `количество должно было уменьшиться с ${before} до ${before - 1}`,
    });
  });
});
