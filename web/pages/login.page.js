export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[name="login"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('.btn.btn-primary.w-100');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL('/', { timeout: 30000 });
    await this.page.waitForLoadState('networkidle');
  }
}