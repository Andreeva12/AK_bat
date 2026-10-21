const { test, expect } = require('@playwright/test');
const { DeliveryPage } = require('../pages/DeliveryPage');
const { loginAsAdmin } = require('../utils/auth');

// Тесты только читают тарифные зоны доставки — ничего не сохраняют,
// чтобы не менять реальные цены и расписание доставки.
test.describe('Доставка (тарифные зоны)', () => {
  let delivery;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    delivery = new DeliveryPage(page);
    await delivery.goto();
  });

  test('страница открывается и показывает список зон доставки', async () => {
    await expect(delivery.heading).toBeVisible();
    expect(await delivery.zonesCount()).toBeGreaterThan(0);
  });

  test('у каждой зоны есть цена, цвет и 7 дней недели', async () => {
    const zones = await delivery.zonesCount();
    expect(await delivery.colorSelects.count()).toBe(zones);
    expect(await delivery.dayCheckboxes.count()).toBe(zones * 7);
  });

  test('подписи полей зон: Заголовок, Цвет, Цена, Доступные дни', async ({ page }) => {
    for (const label of ['Заголовок *', 'Цвет *', 'Цена *', 'Доступные дни доставки:']) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
    for (const day of ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']) {
      await expect(page.getByText(day, { exact: true }).first()).toBeVisible();
    }
  });

  test('заполненные зоны имеют непустую цену', async () => {
    const prices = await delivery.priceInputs.evaluateAll((els) => els.map((e) => e.value));
    const filled = prices.filter((p) => p !== '');
    expect(filled.length).toBeGreaterThan(0);
    for (const p of filled) expect(Number(p)).toBeGreaterThanOrEqual(0);
  });

  test('в цветовом селекте доступна палитра цветов', async () => {
    const options = await delivery.colorSelects.first().locator('option').allTextContents();
    for (const color of ['синий', 'красный', 'зеленый']) {
      expect(options.map((o) => o.trim())).toContain(color);
    }
  });

  test('кнопка "Сохранить" присутствует на странице', async () => {
    await expect(delivery.saveButton.first()).toBeVisible();
  });
});
