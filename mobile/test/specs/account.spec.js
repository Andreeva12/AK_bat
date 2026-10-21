const { expect } = require('chai');
const HomePage = require('../../pages/HomePage');
const LoginPage = require('../../pages/LoginPage');
const AccountPage = require('../../pages/AccountPage');
const { ensureOnHomeScreen, returnToHomeScreen } = require('../../utils/appLaunch');

const TEST_PHONE_LOCAL = process.env.TEST_PHONE_LOCAL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

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

async function openAccount() {
  await HomePage.openProfile();
  await driver.waitUntil(async () => AccountPage.isDisplayed(), {
    timeout: 10000,
    timeoutMsg: 'не открылся экран аккаунта',
  });
}

// "Мои адреса" на этом экране — не переход на новый экран, а разворачивание
// инлайн-секции "Мой профиль" (ФИО/тариф/т.п.) ПРЯМО внутри экрана аккаунта,
// которое сдвигает остальные пункты меню вниз за пределы исходного вьюпорта.
// Скроллим вниз перед каждым кликом, чтобы не промахнуться мимо пункта.
async function scrollToAndClick(elementGetter) {
  const { execFileSync } = require('child_process');
  const DEVICE = process.env.ANDROID_DEVICE || 'emulator-5554';
  for (let i = 0; i < 6 && !(await elementGetter.isExisting()); i++) {
    execFileSync('adb', ['-s', DEVICE, 'shell', 'input', 'swipe', '1038', '1800', '1038', '600', '300']);
    await new Promise((r) => setTimeout(r, 500));
  }
  await elementGetter.click();
}

describe('Настройки аккаунта', () => {
  before(async function () {
    this.timeout(60000);
    await ensureOnHomeScreen();
    await loginIfNeeded();
  });

  // Каждый пункт настроек проверяется изолированно: свежий заход в аккаунт
  // с главного экрана перед каждым тестом, вместо цепочки "Назад" между
  // проверками — так надёжнее (не зависит от того, куда именно уводит
  // системная "Назад" с произвольного вложенного экрана).
  beforeEach(async function () {
    this.timeout(30000);
    await returnToHomeScreen();
    await openAccount();
  });

  it('"Мои бонусы" показывает баланс и историю начислений', async () => {
    await AccountPage.myBonusesLink.click();
    await driver.waitUntil(async () => $('~Мои бонусы').isExisting(), {
      timeout: 10000,
      timeoutMsg: 'не открылся экран "Мои бонусы"',
    });
    expect(await $('//*[contains(@content-desc,"бонусов")]').isExisting(), 'баланс бонусов').to.be.true;
  });

  it('"Мои адреса" разворачивает секцию профиля (ФИО/контактные данные)', async () => {
    await scrollToAndClick(AccountPage.myAddressesLink);
    await new Promise((r) => setTimeout(r, 1200));
    expect(await $('~ФИО').isExisting(), 'должна появиться секция "ФИО"').to.be.true;
  });

  it('"Уведомления" (настройки) открывает отдельный от аккаунта экран', async () => {
    await scrollToAndClick(AccountPage.notificationsSettingsLink);
    await driver.waitUntil(async () => $('~Уведомления').isExisting(), {
      timeout: 10000,
      timeoutMsg: 'не открылся экран настроек уведомлений',
    });
  });

  it('"Служба поддержки" открывает отдельный от аккаунта экран', async () => {
    await scrollToAndClick(AccountPage.supportLink);
    await new Promise((r) => setTimeout(r, 1200));
    expect(await AccountPage.isDisplayed(), 'должны покинуть экран аккаунта').to.be.false;
  });

  it('"Изменить пароль" открывает отдельный от аккаунта экран', async () => {
    await scrollToAndClick(AccountPage.changePasswordLink);
    await new Promise((r) => setTimeout(r, 1200));
    expect(await AccountPage.isDisplayed(), 'должны покинуть экран аккаунта').to.be.false;
  });

  it('"Язык" открывает переключатель языка', async () => {
    await scrollToAndClick(AccountPage.languageLink);
    await new Promise((r) => setTimeout(r, 1200));
    expect(await AccountPage.isDisplayed(), 'должны покинуть экран аккаунта').to.be.false;
  });
});
