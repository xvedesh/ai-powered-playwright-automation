import { PaymentDetailsBuilder } from '@builders/PaymentDetailsBuilder';
import { UserRegistrationBuilder } from '@builders/UserRegistrationBuilder';
import { test, expect } from '@fixtures/test';

const orderComment = 'Enterprise Playwright checkout validation comment.';

test.describe.configure({ timeout: 120000 });

test.describe('Automation Exercise cart and checkout scenarios', () => {
  test('Test Case 14: Place Order: Register while Checkout', async ({
    homePage,
    productsPage,
    cartPage,
    loginSignupPage,
    enterAccountInformationPage,
    accountCreatedPage,
    loggedHomePage,
    checkoutPage,
    paymentPage,
    accountDeletedPage
  }) => {
    const user = UserRegistrationBuilder.create().build();
    const paymentDetails = PaymentDetailsBuilder.create().build();

    await test.step('Add products to the cart before registration', async () => {
      await homePage.goto();
      await homePage.waitForLoaded();
      await productsPage.goto();
      await productsPage.waitForLoaded();
      await productsPage.addFirstTwoProductsToCart();
      await productsPage.viewCart();
      await cartPage.expectDisplayed();
    });

    await test.step('Proceed to checkout and navigate to shopper registration', async () => {
      await cartPage.proceedToCheckout();
      await cartPage.clickRegisterLogin();
      await loginSignupPage.waitForLoaded();
    });

    await test.step('Register a new shopper account during checkout', async () => {
      await loginSignupPage.signup(user);
      await enterAccountInformationPage.waitForLoaded();
      await enterAccountInformationPage.completeRegistration(user);
      await accountCreatedPage.expectVisible();
      await accountCreatedPage.continue();
      await loggedHomePage.expectLoggedInAs(user.name);
    });

    await test.step('Return to checkout and place the order', async () => {
      await homePage.openCart();
      await cartPage.proceedToCheckout();
      await checkoutPage.expectAddressDetailsAndReviewOrder();
      await checkoutPage.enterCommentAndPlaceOrder(orderComment);
      await paymentPage.payAndConfirm(paymentDetails);
      await paymentPage.expectOrderSuccess();
    });

    await test.step('Delete the shopper account after the order is completed', async () => {
      await loggedHomePage.deleteAccount();
      await accountDeletedPage.expectVisible();
    });
  });

  test('Test Case 15: Place Order: Register before Checkout', async ({
    automationExerciseFlows,
    paymentPage
  }) => {
    const user = UserRegistrationBuilder.create().build();
    const paymentDetails = PaymentDetailsBuilder.create().build();

    await test.step('Register a shopper account before checkout', async () => {
      await automationExerciseFlows.registerUser(user);
    });

    await test.step('Add products to the cart and complete the order', async () => {
      await automationExerciseFlows.addFirstTwoProductsToCart();
      await automationExerciseFlows.placeOrder(orderComment, paymentDetails);
      await paymentPage.continue();
    });

    await test.step('Delete the shopper account after purchase', async () => {
      await automationExerciseFlows.deleteCurrentUser();
    });
  });

  test('Test Case 16: Place Order: Login before Checkout', async ({
    automationExerciseFlows,
    paymentPage
  }) => {
    const user = UserRegistrationBuilder.create().build();
    const paymentDetails = PaymentDetailsBuilder.create().build();

    await test.step('Register a shopper account for the login-before-checkout scenario', async () => {
      await automationExerciseFlows.registerUser(user);
    });

    await test.step('Log out and sign back in with the shopper credentials', async () => {
      await automationExerciseFlows.logoutUser();
      await automationExerciseFlows.loginUser(user.email, user.password, user.name);
    });

    await test.step('Add products and place the order as a logged-in shopper', async () => {
      await automationExerciseFlows.addFirstTwoProductsToCart();
      await automationExerciseFlows.placeOrder(orderComment, paymentDetails);
      await paymentPage.continue();
    });

    await test.step('Delete the shopper account after the order completes', async () => {
      await automationExerciseFlows.deleteCurrentUser();
    });
  });

  test('Test Case 17: Remove Products From Cart', async ({
    automationExerciseFlows,
    cartPage
  }) => {
    await test.step('Add products to the shopping cart', async () => {
      await automationExerciseFlows.addFirstTwoProductsToCart();
    });

    await test.step('Remove one product from the cart and verify the cart count decreases', async () => {
      const initialNames = await cartPage.getProductNames();
      expect(initialNames.length, 'The cart should contain at least two products before a removal action.').toBeGreaterThanOrEqual(2);

      await cartPage.removeProductAt(0);

      const updatedNames = await cartPage.getProductNames();
      expect(updatedNames.length, 'The cart should contain fewer products after one item is removed.').toBeLessThan(initialNames.length);
    });
  });

  test('Test Case 20: Search Products and Verify Cart After Login', async ({
    automationExerciseFlows,
    productsPage,
    cartPage,
    homePage
  }) => {
    const user = UserRegistrationBuilder.create().build();

    await test.step('Register a shopper account and log out before searching products', async () => {
      await automationExerciseFlows.registerUser(user);
      await automationExerciseFlows.logoutUser();
    });

    await test.step('Search products and add visible search results to the cart', async () => {
      await productsPage.goto();
      await productsPage.waitForLoaded();
      await productsPage.searchProduct('Top');
      await productsPage.expectSearchedProductsVisible();
    });

    let addedProductNames: string[] = [];
    await test.step('Open the cart and verify searched products were added before login', async () => {
      addedProductNames = await productsPage.addAllVisibleSearchResultsToCart();
      await productsPage.viewCart();
      await cartPage.expectDisplayed();

      const cartProductNamesBeforeLogin = await cartPage.getProductNames();
      expect(cartProductNamesBeforeLogin.length, 'The cart should contain products before the shopper logs back in.').toBeGreaterThan(0);
    });

    await test.step('Log in again and verify the cart still contains the searched products', async () => {
      await homePage.openSignupLogin();
      await automationExerciseFlows.loginUser(user.email, user.password, user.name);
      await homePage.openCart();
      await cartPage.expectDisplayed();

      const cartProductNamesAfterLogin = await cartPage.getProductNames();
      expect(cartProductNamesAfterLogin, 'The cart should preserve the searched products after the shopper logs back in.').toEqual(expect.arrayContaining(addedProductNames));
    });

    await test.step('Remove all products and clean up the shopper account', async () => {
      await cartPage.removeAllProducts();
      await cartPage.expectEmpty();
      await automationExerciseFlows.deleteCurrentUser();
    });
  });

  test('Test Case 23: Verify address details in checkout page', async ({
    automationExerciseFlows,
    checkoutPage
  }) => {
    const user = UserRegistrationBuilder.create().build();

    await test.step('Register a shopper and proceed to checkout', async () => {
      await automationExerciseFlows.registerUser(user);
      await automationExerciseFlows.addFirstTwoProductsToCart();
      await automationExerciseFlows.cartPage.proceedToCheckout();
      await checkoutPage.expectAddressDetailsAndReviewOrder();
    });

    await test.step('Verify the delivery and billing addresses match the registered shopper details', async () => {
      const deliveryAddress = await checkoutPage.getDeliveryAddressLines();
      const invoiceAddress = await checkoutPage.getInvoiceAddressLines();

      expect(deliveryAddress.join(' '), 'The delivery address should contain the shopper first name.').toContain(user.firstName);
      expect(deliveryAddress.join(' '), 'The delivery address should contain the shopper primary address.').toContain(user.address1);
      expect(invoiceAddress.join(' '), 'The billing address should contain the shopper first name.').toContain(user.firstName);
      expect(invoiceAddress.join(' '), 'The billing address should contain the shopper primary address.').toContain(user.address1);
    });

    await test.step('Delete the shopper account after validating the checkout addresses', async () => {
      await automationExerciseFlows.deleteCurrentUser();
    });
  });

  test('Test Case 24: Download Invoice after purchase order', async ({
    automationExerciseFlows,
    paymentPage
  }) => {
    const user = UserRegistrationBuilder.create().build();
    const paymentDetails = PaymentDetailsBuilder.create().build();

    await test.step('Register a shopper account and place an order', async () => {
      await automationExerciseFlows.registerUser(user);
      await automationExerciseFlows.addFirstTwoProductsToCart();
      await automationExerciseFlows.placeOrder(orderComment, paymentDetails);
    });

    await test.step('Download the generated invoice', async () => {
      const download = await paymentPage.downloadInvoice();
      expect(await download.suggestedFilename(), 'The browser should provide a suggested filename when the invoice download starts.').toBeTruthy();
    });

    await test.step('Return to the application and remove the shopper account', async () => {
      await paymentPage.continue();
      await automationExerciseFlows.deleteCurrentUser();
    });
  });
});
