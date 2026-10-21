const { expect } = require('chai');
const HomePage = require('../../pages/HomePage');
const LoginPage = require('../../pages/LoginPage');
const CatalogPage = require('../../pages/CatalogPage');
const ProductDetailPage = require('../../pages/ProductDetailPage');
const CartPage = require('../../pages/CartPage');
const CheckoutPage = require('../../pages/CheckoutPage');
const PaymentMethodPage = require('../../pages/PaymentMethodPage');
const AddressListPage = require('../../pages/AddressListPage');
const AddressFormPage = require('../../pages/AddressFormPage');
const OrderConfirmationPage = require('../../pages/OrderConfirmationPage');
const OrderSuccessPage = require('../../pages/OrderSuccessPage');
const OrderHistoryPage = require('../../pages/OrderHistoryPage');
const AccountPage = require('../../pages/AccountPage');
const { ensureOnHomeScreen, returnToHomeScreen } = require('../../utils/appLaunch');

const TEST_PHONE_LOCAL = process.env.TEST_PHONE_LOCAL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;
const KNOWN_CATEGORY = 'Готовая продукция';
const KNOWN_PRODUCT = 'Вода питьевая Ак-Бата 18л.';

async function loginIfNeeded() {
  await HomePage.openProfile();
  if (await LoginPage.isDisplayed()) {
    await LoginPage.login(TEST_PHONE_LOCAL, TEST_PASSWORD);
    await driver.waitUntil(async () => HomePage.isDisplayed(), {
      timeout: 15000,
      timeoutMsg: 'не удалось залогиниться тестовым аккаунтом',
    });
  } else {
    await returnToHomeScreen();
  }
}

// С 2026-07-15 приложение требует реальный address_id ДАЖЕ для "Самовывоз"
// (новое поле "Адрес" рядом с фиксированным "Пункт выдачи") — это исправление
// прежнего бага, при котором заказ самовывозом отклонялся сервером. Выбирает
// первый сохранённый адрес; если сохранённых адресов ещё нет, создаёт один
// через рабочий обходной путь с моковым GPS (см. AddressFormPage.useMockLocation).
async function selectAnyAvailableAddress() {
  await CheckoutPage.openAddressPicker();
  await driver.waitUntil(async () => AddressListPage.isDisplayed(), {
    timeout: 10000,
    timeoutMsg: 'не открылся список адресов',
  });
  const hasSaved = await AddressListPage.savedAddressItem('д.').isExisting();
  if (hasSaved) {
    await AddressListPage.savedAddressItem('д.').click();
  } else {
    await AddressListPage.openAddAddress();
    await AddressFormPage.useMockLocation(74.5698, 42.8746);
    await AddressFormPage.save();
  }
  await driver.waitUntil(async () => CheckoutPage.isDisplayed(), {
    timeout: 10000,
    timeoutMsg: 'не вернулись на экран оформления заказа после выбора адреса',
  });
}

async function goToCheckoutWithKnownProduct() {
  await CatalogPage.openCategory(KNOWN_CATEGORY);
  await CatalogPage.openProduct(KNOWN_PRODUCT);
  await ProductDetailPage.addToCart();
  await driver.waitUntil(async () => ProductDetailPage.openCartBar.isExisting(), {
    timeout: 10000,
    timeoutMsg: 'товар не добавился в корзину',
  });
  await ProductDetailPage.openCart();
  await CartPage.checkout();
  await driver.waitUntil(async () => CheckoutPage.isDisplayed(), {
    timeout: 10000,
    timeoutMsg: 'не открылся экран оформления заказа',
  });
}

