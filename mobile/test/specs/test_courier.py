import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestCourier:

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

    def test_courier_sees_order(self, driver):
        """
        Тест проверяет, что курьер видит созданный заказ в списке ожидающих.
        Предполагается, что курьер уже авторизован и находится на главном экране.
        """
        # 1. Кликнуть на вкладку "В ожидании"
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[@content-desc="В ожидании\nВ ожидании"]')

        # 2. Дождаться появления заказа с конкретным адресом и количеством
        # Ожидаемый content-desc содержит адрес "улица Бубусары Бейшеналиевой, д. 20" и "5x"
        order_element = self.wait_for_element(
            driver,
            AppiumBy.XPATH,
            '//android.widget.ImageView[contains(@content-desc, "улица Бубусары Бейшеналиевой, д. 20") and contains(@content-desc, "5x")]',
            timeout=30
        )
        assert order_element is not None, "Заказ не найден в списке ожидающих"
        print("Заказ успешно найден в списке ожидающих")