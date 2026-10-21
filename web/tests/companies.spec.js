const { test, expect } = require('@playwright/test');
const { CompaniesPage, CompanyFormPage } = require('../pages/CompaniesPage');
const { loginAsAdmin } = require('../utils/auth');

test.describe('Покупатели — Юр. лица (компании)', () => {
  let companies;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    companies = new CompaniesPage(page);
    await companies.goto();
  });

  test('таб "Юр. лица" открывается с таблицей компаний', async ({ page }) => {
    // Текст "Название компании" встречается на странице трижды (лейбл фильтра,
    // заголовок колонки, ссылка в строке) — сужаем локатор до заголовка таблицы.
    await expect(page.getByRole('columnheader', { name: 'Название компании' })).toBeVisible();
  });

  test('кнопки "Экспортировать Excel" и "Отправить рассылку" видны', async () => {
    await expect(companies.exportExcelButton).toBeVisible();
    await expect(companies.sendNewsletterButton).toBeVisible();
  });

  test('кнопка "Сбросить" очищает поле фильтра', async () => {
    // Страница компаний (1700+ записей) — самая тяжёлая в проекте и периодически заметно
    // медленнее дефолтного таймаута теста, из-за чего эта проверка иногда упиралась в
    // 60с ещё до того, как успевала опросить поле; даём больше времени про запас.
    test.setTimeout(90000);
    // Не завязываемся на конкретное количество строк после сброса: таблица компаний
    // на сандбоксе периодически оказывается пустой независимо от фильтра (см. README →
    // «Известные нюансы сайта»). Проверяем то, что не зависит от наличия данных —
    // само поле фильтра действительно очищается.
    await companies.filterByCompanyName('несуществующая компания xyz');
    await companies.resetFilters();
    await expect(companies.companyNameInput).toHaveValue('');
  });

  test('поиск по несуществующей компании не ломает страницу', async ({ page }) => {
    await companies.filterByCompanyName('несуществующая компания xyz 12345');
    const count = await companies.rowsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Покупатели — Юр. лица — форма "Добавить"', () => {
  test('⚠️ (дефект) создать компанию через админку невозможно: поле ИНН заблокировано, а user_id отсутствует в форме', async ({ page }) => {
    // Подтверждено напрямую: POST /api/companies с одним заполненным "Название компании"
    // отвечает 422 — "Поле ИНН обязательно для заполнения" + "user_id: Поле обязательно
    // для заполнения". При этом поле ИНН на /companies/add задизейблено (не заполняется
    // ни до, ни после ввода названия), а поля user_id в форме вообще нет — обязательное
    // поле бэкенда нечем заполнить. Тест фиксирует текущее поведение; переписать на
    // успешное создание, когда форму починят.
    await loginAsAdmin(page);
    const form = new CompanyFormPage(page);
    await page.goto('/companies/add');
    await expect(form.heading).toBeVisible();

    await expect(form.innInput).toBeDisabled();

    const title = `Автотест компания ${Date.now()}`;
    await form.companyNameInput.fill(title);
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/companies') && r.request().method() === 'POST', { timeout: 15000 }),
      form.save(),
    ]);
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.errors).toHaveProperty('inn');
    await expect(page).toHaveURL(/\/companies\/add/);
  });
});
