// pages/HomePage.js
class HomePage {
  get notificationsIcon() {
    return $('~Уведомления');
  }

  get favoritesIcon() {
    return $('~Избранные');
  }

  // Кнопка профиля всегда имеет одну и ту же accessibility-метку "Мой профиль" —
  // и залогинен пользователь, и нет (меняется только визуальное содержимое:
  // текст+иконка против просто иконки). Поэтому по одному только наличию этого
  // элемента на главном экране узнать состояние логина нельзя — нужно смотреть,
  // какой экран открывается после тапа (см. openProfile()/LoginPage/AccountPage).
  get profileButton() {
    return $('~Мой профиль');
  }

  get searchInput() {
    return $('//*[contains(@content-desc,"Поиск в Ак-Бате")]');
  }

  get bonusesRow() {
    return $('//*[contains(@content-desc,"Мои бонусы")]');
  }

  get promoSectionHeading() {
    return $('~Акционные товары!');
  }

  get categoriesHeading() {
    return $('~Категории');
  }

  get promoViewAllLink() {
    return $('//*[contains(@content-desc,"Смотреть все")]');
  }

  categoryTile(name) {
    return $(`//*[contains(@content-desc,"${name}")]`);
  }

  async isDisplayed() {
    return this.searchInput.isExisting();
  }

  async openProfile() {
    await this.profileButton.click();
  }
}

module.exports = new HomePage();
