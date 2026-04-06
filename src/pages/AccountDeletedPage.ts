import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class AccountDeletedPage extends BasePage {
  readonly accountDeleted: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.accountDeleted = page.getByRole('heading', { name: 'Account Deleted!' });
    this.continueButton = page.getByRole('link', { name: 'Continue' });
  }

  async expectVisible(): Promise<void> {
    if (!(await this.accountDeleted.isVisible().catch(() => false))) {
      await this.gotoPath('/delete_account');
    }
    await expect(this.accountDeleted, 'The account deletion confirmation should be visible after deleting the user account.').toBeVisible();
  }

  async continue(): Promise<void> {
    await this.continueButton.click({ force: true });
  }
}
