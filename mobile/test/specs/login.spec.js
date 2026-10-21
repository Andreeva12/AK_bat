const { expect } = require('chai');
const LoginPage = require('../../pages/LoginPage');
const HomePage = require('../../pages/HomePage');
const AccountPage = require('../../pages/AccountPage');
const ForgotPasswordPage = require('../../pages/ForgotPasswordPage');
const { ensureOnHomeScreen, returnToHomeScreen } = require('../../utils/appLaunch');

const TEST_PHONE_LOCAL = process.env.TEST_PHONE_LOCAL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

// В разлогиненном состоянии предыдущий тест часто уже оставляет нас НА
// экране логина (не на главном) — тап по "Мой профиль" там не нужен и
// упадёт, т.к. этой кнопки на экране логина нет.
async function ensureOnLoginScreen() {
  if (await LoginPage.isDisplayed()) return;
  if (!(await HomePage.isDisplayed())) {
    await returnToHomeScreen();
  }
  await HomePage.openProfile();
  await driver.waitUntil(async () => LoginPage.isDisplayed(), {
    timeout: 10000,
    timeoutMsg: 'не открылся экран логина',
  });
}

describe('Логин', () => {
  before(async () => {
    await ensureOnHomeScreen();
  });

  it('тап по профилю в разлогиненном состоянии открывает экран логина', async () => {
    await HomePage.openProfile();
    const onLoginScreen = await LoginPage.isDisplayed();
    expect(onLoginScreen, 'ожидался экран логина после тапа по профилю').to.be.true;
  });

  it('успешный вход по телефону и паролю открывает экран аккаунта', async () => {
    await LoginPage.login(TEST_PHONE_LOCAL, TEST_PASSWORD);

    await driver.waitUntil(async () => HomePage.isDisplayed(), {
      timeout: 15000,
      timeoutMsg: 'после логина не вернулись на главный экран',
    });

    await HomePage.openProfile();
    const onAccountScreen = await AccountPage.isDisplayed();
    expect(onAccountScreen, 'после успешного входа тап по профилю должен открывать аккаунт').to.be.true;
  });

  it('логаут возвращает в разлогиненное состояние', async () => {
    await AccountPage.logout();

    await driver.waitUntil(async () => HomePage.isDisplayed(), {
      timeout: 15000,
      timeoutMsg: 'после логаута не вернулись на главный экран',
    });

    await HomePage.openProfile();
    const backOnLoginScreen = await LoginPage.isDisplayed();
    expect(backOnLoginScreen, 'после логаута тап по профилю должен снова открывать экран логина').to.be.true;
  });

  it('вход с неверным паролем показывает "Неверный логин или пароль."', async function () {
    this.timeout(30000);
    await ensureOnLoginScreen();
    await LoginPage.login(TEST_PHONE_LOCAL, 'wrongpassword');
    await driver.waitUntil(async () => LoginPage.incorrectCredentialsError.isExisting(), {
      timeout: 10000,
      timeoutMsg: 'должно появиться сообщение "Неверный логин или пароль."',
    });
    await returnToHomeScreen();
  });

  it('"Забыли пароль?" открывает экран восстановления и принимает номер телефона', async function () {
    this.timeout(30000);
    await ensureOnLoginScreen();
    await LoginPage.forgotPasswordLink.click();
    await driver.waitUntil(async () => ForgotPasswordPage.isDisplayed(), {
      timeout: 10000,
      timeoutMsg: 'не открылся экран "Забыли пароль?"',
    });
    await ForgotPasswordPage.submitPhone(TEST_PHONE_LOCAL);
    // Экран восстановления должен закрыться/продвинуться дальше без ошибки.
    const stillOnForgotForm = await ForgotPasswordPage.isDisplayed();
    expect(stillOnForgotForm, 'после отправки номера должны покинуть форму ввода телефона').to.be.false;
    await returnToHomeScreen();
  });
});
