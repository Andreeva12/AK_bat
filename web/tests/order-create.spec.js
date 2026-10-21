import { test, expect } from '@playwright/test';
import { OrdersPage } from '../pages/orders.page.js';
import { OrderFormPage } from '../pages/orderForm.page.js';
import { loginAsAdmin } from '../utils/auth.js';

test.describe('Создание заказа для физического лица', () => {
  let ordersPage;
  let orderForm;

  test.beforeEach(async ({ page }) => {
    // 1. Авторизация
    await loginAsAdmin(page);

    // 2. Переход на страницу заказов и клик "Добавить"
    ordersPage = new OrdersPage(page);
    await ordersPage.goto();
    await ordersPage.waitForLoaded();
    await ordersPage.clickAddOrder();

    // 3. Инициализация формы
    orderForm = new OrderFormPage(page);
    await orderForm.waitForLoaded();
  });

  test('Успешное создание заказа для существующего физ. лица', async ({ page }) => {
    // Данные тестового покупателя (проверено вручную)
    const customerPhone = '+996555666777';
    const customerName = 'Auto Test';
    const addressText = 'Токтогула, д. 126';

    // 1. Выбираем тип – физическое лицо (по умолчанию уже выбрано, но для явности)
    await orderForm.selectCustomerType('physical');

    // 2. Поиск и выбор клиента по телефону
    await orderForm.searchClient(customerPhone);

    // 3. Проверяем, что клиент выбран (отображается в виде vs__selected)
    const selectedClient = page.locator('.v-select .vs__selected', { hasText: customerName });
    await expect(selectedClient).toBeVisible({ timeout: 5000 });

    // 4. Выбор адреса доставки (после выбора клиента поле разблокируется)
    await orderForm.setDeliveryAddress(addressText);

    // 4a. Явно выбираем способ доставки/оплаты и статус оплаты — несмотря на то что
    // первая опция визуально выглядит выбранной, фактическое значение (v-model) этих
    // native-select полей остаётся пустым, пока оператор не выберет вручную (см.
    // add-order.spec.js: "способ доставки/оплаты/статус оплаты фактически не выбраны").
    // Без этого шага сохранение заказа не проходит валидацию обязательных полей.
    await orderForm.deliveryMethodSelect.selectOption('standard');
    await orderForm.paymentMethodSelect.selectOption('cash');
    await orderForm.paymentStatusSelect.selectOption('pending');

    // 5. Установка времени доставки (сегодня, 14:00)
    await orderForm.setDeliveryTime('14:00');

    // 6. Добавление товара (например, "Вода")
    await orderForm.addProductToOrder('Вода');
    // Проверяем, что товар появился в корзине
    const cartRows = page.locator('table tbody tr:not(:has(td[colspan]))');
    await expect(cartRows).toHaveCount(1);

    // 7. Сохраняем заказ
    await orderForm.save();

    // 8. После сохранения приложение редиректит на страницу редактирования
    // только что созданного заказа (/edit-order/:id), а не на список /orders —
    // это и есть подтверждение успешного создания.
    await page.waitForURL(/\/edit-order\/\d+/, { timeout: 15000 });
  });
});