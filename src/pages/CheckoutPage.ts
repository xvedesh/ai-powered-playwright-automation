import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class CheckoutPage extends BasePage {
  readonly addressDelivery: Locator;
  readonly addressInvoice: Locator;
  readonly totalAmount: Locator;
  readonly comment: Locator;
  readonly placeOrderButton: Locator;
  readonly reviewYourOrderHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.addressDelivery = page.locator('#address_delivery li');
    this.addressInvoice = page.locator('#address_invoice li');
    this.totalAmount = page.locator('.check_out').getByText(/rs\./i).last();
    this.comment = page.getByRole('textbox', { name: /message/i });
    this.placeOrderButton = page.getByRole('link', { name: /place order/i });
    this.reviewYourOrderHeading = page.getByRole('heading', { name: 'Review Your Order' });
  }

  async expectAddressDetailsAndReviewOrder(): Promise<void> {
    await expect(this.addressDelivery.first(), 'The delivery address section should be visible during checkout.').toBeVisible();
    await expect(this.addressInvoice.first(), 'The billing address section should be visible during checkout.').toBeVisible();
    await expect(this.reviewYourOrderHeading, 'The review order section should be visible during checkout.').toBeVisible();
  }

  async enterCommentAndPlaceOrder(comment: string): Promise<void> {
    await this.comment.fill(comment);
    await this.placeOrderButton.click();
  }

  async getDeliveryAddressLines(): Promise<string[]> {
    return (await this.addressDelivery.allInnerTexts()).map((text) => text.trim()).filter(Boolean);
  }

  async getInvoiceAddressLines(): Promise<string[]> {
    return (await this.addressInvoice.allInnerTexts()).map((text) => text.trim()).filter(Boolean);
  }

  async expectTotalAmountVisible(): Promise<void> {
    await expect(this.totalAmount, 'The total amount should be visible in the checkout summary.').toBeVisible();
  }
}
