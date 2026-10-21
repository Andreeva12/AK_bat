const { test, expect } = require('@playwright/test');
const { SettingsPage, TABS } = require('../pages/SettingsPage');
const { loginAsAdmin } = require('../utils/auth');

// Тесты только читают настройки и переключают вкладки — ничего не сохраняют,
// чтобы не менять реальную конфигурацию сервиса (телефон поддержки, локали, пуши и т.д.).
test.describe('Настройки', () => {
  let settings;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    settings = new SettingsPage(page);
    await settings.goto();
  });

  test('страница открывается, видны все 10 вкладок настроек', async () => {
    await expect(settings.heading).toBeVisible();
    for (const [id, title] of Object.entries(TABS)) {
      await expect(settings.tab(id), `вкладка "${title}"`).toBeVisible();
      await expect(settings.tab(id)).toContainText(title);
    }
  });

  test('по умолчанию открыта вкладка "Служба поддержки"', async () => {
    await expect(settings.tab('support')).toHaveClass(/active/);
    await expect(settings.supportLabel()).toBeVisible();
  });

  test('вкладка "Служба поддержки": заполнены номер и email поддержки', async ({ page }) => {
    await expect(page.getByText('Номер службы поддержки')).toBeVisible();
    await expect(page.getByText('Email службы поддержки')).toBeVisible();
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.first()).not.toHaveValue('');
    await expect(inputs.nth(1)).toHaveValue(/@/);
  });

  for (const id of Object.keys(TABS).filter((t) => t !== 'support')) {
    test(`вкладка "${TABS[id]}" переключается и показывает содержимое`, async () => {
      await settings.openTab(id);
      await expect(settings.tab(id)).toHaveClass(/active/);
      // содержимое вкладки "Служба поддержки" скрывается
      await expect(settings.supportLabel()).toBeHidden();
      // остальные вкладки при этом неактивны
      await expect(settings.tab('support')).not.toHaveClass(/active/);
    });
  }

  test('вкладка "Способы доставки": есть поля ключа, заголовка, времени и cut-off', async ({ page }) => {
    await settings.openTab('delivery_methods');
    await expect(page.getByText('Время на доставку (в часах)').first()).toBeVisible();
    await expect(page.getByText('Время отсечения (Cut-off)').first()).toBeVisible();
    await expect(page.getByText('Системный тип (для логики дат)').first()).toBeVisible();
  });

  test('кнопка "Сохранить" присутствует на странице', async () => {
    await expect(settings.saveButton.first()).toBeVisible();
  });
});
