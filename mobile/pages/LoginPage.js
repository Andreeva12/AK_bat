// pages/LoginPage.js
const { typeIntoElement } = require('../utils/adbInput');

class LoginPage {
  get heading() {
    // Заголовок экрана — статический текст, НЕ кнопка (clickable=false).
    return $('android=new UiSelector().description("Вход").clickable(false)');
  }

  get physicalTab() {
    return $('//*[contains(@content-desc,"Физ. лицо")]');
  }

  get legalTab() {
    return $('//*[contains(@content-desc,"Юр. лицо")]');
  }

  get phoneInput() {
    return $('//android.widget.EditText[@hint="Номер телефона +996"]');
  }

  get passwordInput() {
    return $('//android.widget.EditText[@hint="Пароль"]');
  }

  get termsCheckbox() {
    return $('//android.widget.CheckBox');
  }

  get loginButton() {
    // Кнопка — единственный элемент класса Button с "Вход" в content-desc
    // (заголовок экрана — android.view.View, не Button, поэтому contains() безопасен).
    return $('//android.widget.Button[contains(@content-desc,"Вход")]');
  }

  get forgotPasswordLink() {
    return $('//*[contains(@content-desc,"Забыли пароль")]');
  }

  get incorrectCredentialsError() {
    return $('//android.view.View[@content-desc="Неверный логин или пароль."]');
  }

  get registerLink() {
    return $('~Регистрация');
  }

  get backToRoleSelectionLink() {
    return $('~Переход к выбору типа приложения');
  }

  async isDisplayed() {
    return this.phoneInput.isExisting();
  }

  async fillPhone(localNumber) {
    await typeIntoElement(await this.phoneInput, localNumber);
  }

  async fillPassword(password) {
    await typeIntoElement(await this.passwordInput, password);
  }

  async acceptTerms() {
    const checked = await this.termsCheckbox.getAttribute('checked');
    if (checked !== 'true') {
      await this.termsCheckbox.click();
    }
  }

  async submit() {
    await this.loginButton.click();
  }

  async selectPhysicalPersonTab() {
    if (await this.physicalTab.isExisting()) {
      await this.physicalTab.click();
    }
  }

  async login(localNumber, password) {
    await this.selectPhysicalPersonTab();
    await this.fillPhone(localNumber);
    await this.fillPassword(password);
    await this.acceptTerms();
    await this.submit();
  }
}

module.exports = new LoginPage();
