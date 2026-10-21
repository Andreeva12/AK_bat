// pages/OnboardingPage.js
// Три вступительных слайда, показываются только на самом первом запуске (после
// pm clear/переустановки): "Большой каталог!" → "Отслеживание заказа!" →
// "Заказывайте воду уже сейчас!" + кнопка "Начать". У кнопки "далее" на первых
// двух слайдах нет content-desc (просто ImageView) — используем координаты.
const { tapXY } = require('../utils/adbInput');

const NEXT_BUTTON_XY = [1786, 1927];

class OnboardingPage {
  get firstSlideHeading() {
    return $('//*[contains(@content-desc,"Большой каталог")]');
  }

  get startButton() {
    return $('//*[contains(@content-desc,"Начать")]');
  }

  async isDisplayed() {
    return this.firstSlideHeading.isExisting();
  }

  async skipIfPresent() {
    if (!(await this.isDisplayed())) return;
    tapXY(...NEXT_BUTTON_XY); // слайд 1 -> 2
    await new Promise((r) => setTimeout(r, 800));
    tapXY(...NEXT_BUTTON_XY); // слайд 2 -> 3
    await new Promise((r) => setTimeout(r, 800));
    await this.startButton.click(); // слайд 3 -> экран выбора роли
    await new Promise((r) => setTimeout(r, 800));
  }
}

module.exports = new OnboardingPage();
