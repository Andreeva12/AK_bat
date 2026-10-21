// Страница "Настройки" (/settings) — одна форма с вкладками Bootstrap (data-bs-target="#<id>").
const TABS = {
  support: 'Служба поддержки',
  locale: 'Языки (Локали)',
  push_templates: 'Настройки пушей',
  delivery_methods: 'Способы доставки',
  payment_methods: 'Способы оплаты',
  order_statuses: 'Статусы',
  megapay_banks: 'Банки',
  loyalty: 'Программа лояльности',
  legal_docs: 'Правовые документы',
  additional: 'Дополнительно',
};

class SettingsPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Редактировать настройки' });
    this.tabs = TABS;
    this.saveButton = page.getByRole('button', { name: 'Сохранить', exact: true });
  }

  async goto() {
    await this.page.goto('/settings');
    await this.heading.waitFor({ timeout: 30000 });
  }

  tab(id) {
    return this.page.locator(`button[data-bs-target="#${id}"]`);
  }

  // У вкладок нет tab-pane с id: содержимое каждой — безымянный <div> без стабильных
  // атрибутов, скрываемый через display:none. Поэтому переключение проверяем по
  // активному классу кнопки и по видимости характерной подписи поля.
  supportLabel() {
    return this.page.getByText('Номер службы поддержки');
  }

  async openTab(id) {
    await this.tab(id).click();
    await this.page.waitForFunction(
      (target) => document.querySelector(`button[data-bs-target="#${target}"]`)?.classList.contains('active'),
      id,
    );
  }
}

module.exports = { SettingsPage, TABS };
