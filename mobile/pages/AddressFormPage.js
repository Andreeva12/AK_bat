// pages/AddressFormPage.js
// Форма "Добавить адрес". Верхнее поле ("Введите улицу и номер дома") — это
// поле геокодинг-автокомплита; на эмуляторе БЕЗ настоящих GPS-координат оно
// не возвращает подсказок, и кнопка "Готово" остаётся disabled даже после
// заполнения всех полей ниже (Регион/Город/Улица/Дом) вручную — заполнение
// текстовых полей само по себе не присваивает address_id.
//
// РАБОЧИЙ обходной путь, подтверждённый вживую: переключиться в режим "Карта"
// (mapToggleButton), задать эмулятору фиктивные GPS-координаты через
// `adb emu geo fix <lon> <lat>` (см. openMapAndUseMockLocation), затем
// нажать "Перейти к моей геопозиции" — приложение делает обратный геокодинг
// координат в реальный адрес (например, "Кыргызстан, Бишкек, ул. ...") и
// САМО заполняет Регион/Город/Улица/Дом; кнопка "Готово" на карте (одиночная
// метка content-desc="Готово", НЕ задвоенная) становится enabled=true.
// Дальше форма возвращается с уже подставленными полями — остаётся заполнить
// этаж/подъезд по желанию и нажать доубленную кнопку "Готово" формы.
class AddressFormPage {
  get heading() {
    return $('//*[contains(@content-desc,"Добавить адрес")]');
  }

  get backButton() {
    return $('~Назад');
  }

  get mapToggleButton() {
    return $('//android.widget.Button[@content-desc="Карта\nКарта"]');
  }

  get topSearchField() {
    return $('//android.widget.EditText[@hint="Введите улицу и номер дома"]');
  }

  get regionField() {
    return $('//android.widget.EditText[@hint="Регион, область"]');
  }

  get cityField() {
    return $('//android.widget.EditText[@hint="Город, населенный пункт"]');
  }

  get districtField() {
    return $('//android.widget.EditText[@hint="Район, микрорайон"]');
  }

  get streetField() {
    return $('//android.widget.EditText[@hint="Улица"]');
  }

  get houseField() {
    return $('//android.widget.EditText[@hint="Номер дома"]');
  }

  get buildingField() {
    return $('//android.widget.EditText[@hint="напр. Рынок, ТЦ, Шк"]');
  }

  get blockField() {
    return $('//android.widget.EditText[@hint="Корпус, блок"]');
  }

  get apartmentField() {
    return $('//android.widget.EditText[@hint="Номер квартиры, офиса, кабинета"]');
  }

  get floorField() {
    return $('//android.widget.EditText[@hint="Номер этажа"]');
  }

  get entranceField() {
    return $('//android.widget.EditText[@hint="Номер подъезда"]');
  }

  get doneButton() {
    return $('//*[@content-desc="Готово\nГотово"]');
  }

  get mapMyLocationButton() {
    return $('//android.widget.Button[@content-desc="Перейти к моей геопозиции"]');
  }

  // Одиночная метка (НЕ задвоенная, в отличие от doneButton формы) — кнопка
  // подтверждения на самом экране карты.
  get mapDoneButton() {
    return $('//*[@content-desc="Готово"]');
  }

  async isDisplayed() {
    return this.regionField.isExisting();
  }

  // "Готово" находится в самом низу длинной прокручиваемой формы — после
  // заполнения верхних полей клавиатура остаётся открытой и элемент часто
  // не попадает в дерево accessibility без прокрутки вниз.
  async scrollToDoneButton() {
    const { execFileSync } = require('child_process');
    const DEVICE = process.env.ANDROID_DEVICE || 'emulator-5554';
    for (let i = 0; i < 5 && !(await this.doneButton.isExisting()); i++) {
      execFileSync('adb', ['-s', DEVICE, 'shell', 'input', 'swipe', '1038', '1800', '1038', '600', '300']);
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  async isDoneEnabled() {
    await this.scrollToDoneButton();
    return (await this.doneButton.getAttribute('enabled')) === 'true';
  }

  // Заполняет обязательные поля вручную (Регион/Город/Улица/Дом). ВНИМАНИЕ:
  // на текущем окружении этого недостаточно, чтобы разблокировать "Готово" —
  // см. комментарий к классу.
  async fillRequiredFieldsManually({ region, city, street, house }) {
    await this.regionField.click();
    await this.regionField.setValue(region);
    await this.cityField.click();
    await this.cityField.setValue(city);
    await this.streetField.click();
    await this.streetField.setValue(street);
    await this.houseField.click();
    await this.houseField.setValue(house);
  }

  async searchTopField(query) {
    await this.topSearchField.click();
    await this.topSearchField.setValue(query);
  }

  // Единственный подтверждённо рабочий способ получить валидный address_id
  // в этом тестовом окружении. lon/lat — фиктивные GPS-координаты (например,
  // координаты Бишкека), которые приложение обратным геокодингом превращает
  // в реальный адрес и само подставляет в поля формы.
  async useMockLocation(lon, lat) {
    const { execFileSync } = require('child_process');
    const DEVICE = process.env.ANDROID_DEVICE || 'emulator-5554';
    execFileSync('adb', ['-s', DEVICE, 'emu', 'geo', 'fix', String(lon), String(lat)]);
    await this.mapToggleButton.click();
    await new Promise((r) => setTimeout(r, 2000));
    // Системный диалог Google Play Services про точную геолокацию иногда
    // перекрывает карту при первом открытии — закрыть, если появился.
    const noThanksBtn = await $('//android.widget.Button[@text="Нет, спасибо"]');
    if (await noThanksBtn.isExisting()) {
      await noThanksBtn.click();
      await new Promise((r) => setTimeout(r, 1000));
    }
    await this.mapMyLocationButton.click();
    await new Promise((r) => setTimeout(r, 2000));
    await this.mapDoneButton.click();
    await new Promise((r) => setTimeout(r, 1200));
  }

  async save() {
    await this.scrollToDoneButton();
    await this.doneButton.click();
  }
}

module.exports = new AddressFormPage();
