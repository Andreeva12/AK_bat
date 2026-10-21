// Страница "Доставка" (/delivery) — набор карточек тарифных зон доставки:
// заголовок, цвет, цена и доступные дни недели.
class DeliveryPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Доставка' });
    this.titleInputs = page.locator('input[type="text"]');
    this.priceInputs = page.locator('input[type="number"]');
    this.colorSelects = page.locator('select');
    this.dayCheckboxes = page.locator('input[type="checkbox"]');
    this.saveButton = page.getByRole('button', { name: 'Сохранить', exact: true });
  }

  async goto() {
    await this.page.goto('/delivery');
    await this.heading.waitFor({ timeout: 30000 });
    await this.titleInputs.first().waitFor({ timeout: 30000 });
  }

  async zonesCount() {
    return this.priceInputs.count();
  }
}

module.exports = { DeliveryPage };
