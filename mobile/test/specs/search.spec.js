const { expect } = require('chai');
const HomePage = require('../../pages/HomePage');
const LoginPage = require('../../pages/LoginPage');
const SearchPage = require('../../pages/SearchPage');
const { ensureOnHomeScreen, returnToHomeScreen } = require('../../utils/appLaunch');

const TEST_PHONE_LOCAL = process.env.TEST_PHONE_LOCAL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;
const KNOWN_PRODUCT_TERM = 'Вода';
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

describe('Поиск товаров', () => {
  before(async function () {
    this.timeout(60000);
    await ensureOnHomeScreen();
    await loginIfNeeded();
  });

  beforeEach(async function () {
    this.timeout(30000);
    await returnToHomeScreen();
  });

  it('тап по полю поиска открывает экран поиска с "Недавний поиск"', async () => {
    await HomePage.searchInput.click();
    await driver.waitUntil(async () => SearchPage.isDisplayed(), {
      timeout: 10000,
      timeoutMsg: 'не открылся экран поиска',
    });
    expect(await SearchPage.recentSearchHeading.isExisting(), 'заголовок "Недавний поиск"').to.be.true;
  });

  it('поиск по названию товара показывает известный товар в результатах', async function () {
    this.timeout(30000);
    await HomePage.searchInput.click();
    await driver.waitUntil(async () => SearchPage.isDisplayed(), {
      timeout: 10000,
      timeoutMsg: 'не открылся экран поиска',
    });
    await SearchPage.search(KNOWN_PRODUCT_TERM);
    await driver.waitUntil(async () => SearchPage.resultTile(KNOWN_PRODUCT).isExisting(), {
      timeout: 10000,
      timeoutMsg: `товар "${KNOWN_PRODUCT}" не найден в результатах поиска по "${KNOWN_PRODUCT_TERM}"`,
    });
  });
});
