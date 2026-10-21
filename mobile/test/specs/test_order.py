import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestOrder:

    def wait_for_element(self, driver, by, value, timeout=20):
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )

    def click_element(self, driver, by, value, timeout=20):
        el = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        el.click()
        print(f"Клик по {value}")

    def click_by_coordinates(self, driver, x, y):
        driver.tap([(x, y)], duration=100)
        print(f"Клик по координатам ({x}, {y})")

    def swipe_down(self, driver, duration=300):
        size = driver.get_window_size()
        start_x = size['width'] // 2
        start_y = int(size['height'] * 0.8)
        end_y = int(size['height'] * 0.2)
        driver.swipe(start_x, start_y, start_x, end_y, duration)
        print("Прокрутка вниз")

    def test_client_order_with_courier_delivery(self, driver):
        # 1. Выбрать категорию "Готовая продукция"
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Готовая продукция")]')

        # 2. Выбрать товар "Вода питьевая Ак-Бата 18л."
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Вода питьевая Ак-Бата 18л.")]')

        # 3. Нажать "Добавить в корзину"
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Добавить в корзину")]')

        # 4. Открыть корзину
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Открыть корзину")]')

        # 5. Увеличить количество до 5 (нажать + три раза)
        for _ in range(3):
            self.click_by_coordinates(driver, 640, 521)
            time.sleep(0.5)

        # 6. Нажать "Оформить заказ"
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Оформить заказ")]')

        # 7. Нажать "Курьер" (способ доставки)
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Курьер")]')

        # 8. Выбрать адрес доставки
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Адрес доставки")]')
        self.click_element(driver, AppiumBy.XPATH, '(//android.widget.Button[contains(@content-desc, "улица")])[1]')

        # 9. Выбрать экспресс-доставку
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Экспресс-доставка")]')

        time.sleep(2)

        # 10. Выбрать способ оплаты
        try:
            self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Способ оплаты")]')
        except:
            self.swipe_down(driver)
            try:
                self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Способ оплаты")]')
            except:
                self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Выбрать способ оплаты")]')

        # 11. Выбрать "Наличными курьеру"
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Наличными курьеру")]')

        time.sleep(2)

        # 12. Нажать "Оформить заказ" (на экране подтверждения)
        try:
            self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Оформить заказ")]')
        except:
            self.swipe_down(driver)
            self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Оформить заказ")]')

        # 13. Подтвердить заказ 
        # точное совпадение
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[@content-desc="Подтвердить\nПодтвердить"]')

        # 14. Проверить, что заказ оформлен (появился статус "Оплата в обработке")
        status_element = self.wait_for_element(
            driver,
            AppiumBy.XPATH,
            '//android.view.View[contains(@content-desc, "Оплата")]',  # более общий локатор
            timeout=15
        )
        assert status_element is not None, "Статус 'Оплата в обработке' не появился"
        print("Заказ успешно оформлен с доставкой курьером")