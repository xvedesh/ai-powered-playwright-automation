import { expect, Page } from '@playwright/test';

import type { UserCredentials } from '@api/models/User';

export class AuthSession {
  constructor(private readonly page: Page) {}

  async establishStorageState(credentials?: UserCredentials): Promise<void> {
    if (!credentials) {
      await this.page.goto('/');
      await this.page.waitForLoadState('networkidle');
      return;
    }

    await this.page.goto('/login');
    await this.page.locator('input[data-qa="login-email"]').fill(credentials.email);
    await this.page.locator('input[data-qa="login-password"]').fill(credentials.password);
    await this.page.locator('button[data-qa="login-button"]').click();
    await expect(this.page.locator('a:has-text("Logged in as")')).toBeVisible();
  }
}
