import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class AccountCreatedPage extends BasePage {
  readonly accountCreated: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.accountCreated = page.getByRole('heading', { name: 'Account Created!' });
    this.continueButton = page.getByRole('link', { name: 'Continue' });
  }

  async expectVisible(): Promise<void> {
    await expect(this.accountCreated, 'The account created confirmation should be visible after completing registration.').toBeVisible();
  }

  async continue(): Promise<void> {
    await this.continueButton.click({ force: true });
    if (await this.accountCreated.isVisible().catch(() => false)) {
      await this.gotoPath('/');
    }
  }
}
