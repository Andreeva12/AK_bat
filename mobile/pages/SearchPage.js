// pages/SearchPage.js
// Отдельный экран поиска, открывается тапом по полю поиска на главном экране
// (HomePage.searchInput) — это НЕ инлайновое поле, а переход на новый экран
// со своим EditText (ссылка на исходный элемент "протухает" после перехода).
class SearchPage {
  get backButton() {
    return $('~Назад');
  }

  get recentSearchHeading() {
    return $('~Недавний поиск');
  }

  get inputField() {
    return $('//android.widget.EditText');
  }

  resultTile(name) {
    return $(`//*[contains(@content-desc,"${name}")]`);
  }

  async isDisplayed() {
    return this.inputField.isExisting();
  }

  async search(query) {
    const field = await this.inputField;
    await field.click();
    await field.setValue(query);
  }
}

module.exports = new SearchPage();
