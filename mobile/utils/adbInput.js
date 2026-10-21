// utils/adbInput.js
const { execFileSync } = require('child_process');

const DEVICE = process.env.ANDROID_DEVICE || 'emulator-5554';

// Приложение построено на Flutter. Appium/uiautomator2's стандартный
// element.setValue() вызывает accessibility-действие ACTION_SET_TEXT, которое
// обновляет текст в дереве accessibility, но не доходит до реального
// TextEditingController у Flutter-виджета (валидация формы его не видит).
// Поэтому реальный ввод текста делаем через adb shell input text — эмулирует
// настоящие события IME, которые Flutter действительно обрабатывает.
async function typeIntoElement(element, text) {
  await element.click();
  await new Promise((r) => setTimeout(r, 300));
  // adb shell разбирает пробелы как разделители аргументов ещё раз на стороне
  // устройства ("input text Чуйская область" ломается с NullPointerException) —
  // стандартный обход: пробелы кодируются как "%s" для команды input text.
  const escaped = text.replace(/ /g, '%s');
  execFileSync('adb', ['-s', DEVICE, 'shell', 'input', 'text', escaped]);
  await new Promise((r) => setTimeout(r, 300));
  // Скрываем клавиатуру, иначе она перекрывает элементы ниже по форме
  // (чекбоксы согласия, кнопку отправки и т.д.).
  execFileSync('adb', ['-s', DEVICE, 'shell', 'input', 'keyevent', '4']);
  await new Promise((r) => setTimeout(r, 300));
}

function tapXY(x, y) {
  execFileSync('adb', ['-s', DEVICE, 'shell', 'input', 'tap', String(x), String(y)]);
}

function pressBack() {
  execFileSync('adb', ['-s', DEVICE, 'shell', 'input', 'keyevent', '4']);
}

// Эта debug-сборка содержит постоянно висящий отладочный виджет "Debug: Push log",
// у которого accessibility-границы растянуты на ВЕСЬ экран (bounds="[0,0][ширина][высота]"),
// хотя визуально это узкая плашка внизу экрана. Из-за этого он перехватывает тапы,
// нацеленные на элементы, чей центр приходится на нижние ~250px экрана (диалоги,
// кнопки подтверждения и т.п.). Обходим это, кликая по верхней границе элемента,
// а не по его центру, когда элемент близко к низу экрана.
async function clickAvoidingDebugOverlay(element) {
  const rect = await element.getElementRect(await element.elementId);
  const safeY = rect.y + Math.min(15, Math.floor(rect.height / 4));
  const safeX = rect.x + Math.floor(rect.width / 2);
  tapXY(safeX, safeY);
}

module.exports = { typeIntoElement, tapXY, pressBack, clickAvoidingDebugOverlay };
