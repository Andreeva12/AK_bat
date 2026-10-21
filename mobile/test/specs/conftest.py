# conftest.py
import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.appium_service import AppiumService

@pytest.fixture(scope="session")
def appium_service():
    """Запуск Appium сервера (если не запущен отдельно)."""
    service = AppiumService()
    service.start()
    yield service
    service.stop()

@pytest.fixture(scope="function")
def driver(appium_service):
    """Создание и завершение сессии драйвера."""
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.platform_version = "16"          # Укажите вашу версию Android (из эмулятора)
    options.device_name = "emulator-5554"    # Узнайте через adb devices
    options.app_package = "com.shvaiberovsa.akbata"
    options.app_activity = ".MainActivity"
    options.automation_name = "UiAutomator2"
    options.new_command_timeout = 3600
    options.connect_hardware_keyboard = True
    options.no_reset = True

    driver = webdriver.Remote("http://localhost:4723", options=options)
    yield driver
    driver.quit()