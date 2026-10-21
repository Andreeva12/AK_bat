require('dotenv').config();
const { execFileSync } = require('child_process');

const DEVICE = process.env.ANDROID_DEVICE || 'emulator-5554';

exports.config = {
  runner: 'local',
  port: 4723,
  // Один физический эмулятор — только один Appium-сеанс единовременно. Вложенный
  // массив ([[...]]) — это единственный способ заставить wdio гонять файлы
  // строго последовательно в одном воркере; плоский массив специй параллелит их
  // по воркерам вплоть до maxInstances, даже когда maxInstances выставлен в 1.
  specs: [['./test/specs/**/*.spec.js']],
  maxInstances: 1,
  maxInstancesPerCapability: 1,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE || 'emulator-5554',
      'appium:appPackage': 'com.shvaiberovsa.akbata',
      'appium:appActivity': 'com.shvaiberovsa.akbata.MainActivity',
      // Приложение уже установлено вручную (adb install), путь к .apk не передаётся —
      // поэтому Appium его не переустанавливает, а только очищает данные (pm clear)
      // перед каждой сессией. Это гарантирует чистый старт (экран выбора роли,
      // разлогинен) при каждом прогоне, без хрупкой защитной логики в тестах.
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 300,
      'appium:autoGrantPermissions': true,
      // На настоящем чистом старте (после pm clear) приложение показывает интерфейс
      // на английском ("User"/"Forwarder"), следуя системной локали устройства, а не
      // на русском, как во всех наших локаторах. Фиксируем локаль устройства на ru-RU,
      // чтобы UI приложения был предсказуемо русским при каждом прогоне.
      'appium:language': 'ru',
      'appium:locale': 'RU',
    },
  ],
  logLevel: 'warn',
  bail: 0,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          address: '127.0.0.1',
          port: 4723,
        },
        logPath: './appium-wdio.log',
      },
    ],
  ],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    // Полный сценарий оформления заказа (логин + каталог + добавление адреса
    // на карте + оплата + подтверждение) — это много последовательных шагов
    // с задержками на анимации/сеть; per-test this.timeout() ненадёжно
    // применяется к отдельным WebDriver-командам, поэтому подняли базовый
    // таймаут глобально вместо точечных переопределений.
    timeout: 180000,
  },
  // `appium:autoGrantPermissions` не покрывает POST_NOTIFICATIONS (Android 13+ runtime
  // permission, запрашивается асинхронно после старта приложения, а не при установке) —
  // выдаём её вручную через adb до старта сессии, иначе диалог системы перекрывает
  // главный экран в непредсказуемый момент и ломает первые шаги любого теста.
  onPrepare: function () {
    try {
      execFileSync('adb', [
        '-s', DEVICE, 'shell', 'pm', 'grant',
        'com.shvaiberovsa.akbata', 'android.permission.POST_NOTIFICATIONS',
      ]);
    } catch (e) {
      // no-op: на некоторых версиях Android разрешение уже выдано или не требуется
    }
  },
};
