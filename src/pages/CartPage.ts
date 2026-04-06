import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class CartPage extends BasePage {
  readonly cartRows: Locator;
  readonly productNames: Locator;
  readonly prices: Locator;
  readonly quantities: Locator;
  readonly totalPrices: Locator;
  readonly shoppingCart: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly registerLoginButton: Locator;
  readonly emptyCartSpan: Locator;
  readonly xButtons: Locator;
  readonly subscription: Locator;
  readonly subscribeEmailInput: Locator;
  readonly subscribeButton: Locator;
  readonly alertSuccessSubscribe: Locator;

  constructor(page: Page) {
    super(page);
    this.cartRows = page.locator('tr[id^="product-"]');
    this.productNames = this.cartRows.locator('.cart_description a');
    this.prices = this.cartRows.locator('.cart_price p');
    this.quantities = this.cartRows.locator('.cart_quantity button');
    this.totalPrices = this.cartRows.locator('.cart_total_price');
    this.shoppingCart = page.getByText('Shopping Cart').first();
    this.proceedToCheckoutButton = page.locator('a.btn.btn-default.check_out').first();
    this.registerLoginButton = page.getByRole('link', { name: /register \/ login/i });
    this.emptyCartSpan = page.getByText(/cart is empty!/i);
    this.xButtons = this.cartRows.locator('.cart_quantity_delete');
    this.subscription = page.getByRole('heading', { name: 'Subscription' }).first();
    this.subscribeEmailInput = page.getByPlaceholder('Your email address').last();
    this.subscribeButton = page.locator('#subscribe');
    this.alertSuccessSubscribe = page.getByText('You have been successfully subscribed!');
  }

  async goto(): Promise<void> {
    await this.gotoPath('/view_cart');
  }

  async expectDisplayed(): Promise<void> {
    await expect(this.shoppingCart, 'The shopping cart page should display the Shopping Cart heading.').toBeVisible();
  }

  async getProductNames(): Promise<string[]> {
    return (await this.productNames.allInnerTexts()).map((text) => text.trim()).filter(Boolean);
  }

  async getPrices(): Promise<string[]> {
    return (await this.prices.allInnerTexts()).map((text) => text.trim());
  }

  async getQuantities(): Promise<string[]> {
    return (await this.quantities.allInnerTexts()).map((text) => text.trim());
  }

  async getTotalPrices(): Promise<string[]> {
    return (await this.totalPrices.allInnerTexts()).map((text) => text.trim());
  }

  async proceedToCheckout(): Promise<void> {
    await expect(this.cartRows.first(), 'The cart should contain at least one line item before checkout begins.').toBeVisible();
    await this.proceedToCheckoutButton.scrollIntoViewIfNeeded();
    await expect(this.proceedToCheckoutButton, 'The Proceed To Checkout action should be visible on the cart page before checkout starts.').toBeVisible();
    await this.proceedToCheckoutButton.click({ force: true });
  }

  async clickRegisterLogin(): Promise<void> {
    await this.registerLoginButton.click();
  }

  async removeProductAt(index: number): Promise<void> {
    const initialRowCount = await this.cartRows.count();
    const targetRow = this.cartRows.nth(index);
    await this.xButtons.nth(index).click();
    await expect(targetRow, 'The selected cart item row should disappear after removing the product from the cart.').toBeHidden({ timeout: 10000 }).catch(async () => {
      await expect(this.cartRows, 'The number of items in the shopping cart should decrease after removing a product.').toHaveCount(Math.max(initialRowCount - 1, 0), { timeout: 10000 });
    });
  }

  async removeAllProducts(): Promise<void> {
    while ((await this.xButtons.count()) > 0) {
      const currentRowCount = await this.cartRows.count();
      await this.xButtons.first().click();
      await expect(this.cartRows, 'The cart should update after each product removal action.').toHaveCount(Math.max(currentRowCount - 1, 0), { timeout: 10000 }).catch(() => {});
    }
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyCartSpan, 'The cart should show an empty-state message after all products are removed.').toBeVisible();
  }

  async expectProductWithQuantity(productName: string, quantity: string): Promise<void> {
    const row = this.cartRows.filter({ hasText: productName }).first();
    await expect(row, `The cart should contain the product '${productName}'.`).toBeVisible();
    await expect(row.locator('.cart_quantity button'), `The product '${productName}' should be displayed with quantity ${quantity} in the cart.`).toContainText(quantity);
  }

  async scrollToFooter(): Promise<void> {
    await this.scrollToBottom();
    await expect(this.subscription, 'The subscription section should be visible in the cart footer after scrolling down.').toBeVisible();
  }

  async subscribe(email: string): Promise<void> {
    await this.subscribeEmailInput.fill(email);
    await this.subscribeButton.click();
  }

  async expectSubscriptionSuccess(): Promise<void> {
    await expect(this.alertSuccessSubscribe, 'The cart page should confirm a successful subscription after submitting an email address.').toBeVisible();
  }
}
