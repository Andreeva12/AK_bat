import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestAuth:

    def wait_for_element(self, driver, by, value, timeout=20):
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )

    def click_element(self, driver, by, value, timeout=20):
        el = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        el.click()

    # ввод по hint 
    def fill_input_by_hint(self, driver, hint_text, text, timeout=20):
        el = self.wait_for_element(
            driver,
            AppiumBy.XPATH,
            f'//android.widget.EditText[@hint="{hint_text}"]',
            timeout
        )
        el.click()
        el.clear()
        el.send_keys(text)
        print(f"Введено в поле '{hint_text}': {text}")

    # чекбокс
    def click_checkbox(self, driver, timeout=20):
        # Скрываем клавиатуру
        try:
            driver.hide_keyboard()
        except:
            pass
        time.sleep(0.5)

        try:
            checkbox = WebDriverWait(driver, timeout).until(
                EC.element_to_be_clickable((AppiumBy.XPATH, "(//android.widget.CheckBox)[1]"))
            )
            checkbox.click()
            print("Чекбокс нажат")
            return
        except Exception as e:
            print(f"Не удалось найти чекбокс по XPath: {e}")
            # все чекбоксы и кликнуть первый
            try:
                checkboxes = WebDriverWait(driver, timeout).until(
                    EC.presence_of_all_elements_located((AppiumBy.CLASS_NAME, "android.widget.CheckBox"))
                )
                if checkboxes:
                    WebDriverWait(driver, timeout).until(EC.element_to_be_clickable(checkboxes[0]))
                    checkboxes[0].click()
                    print("Чекбокс нажат через список")
                    return
                else:
                    raise Exception("Чекбоксы не найдены")
            except Exception as e2:
                print(f"Не удалось найти чекбокс по классу: {e2}")
                driver.save_screenshot("checkbox_error.png")
                raise

    def test_successful_login(self, driver):
        self.click_element(driver, AppiumBy.ACCESSIBILITY_ID, "Пользователь")
        self.click_element(driver, AppiumBy.ACCESSIBILITY_ID, "Мой профиль")
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Физ. лицо")]')

        # Ввод по hint
        self.fill_input_by_hint(driver, "Номер телефона +996", os.getenv("TEST_PHONE_LOCAL", ""))
        self.fill_input_by_hint(driver, "Пароль", os.getenv("TEST_PASSWORD", ""))

        # Пауза, чтобы чекбокс стал доступен
        time.sleep(1)

        # Нажать чекбокс 
        self.click_checkbox(driver)

        # Скрыть клавиатуру  
        try:
            driver.hide_keyboard()
        except:
            pass
        time.sleep(1)

        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Вход")]')

        driver.save_screenshot("after_login.png")
        print("Скриншот сохранён как after_login.png")

        bonus = self.wait_for_element(
            driver,
            AppiumBy.XPATH,
            '//android.widget.Button[contains(@content-desc, "Мои бонусы")]',
            timeout=20
        )
        assert bonus is not None, "Не удалось войти: элемент 'Мои бонусы' не найден"

    def test_incorrect_password(self, driver):
        self.click_element(driver, AppiumBy.ACCESSIBILITY_ID, "Пользователь")
        self.click_element(driver, AppiumBy.ACCESSIBILITY_ID, "Мой профиль")
        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Физ. лицо")]')

        self.fill_input_by_hint(driver, "Номер телефона +996", os.getenv("TEST_PHONE_LOCAL", ""))
        self.fill_input_by_hint(driver, "Пароль", "wrongpassword")

        time.sleep(1)
        self.click_checkbox(driver)

        try:
            driver.hide_keyboard()
        except:
            pass
        time.sleep(1)

        self.click_element(driver, AppiumBy.XPATH, '//android.widget.Button[contains(@content-desc, "Вход")]')

        error_msg = self.wait_for_element(
            driver,
            AppiumBy.XPATH,
            '//android.view.View[@content-desc="Неверный логин или пароль."]',
            timeout=5
        )
        assert error_msg is not None, "Сообщение об ошибке не появилось"