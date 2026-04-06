import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class TestCasesPage extends BasePage {
  readonly testCases: Locator;
  readonly pageContent: Locator;

  constructor(page: Page) {
    super(page);
    this.testCases = page.getByText(/test cases/i).first();
    this.pageContent = page.locator('body');
  }

  async expectLoaded(): Promise<void> {
    await this.expectPath(/\/test_cases$/, '/test_cases');
    await expect(this.pageContent, 'The Test Cases page should contain the Test Cases content after navigation.').toContainText(/test cases/i);
  }
}
