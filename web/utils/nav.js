// utils/nav.js
// Сайдбар в свёрнутом (иконочном) состоянии прячет текстовые подписи пунктов меню
// (display:none), пока курсор не наведён на сайдбар — раскрытие завершается анимацией.
// Поэтому прежде чем кликать по пункту подменю "Магазин", нужно сначала навести
// курсор на его родительскую ссылку и подождать анимацию раскрытия.
async function openShopSubmenu(page) {
  const shopToggle = page.locator('a:has-text("Магазин")').first();
  await shopToggle.hover();
  await page.waitForTimeout(400);
  await shopToggle.click({ force: true });
  await page.waitForTimeout(400);
}

module.exports = { openShopSubmenu };
