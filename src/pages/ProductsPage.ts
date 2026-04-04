import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class ProductsPage extends BasePage {
  readonly productsLink: Locator;
  readonly productsList: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productsLink = page.locator('a[href="/products"]');
    this.productsList = page.locator('.features_items');
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
  }

  async goto(): Promise<void> {
    await this.gotoPath('/products');
  }

  async openFromHeader(): Promise<void> {
    await this.productsLink.click();
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.productsList).toBeVisible();
  }

  productNameLocator(productName: string): Locator {
    return this.page.locator('.productinfo p').filter({ hasText: productName });
  }

  async searchProduct(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await this.searchButton.click();
  }

  async expectProductVisible(productName: string): Promise<void> {
    await expect(this.productNameLocator(productName).first()).toBeVisible();
  }
}
