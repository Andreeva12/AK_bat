// pages/AccountPage.js — экран профиля/настроек залогиненного пользователя
const { clickAvoidingDebugOverlay } = require('../utils/adbInput');

class AccountPage {
  get userName() {
    return $('~Auto_test');
  }

  get orderHistoryLink() {
    return $('//*[contains(@content-desc,"История заказов")]');
  }

  get myBonusesLink() {
    return $('//*[contains(@content-desc,"Мои бонусы")]');
  }

  get myAddressesLink() {
    return $('//*[contains(@content-desc,"Мои адреса")]');
  }

  get notificationsSettingsLink() {
    return $('//*[contains(@content-desc,"Уведомления")]');
  }

  get supportLink() {
    return $('//*[contains(@content-desc,"Служба поддержки")]');
  }

  get changePasswordLink() {
    return $('//*[contains(@content-desc,"Изменить пароль")]');
  }

  get languageLink() {
    return $('//*[contains(@content-desc,"Язык")]');
  }

  get logoutLink() {
    return $('//*[contains(@content-desc,"Выйти из аккаунта")]');
  }

  get deleteAccountLink() {
    return $('~Удалить аккаунт');
  }

  get logoutConfirmButton() {
    return $('//android.widget.Button[contains(@content-desc,"Выйти")]');
  }

  get logoutCancelButton() {
    return $('//android.widget.Button[contains(@content-desc,"Отмена")]');
  }

  async isDisplayed() {
    // "Выйти из аккаунта" требует скролла вниз — проверяем то, что видно сразу.
    return this.orderHistoryLink.isExisting();
  }

  async scrollToLogout() {
    // "Выйти из аккаунта" обычно ниже сгиба экрана — скроллим вниз, пока не появится.
    const { execFileSync } = require('child_process');
    const DEVICE = process.env.ANDROID_DEVICE || 'emulator-5554';
    for (let i = 0; i < 5 && !(await this.logoutLink.isExisting()); i++) {
      execFileSync('adb', ['-s', DEVICE, 'shell', 'input', 'swipe', '1038', '1800', '1038', '400', '300']);
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  async logout() {
    await this.scrollToLogout();
    await this.logoutLink.click();
    // Кнопки подтверждения в диалоге частично перекрыты debug-плашкой внизу экрана —
    // кликаем по верхнему краю границ элемента, а не по центру.
    await clickAvoidingDebugOverlay(await this.logoutConfirmButton);
  }
}

module.exports = new AccountPage();
