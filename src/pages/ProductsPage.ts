import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class ProductsPage extends BasePage {
  readonly productsSection: Locator;
  readonly productsLink: Locator;
  readonly titleTextCenter: Locator;
  readonly productsList: Locator;
  readonly productCards: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchedProductsHeading: Locator;
  readonly searchResultsNames: Locator;
  readonly viewProductOfFirstProductButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly viewCartButton: Locator;
  readonly menCategory: Locator;
  readonly tshirtsCategory: Locator;
  readonly brands: Locator;
  readonly poloBrand: Locator;
  readonly madameBrand: Locator;
  readonly addButtons: Locator;
  readonly cartModal: Locator;
  readonly modalViewCartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.productsSection = page.locator('.features_items');
    this.productsLink = page.getByRole('link', { name: /^products$/i }).first();
    this.titleTextCenter = page.getByRole('heading', { name: 'All Products' }).first();
    this.productsList = page.locator('.features_items');
    this.productCards = page.locator('.features_items .product-image-wrapper');
    this.searchInput = page.getByPlaceholder('Search Product');
    this.searchButton = page.locator('#submit_search');
    this.searchedProductsHeading = page.getByRole('heading', { name: 'Searched Products' });
    this.searchResultsNames = page.locator('.productinfo p');
    this.viewProductOfFirstProductButton = page.getByRole('link', { name: /view product/i }).first();
    this.continueShoppingButton = page.getByRole('button', { name: /continue shopping/i });
    this.viewCartButton = page.getByRole('link', { name: 'View Cart' }).last();
    this.menCategory = page.getByRole('link', { name: /men/i }).first();
    this.tshirtsCategory = page.getByRole('link', { name: 'Tshirts' }).first();
    this.brands = page.getByRole('heading', { name: 'Brands' }).locator('..');
    this.poloBrand = page.getByRole('link', { name: /\(\d+\)\s*Polo/i }).first();
    this.madameBrand = page.getByRole('link', { name: /\(\d+\)\s*Madame/i }).first();
    this.addButtons = page.getByRole('link', { name: /add to cart/i });
    this.cartModal = page.locator('.modal-content');
    this.modalViewCartLink = this.cartModal.getByRole('link', { name: 'View Cart' }).first();
  }

  async goto(): Promise<void> {
    await this.gotoPath('/products');
    await this.recoverFromVignetteIfNeeded('/products');
  }

  async openFromHeader(): Promise<void> {
    await this.productsLink.click();
    await this.recoverFromVignetteIfNeeded('/products');
  }

  async waitForLoaded(): Promise<void> {
    await this.expectPath(/\/products$/, '/products');
    await expect(this.searchInput, 'The product search input should be visible on the products page.').toBeVisible();
    await expect(this.productsList, 'The product catalog should be visible on the products page.').toBeVisible();
  }

  productNameLocator(productName: string): Locator {
    return this.page.getByText(productName, { exact: true });
  }

  async searchProduct(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await expect(this.searchButton, 'The search submit control should be visible before the shopper searches for a product.').toBeVisible();
    await this.searchButton.click({ force: true });
  }

  async expectProductVisible(productName: string): Promise<void> {
    await expect(this.productNameLocator(productName).first(), `The product '${productName}' should be visible in the current catalog results.`).toBeVisible();
  }

  async expectSearchedProductsVisible(): Promise<void> {
    await expect(this.searchedProductsHeading, 'The searched products heading should appear after the user submits a product search.').toBeVisible();
  }

  async getSearchResultNames(): Promise<string[]> {
    return (await this.searchResultsNames.allInnerTexts()).map((text) => text.trim()).filter(Boolean);
  }

  async openFirstProductDetails(): Promise<void> {
    const href = await this.viewProductOfFirstProductButton.getAttribute('href');
    if (href) {
      await this.gotoPath(href);
      await this.recoverFromVignetteIfNeeded(href);
      return;
    }

    await this.viewProductOfFirstProductButton.scrollIntoViewIfNeeded();
    await this.viewProductOfFirstProductButton.click();
  }

  async addFirstTwoProductsToCart(): Promise<void> {
    const firstCard = this.productCards.nth(0);
    const secondCard = this.productCards.nth(1);

    await this.addCardToCart(firstCard);
    await this.clickContinueShopping();
    await this.addCardToCart(secondCard);
  }

  async clickContinueShopping(): Promise<void> {
    if (!(await this.cartModal.isVisible().catch(() => false))) {
      return;
    }
    await this.continueShoppingButton.click({ force: true });
    await expect(this.cartModal, 'The add-to-cart confirmation modal should close after continuing shopping.').toBeHidden({ timeout: 10000 });
  }

  async viewCart(): Promise<void> {
    if (await this.modalViewCartLink.isVisible().catch(() => false)) {
      await this.modalViewCartLink.click({ force: true });
      return;
    }

    if (await this.viewCartButton.isVisible().catch(() => false)) {
      await this.viewCartButton.click({ force: true });
      return;
    }
    await this.gotoPath('/view_cart');
  }

  async expectAtLeastProductsVisible(minimum: number): Promise<void> {
    await expect(this.productCards, `The products page should display at least ${minimum} product cards before cart actions run.`).toHaveCount(minimum, {
      timeout: 10000,
    }).catch(async () => {
      const actualCount = await this.productCards.count();
      expect(actualCount, `The products page should display at least ${minimum} product cards before cart actions run.`).toBeGreaterThanOrEqual(minimum);
    });
  }

  async openMenTshirtsCategory(): Promise<void> {
    await this.menCategory.click();
    await this.tshirtsCategory.click();
  }

  async expectBrandsVisible(): Promise<void> {
    await expect(this.brands, 'The brands filter should be visible on the products page.').toBeVisible();
  }

  async openPoloBrand(): Promise<void> {
    await this.gotoPath('/brand_products/Polo');
    await this.recoverFromVignetteIfNeeded('/brand_products/Polo');
  }

  async openMadameBrand(): Promise<void> {
    await this.gotoPath('/brand_products/Madame');
    await this.recoverFromVignetteIfNeeded('/brand_products/Madame');
  }

  async addAllVisibleSearchResultsToCart(limit = 3): Promise<string[]> {
    const productNames: string[] = [];
    const count = Math.min(await this.productCards.count(), limit);

    for (let index = 0; index < count; index += 1) {
      const card = this.productCards.nth(index);
      const productName = (await card.locator('.productinfo p').first().innerText()).trim();
      await this.addCardToCart(card);
      if (index < count - 1) {
        await this.clickContinueShopping();
      }
      productNames.push(productName);
    }

    return productNames;
  }

  private async addCardToCart(card: Locator): Promise<void> {
    const overlayAddButton = card.locator('.product-overlay a.add-to-cart, .product-overlay a.btn.btn-default.add-to-cart').first();
    const inlineAddButton = card.locator('.productinfo a.add-to-cart, a.btn.btn-default.add-to-cart').first();

    await card.scrollIntoViewIfNeeded();
    await expect(card, 'A product card should be visible before the shopper adds it to the cart.').toBeVisible();

    if (await overlayAddButton.isVisible().catch(() => false)) {
      await overlayAddButton.click({ force: true });
      return;
    }

    await inlineAddButton.click({ force: true });
  }
}
