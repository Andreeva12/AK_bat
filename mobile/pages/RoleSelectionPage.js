// pages/RoleSelectionPage.js
// Экран выбора роли ("Пользователь" / "Экспедитор") — показывается при первом
// запуске приложения и доступен повторно через "Переход к выбору типа приложения"
// на экране логина.
class RoleSelectionPage {
  get customerRole() {
    return $('~Пользователь');
  }

  get courierRole() {
    return $('~Экспедитор');
  }

  async isDisplayed() {
    return this.customerRole.isExisting();
  }

  async selectCustomer() {
    await this.customerRole.click();
  }

  async selectCourier() {
    await this.courierRole.click();
  }
}

module.exports = new RoleSelectionPage();
