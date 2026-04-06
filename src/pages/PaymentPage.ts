import { expect, type Locator, type Download, type Page } from '@playwright/test';

import type { PaymentDetails } from '@models/PaymentDetails';
import { BasePage } from '@pages/BasePage';

export class PaymentPage extends BasePage {
  readonly nameOnCardInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expirationMonthInput: Locator;
  readonly expirationYearInput: Locator;
  readonly payAndConfirmOrderButton: Locator;
  readonly successMessage: Locator;
  readonly downloadInvoiceButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameOnCardInput = page.getByPlaceholder('Name on Card');
    this.cardNumberInput = page.getByPlaceholder('Card Number');
    this.cvcInput = page.getByPlaceholder('ex. 311');
    this.expirationMonthInput = page.getByPlaceholder('MM');
    this.expirationYearInput = page.getByPlaceholder('YYYY');
    this.payAndConfirmOrderButton = page.getByRole('button', { name: /pay and confirm order/i });
    this.successMessage = page.getByText('Congratulations! Your order has been confirmed!');
    this.downloadInvoiceButton = page.getByRole('link', { name: /download invoice/i });
    this.continueButton = page.getByRole('link', { name: 'Continue' });
  }

  async payAndConfirm(details: PaymentDetails): Promise<void> {
    await this.nameOnCardInput.fill(details.nameOnCard);
    await this.cardNumberInput.fill(details.cardNumber);
    await this.cvcInput.fill(details.cvc);
    await this.expirationMonthInput.fill(details.expiryMonth);
    await this.expirationYearInput.fill(details.expiryYear);
    await this.payAndConfirmOrderButton.click();
  }

  async expectOrderSuccess(): Promise<void> {
    await expect(this.successMessage, 'The order confirmation message should be visible after submitting valid payment details.').toBeVisible();
  }

  async downloadInvoice(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadInvoiceButton.click();
    return downloadPromise;
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }
}
