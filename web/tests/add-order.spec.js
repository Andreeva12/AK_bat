import { test, expect } from '@playwright/test';
import { OrdersPage } from '../pages/orders.page.js';
import { OrderFormPage } from '../pages/orderForm.page.js';
import { loginAsAdmin } from '../utils/auth.js';

// Структурные и валидационные проверки формы создания заказа (/add-order),
// без реального сохранения заказа (happy-path создание уже покрыто order-create.spec.js).
test.describe('Форма создания заказа — структура и значения по умолчанию', () => {
  let orderForm;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);

    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();
    await ordersPage.waitForLoaded();
    await ordersPage.clickAddOrder();

    orderForm = new OrderFormPage(page);
    await orderForm.waitForLoaded();
  });

  test('заголовок "Создание нового заказа" отображается', async () => {
    await expect(orderForm.heading).toBeVisible();
  });

  test('по умолчанию выбран тип заказчика "Физическое лицо"', async ({ page }) => {
    const physicalInput = page.locator('input[value="physical"]');
    const legalInput = page.locator('input[value="legal"]');
    await expect(physicalInput).toBeChecked();
    await expect(legalInput).not.toBeChecked();
  });

  test('переключение на "Юридическое лицо" меняет поле поиска клиента на поиск компании', async ({ page }) => {
    await orderForm.selectCustomerType('legal');
    await expect(orderForm.companySearchInput).toBeVisible();
  });

  test('поле "Адрес доставки" недоступно, пока не выбран клиент', async () => {
    await expect(orderForm.addressSelectInput).toBeDisabled();
  });

  test('способ доставки: 4 ожидаемых варианта в списке', async () => {
    // подписи опций подгружаются с API асинхронно — toHaveText сам повторяет проверку
    await expect(orderForm.deliveryMethodSelect.locator('option')).toHaveText([
      'Стандартная доставка (24 часа)',
      'Экспресс-доставка (2 часа)',
      'Самовывоз',
      'Доставка по расписанию',
    ]);
  });

  test('способ оплаты: 3 ожидаемых варианта в списке', async () => {
    // подписи опций подгружаются с API асинхронно — toHaveText сам повторяет проверку
    await expect(orderForm.paymentMethodSelect.locator('option')).toHaveText([
      'Наличными курьеру',
      'Картой курьеру',
      'Оплата Mega Pay',
    ]);
  });

  test('статус оплаты: 4 ожидаемых варианта в списке', async () => {
    // подписи опций подгружаются с API асинхронно — toHaveText сам повторяет проверку
    await expect(orderForm.paymentStatusSelect.locator('option')).toHaveText([
      'Ожидает оплаты',
      'Оплачено',
      'Отменено',
      'Возврат средств',
    ]);
  });

  // ВНИМАНИЕ (потенциальный баг продукта): в отличие от "Статус заказа", который
  // при создании заказа реально предзаполнен значением "new", поля "Способ доставки",
  // "Способ оплаты" и "Статус оплаты" визуально показывают первую опцию, но их
  // фактическое значение (v-model) остаётся пустой строкой, пока оператор не
  // выберет что-то вручную. Это помеченные как обязательные (*) поля — стоит
  // проверить на бэкенде, что произойдёт, если отправить заказ без явного выбора.
  test('способ доставки/оплаты/статус оплаты фактически не выбраны, пока оператор их не тронет', async () => {
    await expect(orderForm.deliveryMethodSelect).toHaveValue('');
    await expect(orderForm.paymentMethodSelect).toHaveValue('');
    await expect(orderForm.paymentStatusSelect).toHaveValue('');
  });

  test('статус заказа: все 12 вариантов присутствуют, по умолчанию "Новый"', async () => {
    // подписи опций подгружаются с API асинхронно — toHaveText сам повторяет проверку
    await expect(orderForm.orderStatusSelect.locator('option')).toHaveText([
      'Новый',
      'Подтвержден',
      'В процессе',
      'Завершен',
      'Отменен клиентом',
      'Отменен оператором',
      'Принят к доставке',
      'В доставке',
      'Запланировано',
      'Ожидает курьера',
      'Отменен курьером',
      'Ошибка доставки',
    ]);
    await expect(orderForm.orderStatusSelect).toHaveValue('new');
  });

  test('чекбокс "Подъем на этаж" по умолчанию выключен', async () => {
    await expect(orderForm.liftCheckbox).not.toBeChecked();
  });

  test('корзина пуста по умолчанию: "В заказе пока нет товаров"', async () => {
    await expect(orderForm.emptyCompositionText).toBeVisible();
  });

  test('суммы по умолчанию равны 0 сом.', async ({ page }) => {
    // "Сумма по товарам:" находится в <strong>, а "0 сом." — соседний текстовый узел
    // в родительском <div>, поэтому проверяем родителя, а не сам <strong>.
    await expect(page.getByText('Сумма по товарам:').locator('xpath=..')).toContainText('0 сом.');
    await expect(page.getByText('Доставка:', { exact: true }).locator('xpath=..')).toContainText('0 сом.');
    await expect(page.getByText('Итого к оплате:').locator('xpath=..')).toContainText('0 сом.');
  });

  test('предупреждение об отсутствии исполнителя видно, пока курьер не назначен', async () => {
    await expect(orderForm.noCourierWarning).toBeVisible();
  });

  test('блок "Адрес на карте" отображается', async () => {
    await expect(orderForm.mapCardHeading).toBeVisible();
    await expect(orderForm.mapSectionHeading).toBeVisible();
  });

  test('кнопки "Сохранить изменения" и "Отмена" видны', async () => {
    await expect(orderForm.saveButton).toBeVisible();
    await expect(orderForm.cancelButton).toBeVisible();
  });

  test('кнопка "Отмена" возвращает на страницу заказов', async ({ page }) => {
    await orderForm.cancel();
    await expect(page).toHaveURL(/\/orders/);
  });

  test('кнопка "←" (назад) в заголовке возвращает на страницу заказов', async ({ page }) => {
    await orderForm.backButton.click();
    await expect(page).toHaveURL(/\/orders/);
  });

  test('попытка сохранить без выбранного клиента и адреса не создаёт заказ', async ({ page }) => {
    await orderForm.save();
    // Форма должна остаться на /add-order (валидация не пропускает пустые обязательные поля)
    await expect(page).toHaveURL(/\/add-order/);
  });
});
