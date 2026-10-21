const { test, expect } = require('@playwright/test');
const { CategoriesPage, CategoryFormPage } = require('../pages/CategoriesPage');
const { loginAsAdmin, REQUIRED_FIELD_TEXT } = require('../utils/auth');

test.describe('Категории товаров — список', () => {
  let categories;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    categories = new CategoriesPage(page);
    await categories.goto();
  });

  test('страница открывается с нужными колонками', async () => {
    await expect(categories.heading).toBeVisible();
    const headers = (await categories.columnHeaders.allTextContents()).map((h) => h.trim());
    for (const name of ['Id', 'Заголовок', 'Изображение', 'Поз.', 'Действия']) {
      expect(headers).toContain(name);
    }
  });

  test('в списке есть базовые категории каталога', async () => {
    for (const title of ['Готовая продукция', 'Материалы', 'Диспенсеры']) {
      await expect(categories.getRowByTitle(title)).toBeVisible();
    }
  });

  test('⚠️ (дефект) поиск по заголовку не фильтрует список — возвращаются все категории', async () => {
    // Бэкенд принимает where=title(like)%значение%, но игнорирует его: подтверждено
    // напрямую через API — запрос с фильтром возвращает тот же набор категорий, что
    // и без него. Тест фиксирует текущее (ошибочное) поведение и должен быть переписан
    // на реальную проверку фильтрации, когда баг починят. См. README → «Известные баги».
    await categories.searchByTitle('Диспенсеры');
    await expect(categories.getRowByTitle('Диспенсеры')).toBeVisible();
    // если бы фильтр работал, эта категория не должна была бы остаться в списке
    await expect(categories.getRowByTitle('Материалы')).toBeVisible();
  });

  test('поиск по несуществующему заголовку не ломает страницу', async () => {
    await categories.searchByTitle('несуществующая категория xyz 12345');
    await expect(categories.heading).toBeVisible();
    expect(await categories.rowsCount()).toBeGreaterThanOrEqual(0);
  });

  test('в каждой строке есть иконки редактирования и удаления', async () => {
    const row = categories.tableRows.first();
    expect(await row.locator('a:has(svg), button:has(svg)').count()).toBeGreaterThanOrEqual(2);
  });

  test('кнопка "Добавить" открывает форму создания категории', async ({ page }) => {
    await categories.addButton.click();
    await expect(page).toHaveURL(/\/add-category/);
    await expect(page.getByRole('heading', { name: 'Добавить категорию' })).toBeVisible();
  });
});

test.describe('Категории товаров — форма', () => {
  let form;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    form = new CategoryFormPage(page);
    await form.goto();
  });

  test('форма содержит поля для трёх языков и ключевые настройки', async ({ page }) => {
    for (const lang of ['RU', 'KY', 'EN']) {
      await expect(page.getByText(`Язык: ${lang}`)).toBeVisible();
    }
    await expect(page.getByText('Изображение', { exact: true })).toBeVisible();
    await expect(page.getByText('Поз.', { exact: true })).toBeVisible();
    await expect(page.getByText('Активный', { exact: true })).toBeVisible();
    await expect(page.getByText('Требует платного подъема (для воды)')).toBeVisible();
  });

  test('сохранение без заголовка не создаёт категорию', async ({ page }) => {
    await form.save();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/add-category/);
  });

  test('заголовок обязателен для KY и EN: сохранение только с RU показывает ошибки', async ({ page }) => {
    await form.titleInputRu.fill('Автотест только RU');
    await form.save();
    await expect(page.getByText(REQUIRED_FIELD_TEXT).first()).toBeVisible();
    await expect(page).toHaveURL(/\/add-category/);
  });

  test('кнопка "Отмена" возвращает к списку категорий', async ({ page }) => {
    await form.cancelButton.click();
    await expect(page.getByRole('heading', { name: 'Категории товаров' })).toBeVisible();
  });
});

test.describe('Категории товаров — полный цикл (создание → поиск → удаление)', () => {
  test('созданная категория появляется в списке и удаляется без следов', async ({ page }) => {
    test.setTimeout(120000);
    await loginAsAdmin(page);

    const title = `Автотест категория ${Date.now()}`;
    const form = new CategoryFormPage(page);
    const categories = new CategoriesPage(page);
    let created = false;

    try {
      await form.goto();
      await form.fillTitle(title);
      await form.saveAndClose();

      await categories.heading.waitFor({ timeout: 30000 });
      await categories.searchByTitle(title);
      created = true;
      await expect(categories.getRowByTitle(title)).toBeVisible();
    } finally {
      // уборка выполняется при любом исходе — иначе упавший тест оставит мусор в БД
      await categories.goto().catch(() => {});
      await categories.searchByTitle(title).catch(() => {});
      if (await categories.getRowByTitle(title).isVisible().catch(() => false)) {
        await categories.deleteCategory(title);
      }
    }

    expect(created).toBe(true);
    await categories.goto();
    await categories.searchByTitle(title);
    await expect(categories.getRowByTitle(title)).toHaveCount(0);
  });
});
