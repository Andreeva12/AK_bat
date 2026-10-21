// pages/ForgotPasswordPage.js
// Экран "Забыли пароль?", открывается ссылкой с LoginPage. Поле телефона уже
// содержит префикс "+996 " как исходный text (не hint) — вводить нужно
// дописыванием к существующему значению, а не заменой.
const { typeIntoElement } = require('../utils/adbInput');

class ForgotPasswordPage {
  get phoneInput() {
    return $('//android.widget.EditText[@text="+996 "]');
  }

  get doneButton() {
    return $('//android.widget.Button[contains(@content-desc,"Готово")]');
  }

  async isDisplayed() {
    return this.phoneInput.isExisting();
  }

  async submitPhone(localNumber) {
    await typeIntoElement(await this.phoneInput, localNumber);
    await this.doneButton.click();
  }
}

module.exports = new ForgotPasswordPage();
