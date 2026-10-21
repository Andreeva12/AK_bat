const { expect } = require('chai');
const HomePage = require('../../pages/HomePage');
const LoginPage = require('../../pages/LoginPage');
const CatalogPage = require('../../pages/CatalogPage');
const ProductDetailPage = require('../../pages/ProductDetailPage');
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

async function openKnownProduct() {
  await CatalogPage.openCategory(KNOWN_CATEGORY);
  await CatalogPage.openProduct(KNOWN_PRODUCT);
  await driver.waitUntil(async () => ProductDetailPage.isDisplayed(), {
    timeout: 10000,
    timeoutMsg: 'не открылась карточка товара',
  });
}

describe('Избранное', () => {
  before(async function () {
    this.timeout(60000);
    await ensureOnHomeScreen();
    await loginIfNeeded();
  });

  beforeEach(async function () {
    this.timeout(45000);
    await returnToHomeScreen();
  });

  it('добавление товара в избранное меняет кнопку на "Удалить из избранного"', async function () {
    this.timeout(30000);
    await openKnownProduct();
    // Гарантируем чистое начальное состояние на случай остатков от прошлых прогонов.
    if (await ProductDetailPage.addToFavoritesButton.getAttribute('content-desc') === 'Удалить из избранного') {
      await ProductDetailPage.addToFavoritesButton.click();
      await new Promise((r) => setTimeout(r, 800));
    }
    await ProductDetailPage.addToFavoritesButton.click();
    await driver.waitUntil(
      async () => (await ProductDetailPage.addToFavoritesButton.getAttribute('content-desc')) === 'Удалить из избранного',
      { timeout: 10000, timeoutMsg: 'кнопка должна смениться на "Удалить из избранного"' },
    );
  });

  it('товар, добавленный в избранное, появляется в списке "Избранные"', async function () {
    this.timeout(60000);
    await openKnownProduct();
    const isFavorited =
      (await ProductDetailPage.addToFavoritesButton.getAttribute('content-desc')) === 'Удалить из избранного';
    if (!isFavorited) {
      await ProductDetailPage.addToFavoritesButton.click();
      await new Promise((r) => setTimeout(r, 800));
    }
    await returnToHomeScreen();
    await HomePage.favoritesIcon.click();
    await new Promise((r) => setTimeout(r, 1500));
    expect(
      await $(`//*[contains(@content-desc,"${KNOWN_PRODUCT}")]`).isExisting(),
      'товар должен быть виден в списке избранного',
    ).to.be.true;
  });

  it('повторное нажатие убирает товар из избранного', async function () {
    this.timeout(30000);
    await openKnownProduct();
    const isFavorited =
      (await ProductDetailPage.addToFavoritesButton.getAttribute('content-desc')) === 'Удалить из избранного';
    if (!isFavorited) {
      await ProductDetailPage.addToFavoritesButton.click();
      await driver.waitUntil(
        async () =>
          (await ProductDetailPage.addToFavoritesButton.getAttribute('content-desc')) === 'Удалить из избранного',
        { timeout: 10000 },
      );
    }
    await ProductDetailPage.addToFavoritesButton.click();
    await driver.waitUntil(
      async () => (await ProductDetailPage.addToFavoritesButton.getAttribute('content-desc')) === 'Добавить в избранное',
      { timeout: 10000, timeoutMsg: 'кнопка должна вернуться к "Добавить в избранное"' },
    );
  });
});
