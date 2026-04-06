import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class LoggedHomePage extends BasePage {
  readonly loggedInBanner: Locator;
  readonly username: Locator;
  readonly deleteAccountButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    const header = page.locator('#header');
    this.loggedInBanner = header.getByText(/Logged in as/i).first();
    this.username = header.locator('b').first();
    this.deleteAccountButton = header.locator(`a[href='/delete_account']`).first();
    this.logoutButton = header.locator(`a[href='/logout']`).first();
  }

  async expectLoggedInAs(name: string): Promise<void> {
    await expect(this.loggedInBanner, 'The application should show the logged-in banner after a successful sign in.').toBeVisible({ timeout: 15000 });
    await expect(this.loggedInBanner, `The logged-in banner should include the user name '${name}'.`).toContainText(name);
  }

  async deleteAccount(): Promise<void> {
    await this.gotoPath('/delete_account');
  }

  async logout(): Promise<void> {
    await this.gotoPath('/logout');
  }
}
