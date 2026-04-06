import type { PaymentDetails } from '@models/PaymentDetails';

export class PaymentDetailsBuilder {
  private paymentDetails: PaymentDetails = {
    nameOnCard: 'Playwright Tester',
    cardNumber: '4111111111111111',
    cvc: '123',
    expiryMonth: '12',
    expiryYear: '2030'
  };

  static create(): PaymentDetailsBuilder {
    return new PaymentDetailsBuilder();
  }

  build(): PaymentDetails {
    return { ...this.paymentDetails };
  }
}