describe('Оформление заказа: экран и способы оплаты', () => {
  before(async function () {
    this.timeout(60000);
    await ensureOnHomeScreen();
    await loginIfNeeded();
  });

  beforeEach(async function () {
    this.timeout(60000);
    await goToCheckoutWithKnownProduct();
  });

  afterEach(async function () {
    this.timeout(30000);
    await returnToHomeScreen();
  });

  it('экран оформления заказа показывает все ключевые секции для самовывоза по умолчанию', async () => {
    expect(await CheckoutPage.isDisplayed()).to.be.true;
    expect(await CheckoutPage.isPickupSelected(), 'по умолчанию должен быть выбран "Самовывоз"').to.be.true;
    expect(await CheckoutPage.pickupPointLabel.isExisting(), 'пункт выдачи').to.be.true;
    expect(await CheckoutPage.editRecipientButton.isExisting(), 'кнопка изменения данных получателя').to.be.true;
    expect(await CheckoutPage.commentButton.isExisting(), 'поле комментария').to.be.true;
    expect(await CheckoutPage.paymentMethodButton.isExisting(), 'кнопка способа оплаты').to.be.true;
  });

  it('кнопка "Оформить заказ" задизейблена, пока не выбраны способ оплаты и адрес', async () => {
    expect(await CheckoutPage.isPlaceOrderEnabled(), 'без способа оплаты и адреса кнопка должна быть недоступна').to
      .be.false;
  });

  it('кнопка "Оформить заказ" остаётся задизейблена при выбранном способе оплаты, но без адреса', async () => {
    await CheckoutPage.openPaymentMethodSelector();
    await PaymentMethodPage.selectCashToCourier();
    expect(
      await CheckoutPage.isPlaceOrderEnabled(),
      'с 2026-07-15 одного способа оплаты недостаточно — требуется ещё и адрес',
    ).to.be.false;
  });

  it('переключение на "Курьер" показывает адрес доставки и варианты даты доставки', async () => {
    await CheckoutPage.selectCourier();
    expect(await CheckoutPage.isCourierSelected()).to.be.true;
    expect(await CheckoutPage.deliveryAddressButton.isExisting(), 'кнопка выбора адреса').to.be.true;
    expect(await CheckoutPage.deliveryDateStandard.isExisting(), 'стандартная доставка (24ч)').to.be.true;
    expect(await CheckoutPage.deliveryDateExpress.isExisting(), 'экспресс-доставка (2ч)').to.be.true;
    expect(await CheckoutPage.deliveryDateScheduled.isExisting(), 'доставка по расписанию').to.be.true;
  });

  it('переключение обратно на "Самовывоз" снова показывает фиксированный пункт выдачи', async () => {
    await CheckoutPage.selectCourier();
    await CheckoutPage.selectPickup();
    expect(await CheckoutPage.isPickupSelected()).to.be.true;
    expect(await CheckoutPage.pickupPointLabel.isExisting()).to.be.true;
  });

  it('селектор способа оплаты показывает все 6 методов и кнопку отмены', async () => {
    await CheckoutPage.openPaymentMethodSelector();
    expect(await PaymentMethodPage.isDisplayed()).to.be.true;
    expect(await PaymentMethodPage.cashToCourier.isExisting(), 'Наличными курьеру').to.be.true;
    expect(await PaymentMethodPage.cardToCourier.isExisting(), 'Картой курьеру').to.be.true;
    expect(await PaymentMethodPage.onlinePaymentHeading.isExisting(), 'заголовок "Онлайн оплата"').to.be.true;
    expect(await PaymentMethodPage.megaPay.isExisting(), 'MegaPay').to.be.true;
    expect(await PaymentMethodPage.mbank.isExisting(), 'Mbank').to.be.true;
    expect(await PaymentMethodPage.bakaiBank.isExisting(), 'Бакай Банк').to.be.true;
    expect(await PaymentMethodPage.kicb.isExisting(), 'KICB').to.be.true;
    expect(await PaymentMethodPage.cancelButton.isExisting(), 'кнопка отмены').to.be.true;
  });

  it('отмена в селекторе способа оплаты не выбирает метод и не разблокирует "Оформить заказ"', async () => {
    await CheckoutPage.openPaymentMethodSelector();
    await PaymentMethodPage.cancel();
    expect(await CheckoutPage.isDisplayed(), 'должны вернуться на экран оформления заказа').to.be.true;
    expect(await CheckoutPage.isPlaceOrderEnabled(), 'кнопка заказа должна остаться недоступна').to.be.false;
  });

  const paymentMethods = [
    ['Наличными курьеру', () => PaymentMethodPage.selectCashToCourier()],
    ['Картой курьеру', () => PaymentMethodPage.selectCardToCourier()],
    ['MegaPay', () => PaymentMethodPage.selectMegaPay()],
    ['Mbank', () => PaymentMethodPage.selectMbank()],
    ['Бакай Банк', () => PaymentMethodPage.selectBakaiBank()],
    ['KICB', () => PaymentMethodPage.selectKicb()],
  ];

  paymentMethods.forEach(([name, select]) => {
    it(`выбор способа оплаты "${name}" + адреса разблокирует кнопку "Оформить заказ"`, async function () {
      this.timeout(60000);
      await selectAnyAvailableAddress();
      await CheckoutPage.openPaymentMethodSelector();
      await select();
      expect(
        await CheckoutPage.isPlaceOrderEnabled(),
        `после выбора адреса и "${name}" кнопка должна стать доступна`,
      ).to.be.true;
    });
  });

  it('форма "Добавить адрес" (курьер) содержит все поля ручного ввода', async () => {
    await CheckoutPage.selectCourier();
    await CheckoutPage.openAddressPicker();
    expect(await AddressListPage.isDisplayed(), 'модалка выбора адреса').to.be.true;
    expect(await AddressListPage.addAddressButton.isExisting(), 'кнопка "Добавить адрес"').to.be.true;

    await AddressListPage.openAddAddress();
    expect(await AddressFormPage.isDisplayed(), 'форма добавления адреса').to.be.true;
    expect(await AddressFormPage.topSearchField.isExisting(), 'поле поиска адреса').to.be.true;
    expect(await AddressFormPage.regionField.isExisting(), 'поле "Регион, область"').to.be.true;
    expect(await AddressFormPage.cityField.isExisting(), 'поле "Город"').to.be.true;
    expect(await AddressFormPage.streetField.isExisting(), 'поле "Улица"').to.be.true;
    expect(await AddressFormPage.houseField.isExisting(), 'поле "Номер дома"').to.be.true;

    await returnToHomeScreen();
  });

  it('ОГРАНИЧЕНИЕ ОКРУЖЕНИЯ: заполнение формы адреса вручную не разблокирует "Готово" без гео-подсказки/карты', async function () {
    this.timeout(60000);
    await CheckoutPage.selectCourier();
    await CheckoutPage.openAddressPicker();
    await AddressListPage.openAddAddress();
    await AddressFormPage.fillRequiredFieldsManually({
      region: 'Чуйская область',
      city: 'Бишкек',
      street: 'ул. Тестовая',
      house: '1',
    });
    // См. комментарий в pages/AddressFormPage.js: на офлайн-эмуляторе без
    // подсказок геокодинга и без выбора точки на карте у адреса нет
    // настоящего address_id, поэтому "Готово" остаётся недоступна, даже
    // когда все текстовые поля заполнены корректно. Это подтверждённое,
    // воспроизводимое поведение текущего тестового окружения — не баг сам
    // по себе, но прямая причина, по которой ниже описанный тест оформления
    // заказа падает.
    expect(
      await AddressFormPage.isDoneEnabled(),
      'известное ограничение окружения: "Готово" должна быть недоступна без реального geocoding/карты',
    ).to.be.false;

    await returnToHomeScreen();
  });

  it('happy path: полное оформление заказа самовывозом наличными завершается успешно', async function () {
    this.timeout(90000);
    await selectAnyAvailableAddress();
    await CheckoutPage.openPaymentMethodSelector();
    await PaymentMethodPage.selectCashToCourier();
    expect(await CheckoutPage.isPlaceOrderEnabled(), 'кнопка должна быть активна после выбора адреса и оплаты').to.be
      .true;

    await CheckoutPage.placeOrder();
    await driver.waitUntil(async () => OrderConfirmationPage.isDisplayed(), {
      timeout: 10000,
      timeoutMsg: 'не открылся экран подтверждения заказа',
    });
    expect(await OrderConfirmationPage.totalAmount.isExisting(), 'сумма заказа на экране подтверждения').to.be.true;
    expect(
      await OrderConfirmationPage.hasValidationError(),
      'не должно быть ошибки валидации при выбранном адресе',
    ).to.be.false;

    await OrderConfirmationPage.confirm();
    await driver.waitUntil(async () => OrderSuccessPage.isDisplayed(), {
      timeout: 10000,
      timeoutMsg: 'не появился статус "Оплата в обработке" после подтверждения заказа',
    });
    expect(await OrderSuccessPage.orderStatusLabel.isExisting(), 'метка "Статус заказа"').to.be.true;
  });
});

describe('Оформление заказа: история заказов', () => {
  before(async function () {
    this.timeout(60000);
    await ensureOnHomeScreen();
    await loginIfNeeded();
  });

  it('экран истории заказов открывается из профиля', async () => {
    await HomePage.openProfile();
    await driver.waitUntil(async () => AccountPage.isDisplayed(), {
      timeout: 10000,
      timeoutMsg: 'не открылся экран аккаунта',
    });
    await AccountPage.orderHistoryLink.click();
    await driver.waitUntil(async () => OrderHistoryPage.isDisplayed(), {
      timeout: 10000,
      timeoutMsg: 'не открылся экран истории заказов',
    });
    expect(await OrderHistoryPage.isDisplayed()).to.be.true;
  });
});
