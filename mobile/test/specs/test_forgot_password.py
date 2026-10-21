import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestForgotPassword:

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

    def fill_phone(self, driver, phone, timeout=20):
        """Ввод номера телефона в поле, которое уже содержит '+996 '."""
        try:
            el = WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((AppiumBy.XPATH, '//android.widget.EditText[@text="+996 "]'))
            )
        except:
            #  EditText
            el = WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((AppiumBy.XPATH, '(//android.widget.EditText)[1]'))
            )
        el.click()
        # номер
        el.send_keys(phone)
        print(f"Введен номер: +996 {phone}")

    def test_forgot_password_flow(self, driver):
        # 1. Выбрать "Пользователь"
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[@content-desc="Пользователь"]')

        # 2. Нажать "Мой профиль"
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[@content-desc="Мой профиль"]')

        # 3. Нажать "Забыли пароль?"
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Забыли пароль?")]')

        # 4. Ввести номер телефона
        self.fill_phone(driver, os.getenv("TEST_PHONE_LOCAL", ""))

        # 5. Нажать кнопку "Готово"
        try:
            self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Готово")]')
        except:
            self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[@text="Готово"]')

        
        print("Тест успешно завершён")