// utils/appLaunch.js
// Общая последовательность "довести приложение до главного экрана" — нужна в
// начале КАЖДОГО теста, а не только логина: холодный старт после pm clear
// (см. wdio.conf.js) показывает 3 онбординг-слайда и экран выбора роли, которых
// нет при обычном повторном открытии приложения.
const RoleSelectionPage = require('../pages/RoleSelectionPage');
const OnboardingPage = require('../pages/OnboardingPage');
const HomePage = require('../pages/HomePage');
const { dismissNotificationPermissionIfPresent } = require('./systemDialogs');

async function ensureOnHomeScreen() {
  // Холодный старт Flutter-приложения на эмуляторе медленный.
  await new Promise((r) => setTimeout(r, 5000));
  await dismissNotificationPermissionIfPresent();

  await driver.waitUntil(
    async () =>
      (await OnboardingPage.isDisplayed()) ||
      (await RoleSelectionPage.isDisplayed()) ||
      (await HomePage.isDisplayed()),
    { timeout: 25000, timeoutMsg: 'не появился ни онбординг, ни выбор роли, ни главный экран' },
  );

  if (await OnboardingPage.isDisplayed()) {
    await OnboardingPage.skipIfPresent();
  }

  await dismissNotificationPermissionIfPresent();

  if (await RoleSelectionPage.isDisplayed()) {
    await RoleSelectionPage.selectCustomer();
  }

  await dismissNotificationPermissionIfPresent();

  await driver.waitUntil(async () => HomePage.isDisplayed(), {
    timeout: 15000,
    timeoutMsg: 'главный экран не появился после онбординга/выбора роли',
  });
}

// В отличие от ensureOnHomeScreen (только для холодного старта), эта функция
// используется МЕЖДУ тестами внутри одной сессии: жмёт системную "Назад",
// пока не окажемся на главном экране — закрывает модалки (способ оплаты,
// список адресов) и возвращает из вложенных экранов (оформление заказа,
// добавление адреса, история заказов и т.п.).
async function returnToHomeScreen(maxPresses = 15) {
  for (let i = 0; i < maxPresses; i++) {
    if (await HomePage.isDisplayed()) return;
    await driver.back();
    await new Promise((r) => setTimeout(r, 700));
  }
  try {
    await driver.waitUntil(async () => HomePage.isDisplayed(), {
      timeout: 15000,
      timeoutMsg: 'не удалось вернуться на главный экран нажатиями "Назад"',
    });
  } catch (e) {
    // Иногда системная "Назад" застревает (модалка/диалог не реагирует на
    // hardware back, либо накопилась глубокая цепочка экранов) — как
    // последний резерв, перезапускаем activity напрямую через adb. Это НЕ
    // сбрасывает данные приложения (в отличие от pm clear при старте новой
    // Appium-сессии), только пересоздаёт UI с текущего маршрута.
    const { execFileSync } = require('child_process');
    const DEVICE = process.env.ANDROID_DEVICE || 'emulator-5554';
    execFileSync('adb', [
      '-s', DEVICE, 'shell', 'am', 'start', '-n',
      'com.shvaiberovsa.akbata/com.shvaiberovsa.akbata.MainActivity',
    ]);
    await new Promise((r) => setTimeout(r, 3000));
    if (await RoleSelectionPage.isDisplayed()) {
      await RoleSelectionPage.selectCustomer();
    }
    await driver.waitUntil(async () => HomePage.isDisplayed(), {
      timeout: 15000,
      timeoutMsg: 'не удалось вернуться на главный экран даже после перезапуска activity',
    });
  }
}

module.exports = { ensureOnHomeScreen, returnToHomeScreen };
