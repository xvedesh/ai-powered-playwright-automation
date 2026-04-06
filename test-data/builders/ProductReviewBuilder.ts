import type { ProductReview } from '@models/ProductReview';

export class ProductReviewBuilder {
  private productReview: ProductReview = {
    name: 'Playwright Reviewer',
    email: 'playwright.review@example.com',
    review: 'This product review was submitted by the enterprise Playwright automation suite.'
  };

  static create(): ProductReviewBuilder {
    return new ProductReviewBuilder();
  }

  build(): ProductReview {
    return { ...this.productReview };
  }
}
