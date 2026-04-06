import { expect, type Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  protected async gotoPath(pathname: string): Promise<void> {
    await this.page.goto(pathname, { waitUntil: 'domcontentloaded' });
  }

  protected isGoogleVignetteUrl(url: string): boolean {
    return url.includes('google_vignette');
  }

  protected async recoverFromVignetteIfNeeded(recoveryPath: string): Promise<boolean> {
    const currentUrl = this.page.url();
    const currentPath = new URL(currentUrl).pathname;
    const appearsInterstitial = this.isGoogleVignetteUrl(currentUrl) || currentPath === '/';

    if (!appearsInterstitial) {
      return false;
    }

    await this.gotoPath(recoveryPath);
    return true;
  }

  protected async expectPath(pathPattern: RegExp, recoveryPath?: string): Promise<void> {
    try {
      await expect
        .poll(
          () => new URL(this.page.url()).pathname,
          { message: `Expected the browser to reach a URL matching ${pathPattern}.`, timeout: 8000 }
        )
        .toMatch(pathPattern);
    } catch (error) {
      if (!recoveryPath || !(await this.recoverFromVignetteIfNeeded(recoveryPath))) {
        throw error;
      }

      await expect
        .poll(
          () => new URL(this.page.url()).pathname,
          { message: `Expected the browser to recover to a URL matching ${pathPattern}.`, timeout: 10000 }
        )
        .toMatch(pathPattern);
    }
  }

  protected async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  protected async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }
}
