// utils/systemDialogs.js
const { execFileSync } = require('child_process');

const DEVICE = process.env.ANDROID_DEVICE || 'emulator-5554';

// На чистом (после pm clear) старте Android показывает системный диалог runtime-
// разрешения "Allow Ак-Бата to send you notifications?" (POST_NOTIFICATIONS,
// Android 13+). Он всплывает асинхронно уже ПОСЛЕ того, как Appium запускает
// activity в рамках создания сессии, поэтому adb pm grant, выполненный заранее
// (до pm clear/launch), не помогает — разрешение сбрасывается вместе с очисткой
// данных. Дожидаемся и закрываем диалог реактивно, если он появился.
async function dismissNotificationPermissionIfPresent(timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const focus = execFileSync('adb', ['-s', DEVICE, 'shell', 'dumpsys', 'window'])
      .toString();
    const match = focus.match(/mCurrentFocus=.*?([\w.]*permissioncontroller[\w.]*)/i);
    if (match) {
      // Стандартный resource-id системной кнопки разрешения на современных Android.
      execFileSync('adb', [
        '-s', DEVICE, 'shell', 'input', 'tap', '943', '1058',
      ]);
      return true;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

module.exports = { dismissNotificationPermissionIfPresent };
