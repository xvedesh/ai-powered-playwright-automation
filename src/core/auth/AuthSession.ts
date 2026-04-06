import { expect, Page } from '@playwright/test';

import type { UserCredentials } from '@api/models/User';

export class AuthSession {
  constructor(private readonly page: Page) {}

  async establishStorageState(credentials?: UserCredentials): Promise<void> {
    if (!credentials) {
      await this.page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(this.page.getByAltText('Website for automation practice'), 'The home page logo should be visible while establishing anonymous storage state.').toBeVisible();
      return;
    }

    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await this.page.getByPlaceholder('Email').first().fill(credentials.email);
    await this.page.getByPlaceholder('Password').fill(credentials.password);
    await this.page.getByRole('button', { name: 'Login' }).click();
    await expect(this.page.getByText(/logged in as/i), 'The signed-in banner should be visible while establishing authenticated storage state.').toBeVisible();
  }
}
