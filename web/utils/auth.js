// utils/auth.js
const fs = require('fs');
const path = require('path');
const { LoginPage } = require('../pages/login.page');

// Сайт периодически "душит" логины (таймауты /api/login при частых входах), а почти
// каждый тест начинался с входа через UI. Поэтому после первого успешного входа
// сохраняем состояние сессии (в localStorage лежат `token` и `user`) и
// переиспользуем его в следующих тестах. Специально проверяющие сам логин тесты
// (login.spec.js) используют LoginPage напрямую и это не затрагивает.
//
// Новый вход тем же аккаунтом отзывает старые токены, поэтому сохранённый токен
// сначала проверяется запросом к API — и только валидный подкладывается в браузер.
const STATE_FILE = path.join(__dirname, '..', '.auth', 'admin.json');
const API_URL = 'https://ak-bata.i7.kg/api';
const MAX_AGE_MS = 20 * 60 * 1000;

function readFreshState() {
  try {
    const stat = fs.statSync(STATE_FILE);
    if (Date.now() - stat.mtimeMs > MAX_AGE_MS) return null;
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    const items = (state.origins || []).flatMap((o) => o.localStorage || []);
    if (!items.some((i) => i.name === 'token')) return null;
    return items;
  } catch {
    return null;
  }
}

async function isTokenValid(page, items) {
  const token = items.find((i) => i.name === 'token').value;
  try {
    const res = await page.request.get(`${API_URL}/categories?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      timeout: 20000,
    });
    // Недействительным считаем токен только при явном 401: сетевой таймаут API не повод
    // уходить на медленный вход через UI (он лишь умножает нагрузку на нестабильный сайт).
    return res.status() !== 401;
  } catch {
    return true;
  }
}

async function restoreSession(page, items) {
  await page.addInitScript((stored) => {
    for (const { name, value } of stored) window.localStorage.setItem(name, value);
  }, items);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  return !page.url().includes('/login');
}

// Сайт иногда отвечает ERR_CONNECTION_TIMED_OUT на отдельные запросы — коротко
// повторяем вход вместо того, чтобы валить тест на сетевом сбое.
async function withRetries(fn, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

async function loginAsAdmin(page) {
  const saved = readFreshState();
  if (saved && (await isTokenValid(page, saved)) && (await restoreSession(page, saved).catch(() => false))) {
    return;
  }

  await withRetries(async () => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
  });

  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  await page.context().storageState({ path: STATE_FILE });
}

// Текст валидации зависит от того, как получен язык интерфейса: после входа через UI
// приложение показывает русский, а при восстановленной сессии — английский
// ("The field is required."), поэтому проверки сообщений не привязаны к языку.
const REQUIRED_FIELD_TEXT = /Поле обязательно для заполнения|The field is required/;

module.exports = { loginAsAdmin, REQUIRED_FIELD_TEXT };
