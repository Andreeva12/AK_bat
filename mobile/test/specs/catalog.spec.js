const { expect } = require('chai');
const HomePage = require('../../pages/HomePage');
const CatalogPage = require('../../pages/CatalogPage');
const ProductDetailPage = require('../../pages/ProductDetailPage');
const CartPage = require('../../pages/CartPage');
const { ensureOnHomeScreen } = require('../../utils/appLaunch');

const KNOWN_CATEGORY = 'Готовая продукция';
const KNOWN_PRODUCT = 'Вода питьевая Ак-Бата 18л.';

describe('Каталог (гостевой доступ, без логина)', () => {
  before(async () => {
    await ensureOnHomeScreen();
  });

  it('главный экран показывает поиск, бонусы, акции и категории', async () => {
    expect(await HomePage.searchInput.isExisting(), 'поле поиска').to.be.true;
    expect(await HomePage.bonusesRow.isExisting(), 'блок "Мои бонусы"').to.be.true;
    expect(await HomePage.promoSectionHeading.isExisting(), 'заголовок "Акционные товары!"').to.be.true;
    expect(await HomePage.categoriesHeading.isExisting(), 'заголовок "Категории"').to.be.true;
  });

  it('переход в категорию "Готовая продукция" показывает список товаров', async () => {
    await CatalogPage.openCategory(KNOWN_CATEGORY);
    const count = await CatalogPage.favoriteButtonsOnScreen.length;
    expect(count, 'в категории должен быть хотя бы один товар').to.be.greaterThan(0);
  });

  it('открытие карточки товара показывает цену и описание', async () => {
    await CatalogPage.openProduct(KNOWN_PRODUCT);
    expect(await ProductDetailPage.isDisplayed(), 'ожидалась карточка товара').to.be.true;
    expect(await ProductDetailPage.retailPriceLabel.isExisting(), 'метка "Розничная цена"').to.be.true;
  });

  it('добавление товара в корзину показывает панель "Открыть корзину" с суммой', async () => {
    await ProductDetailPage.addToCart();
    await driver.waitUntil(async () => ProductDetailPage.openCartBar.isExisting(), {
      timeout: 10000,
      timeoutMsg: 'после добавления в корзину не появилась панель "Открыть корзину"',
    });
  });

  it('переход в корзину показывает добавленный товар и кнопку "Оформить заказ"', async () => {
    await ProductDetailPage.openCart();
    expect(await CartPage.isDisplayed(), 'ожидался экран корзины').to.be.true;
    expect(await CartPage.cartItemRow(KNOWN_PRODUCT).isExisting(), 'товар должен быть виден в корзине').to.be.true;
    expect(await CartPage.checkoutButton.isExisting(), 'кнопка "Оформить заказ"').to.be.true;
  });
});
