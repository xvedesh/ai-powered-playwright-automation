import { expect, type Locator, type Page } from '@playwright/test';

import type { ProductReview } from '@models/ProductReview';
import { BasePage } from '@pages/BasePage';

export class ProductDetailPage extends BasePage {
  readonly reviewForm: Locator;
  readonly productName: Locator;
  readonly productCategory: Locator;
  readonly productPrice: Locator;
  readonly productAvailability: Locator;
  readonly productCondition: Locator;
  readonly productBrand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly viewCartButton: Locator;
  readonly writeYourReview: Locator;
  readonly yourNameInput: Locator;
  readonly emailAddress: Locator;
  readonly addReviewHere: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.reviewForm = page.locator('#review-form, form[action*="review"]').first();
    this.productName = page.locator('.product-information').getByRole('heading').first();
    this.productCategory = page.getByText(/category:/i).first();
    this.productPrice = page.locator('.product-information span span').first();
    this.productAvailability = page.getByText(/availability:/i).first();
    this.productCondition = page.getByText(/condition:/i).first();
    this.productBrand = page.getByText(/brand:/i).first();
    this.quantityInput = page.getByRole('spinbutton');
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.viewCartButton = page.getByRole('link', { name: 'View Cart' }).last();
    this.writeYourReview = page.getByText('Write Your Review');
    this.yourNameInput = page.locator('#name');
    this.emailAddress = page.locator('#email');
    this.addReviewHere = page.locator('#review');
    this.submitButton = page.locator('#button-review');
    this.successMessage = page.locator('.alert-success.alert span').filter({ hasText: 'Thank you for your review.' }).first();
  }

  async goto(productId = 1): Promise<void> {
    const path = `/product_details/${productId}`;
    await this.gotoPath(path);
    await this.recoverFromVignetteIfNeeded(path);
  }

  async expectProductDetailsVisible(): Promise<void> {
    await this.expectPath(/\/product_details\/\d+$/, '/product_details/1');
    await expect(this.productName, 'The product name should be visible on the product details page.').toBeVisible();
    await expect(this.productCategory, 'The product category should be visible on the product details page.').toBeVisible();
    await expect(this.productPrice, 'The product price should be visible on the product details page.').toBeVisible();
    await expect(this.productAvailability, 'The product availability should be visible on the product details page.').toBeVisible();
    await expect(this.productCondition, 'The product condition should be visible on the product details page.').toBeVisible();
    await expect(this.productBrand, 'The product brand should be visible on the product details page.').toBeVisible();
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async viewCart(): Promise<void> {
    await this.viewCartButton.click();
  }

  async submitReview(review: ProductReview): Promise<void> {
    await this.expectProductDetailsVisible();
    await this.writeYourReview.scrollIntoViewIfNeeded();
    await expect(this.writeYourReview, 'The review section should be visible before the shopper submits product feedback.').toBeVisible();
    await expect(this.emailAddress, 'The product review email field should be uniquely available inside the review form.').toBeVisible();
    await this.yourNameInput.fill(review.name);
    await this.emailAddress.fill(review.email);
    await this.addReviewHere.fill(review.review);
    await this.submitButton.click();
  }

  async expectReviewSuccess(): Promise<void> {
    await expect(this.successMessage, 'The product review confirmation message should appear after the review is submitted.').toBeVisible();
  }
}
