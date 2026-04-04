import { type Locator, type Page } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class HomePage extends BasePage {
  readonly logo: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.locator('img[alt="Website for automation practice"]');
  }

  async goto(): Promise<void> {
    await this.gotoPath('/');
  }

  async waitForLoaded(): Promise<void> {
    await this.logo.waitFor({ state: 'visible' });
  }

  async expectHomeUrl(): Promise<void> {
    await this.expectPath(/automationexercise\.com/);
  }
}
