import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class HomePage extends BasePage {
  readonly header: Locator;
  readonly logo: Locator;
  readonly signupLoginButton: Locator;
  readonly contactUsButton: Locator;
  readonly testCasesButton: Locator;
  readonly productsButton: Locator;
  readonly cartButton: Locator;
  readonly viewProduct1Button: Locator;
  readonly categories: Locator;
  readonly womenCategory: Locator;
  readonly menCategory: Locator;
  readonly dressCategory: Locator;
  readonly tshirtsCategory: Locator;
  readonly recommendedItems: Locator;
  readonly recommendedCarousel: Locator;
  readonly recommendedProductCards: Locator;
  readonly blueTopAddToCartButton: Locator;
  readonly viewCartButton: Locator;
  readonly scrollUpButton: Locator;
  readonly mainHeading: Locator;
  readonly subscription: Locator;
  readonly subscribeEmailInput: Locator;
  readonly subscribeButton: Locator;
  readonly alertSuccessSubscribe: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('#header');
    this.logo = page.getByAltText('Website for automation practice');
    this.signupLoginButton = this.header.getByRole('link', { name: /signup \/ login/i }).first();
    this.contactUsButton = this.header.getByRole('link', { name: /contact us/i }).first();
    this.testCasesButton = this.header.getByRole('link', { name: /test cases/i }).first();
    this.productsButton = this.header.getByRole('link', { name: /^products$/i }).first();
    this.cartButton = this.header.getByRole('link', { name: /^cart$/i }).first();
    this.viewProduct1Button = page.getByRole('link', { name: /view product/i }).first();
    this.categories = page.locator('#accordian');
    this.womenCategory = page.getByRole('link', { name: /women/i }).first();
    this.menCategory = page.getByRole('link', { name: /men/i }).first();
    this.dressCategory = page.getByRole('link', { name: 'Dress' }).first();
    this.tshirtsCategory = page.getByRole('link', { name: 'Tshirts' }).first();
    this.recommendedItems = page.getByRole('heading', { name: /recommended items/i }).first();
    this.recommendedCarousel = page.locator(`#recommended-item-carousel`).first();
    this.recommendedProductCards = this.recommendedCarousel.locator('.item.active .product-image-wrapper, .item.active .col-sm-4');
    this.blueTopAddToCartButton = this.recommendedCarousel.getByRole('link', { name: /add to cart/i }).first();
    this.viewCartButton = page.getByRole('link', { name: 'View Cart' }).last();
    this.scrollUpButton = page.locator('#scrollUp');
    this.mainHeading = page.getByRole('heading', { name: 'Full-Fledged practice website for Automation Engineers' }).first();
    this.subscription = page.getByRole('heading', { name: 'Subscription' }).first();
    this.subscribeEmailInput = page.getByPlaceholder('Your email address').last();
    this.subscribeButton = page.locator('#subscribe');
    this.alertSuccessSubscribe = page.getByText('You have been successfully subscribed!');
  }

  async goto(): Promise<void> {
    await this.gotoPath('/');
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.logo, 'The home page logo should be visible after the application loads.').toBeVisible();
  }

  async expectHomeUrl(): Promise<void> {
    await this.expectPath(/^\/$/, '/');
  }

  async openSignupLogin(): Promise<void> {
    await this.gotoPath('/login');
  }

  async openContactUs(): Promise<void> {
    await this.gotoPath('/contact_us');
  }

  async openTestCases(): Promise<void> {
    await this.gotoPath('/test_cases');
  }

  async openProducts(): Promise<void> {
    await this.productsButton.click();
    await this.recoverFromVignetteIfNeeded('/products');
  }

  async openCart(): Promise<void> {
    await this.gotoPath('/view_cart');
  }

  async openFirstProductDetails(): Promise<void> {
    const href = await this.viewProduct1Button.getAttribute('href');
    if (href) {
      await this.gotoPath(href);
      await this.recoverFromVignetteIfNeeded(href);
      return;
    }

    await this.viewProduct1Button.click();
  }

  async expectCategoriesVisible(): Promise<void> {
    await expect(this.categories, 'The category accordion should be visible on the home page.').toBeVisible();
  }

  async openWomenDressCategory(): Promise<void> {
    await this.gotoPath('/category_products/1');
  }

  async openMenTshirtsCategory(): Promise<void> {
    await this.gotoPath('/category_products/3');
  }

  async scrollToFooter(): Promise<void> {
    await this.scrollToBottom();
    await expect(this.subscription, 'The footer subscription section should be visible after scrolling to the bottom of the page.').toBeVisible();
  }

  async subscribe(email: string): Promise<void> {
    await this.subscribeEmailInput.fill(email);
    await this.subscribeButton.click();
  }

  async expectSubscriptionSuccess(): Promise<void> {
    await expect(this.alertSuccessSubscribe, 'The subscription confirmation message should be visible after subscribing from the footer.').toBeVisible();
  }

  async expectRecommendedItemsVisible(): Promise<void> {
    await expect(this.recommendedItems, 'The recommended items section should be visible near the footer.').toBeVisible();
  }

  async addRecommendedProductToCart(): Promise<void> {
    await this.recommendedItems.scrollIntoViewIfNeeded();
    await this.recommendedCarousel.scrollIntoViewIfNeeded();
    const activeAddButton = this.recommendedCarousel.locator(`.item.active a.btn.btn-default.add-to-cart`).first();
    if (await activeAddButton.isVisible().catch(() => false)) {
      await activeAddButton.click({ force: true });
      return;
    }
    await this.blueTopAddToCartButton.click({ force: true });
  }

  async viewCartFromModal(): Promise<void> {
    if (await this.viewCartButton.isVisible().catch(() => false)) {
      await this.viewCartButton.click({ force: true });
      return;
    }
    await this.gotoPath('/view_cart');
  }

  async clickScrollUp(): Promise<void> {
    await this.scrollUpButton.click();
  }

  async scrollPageToTop(): Promise<void> {
    await this.scrollToTop();
  }

  async expectMainHeadingVisible(): Promise<void> {
    await expect(this.mainHeading, 'The hero heading should be visible after returning to the top of the home page.').toBeVisible();
  }
}
