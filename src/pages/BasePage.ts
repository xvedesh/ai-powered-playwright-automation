import { expect, type Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  protected async gotoPath(pathname: string): Promise<void> {
    await this.page.goto(pathname);
  }

  protected async expectPath(pathPattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pathPattern);
  }
}
