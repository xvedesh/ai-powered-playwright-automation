import type { Page } from '@playwright/test';

import type { PaymentDetails } from '@models/PaymentDetails';
import type { UserRegistration } from '@models/UserRegistration';
import { AccountCreatedPage } from '@pages/AccountCreatedPage';
import { AccountDeletedPage } from '@pages/AccountDeletedPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { EnterAccountInformationPage } from '@pages/EnterAccountInformationPage';
import { HomePage } from '@pages/HomePage';
import { LoggedHomePage } from '@pages/LoggedHomePage';
import { LoginSignupPage } from '@pages/LoginSignupPage';
import { PaymentPage } from '@pages/PaymentPage';
import { ProductsPage } from '@pages/ProductsPage';

export class AutomationExerciseFlows {
  readonly homePage: HomePage;
  readonly loginSignupPage: LoginSignupPage;
  readonly enterAccountInformationPage: EnterAccountInformationPage;
  readonly accountCreatedPage: AccountCreatedPage;
  readonly loggedHomePage: LoggedHomePage;
  readonly accountDeletedPage: AccountDeletedPage;
  readonly productsPage: ProductsPage;
  readonly cartPage: CartPage;
  readonly checkoutPage: CheckoutPage;
  readonly paymentPage: PaymentPage;

  constructor(page: Page) {
    this.homePage = new HomePage(page);
    this.loginSignupPage = new LoginSignupPage(page);
    this.enterAccountInformationPage = new EnterAccountInformationPage(page);
    this.accountCreatedPage = new AccountCreatedPage(page);
    this.loggedHomePage = new LoggedHomePage(page);
    this.accountDeletedPage = new AccountDeletedPage(page);
    this.productsPage = new ProductsPage(page);
    this.cartPage = new CartPage(page);
    this.checkoutPage = new CheckoutPage(page);
    this.paymentPage = new PaymentPage(page);
  }

  async registerUser(user: UserRegistration): Promise<void> {
    await this.homePage.goto();
    await this.homePage.waitForLoaded();
    await this.homePage.openSignupLogin();
    await this.loginSignupPage.waitForLoaded();
    await this.loginSignupPage.signup(user);
    await this.enterAccountInformationPage.waitForLoaded();
    await this.enterAccountInformationPage.completeRegistration(user);
    await this.accountCreatedPage.expectVisible();
    await this.accountCreatedPage.continue();
    await this.loggedHomePage.expectLoggedInAs(user.name);
  }

  async loginUser(email: string, password: string, username: string): Promise<void> {
    if (!(await this.homePage.signupLoginButton.isVisible())) {
      await this.homePage.goto();
      await this.homePage.waitForLoaded();
    }
    await this.homePage.openSignupLogin();
    await this.loginSignupPage.waitForLoaded();
    await this.loginSignupPage.login(email, password);
    await this.loggedHomePage.expectLoggedInAs(username);
  }

  async logoutUser(): Promise<void> {
    await this.loggedHomePage.logout();
    await this.loginSignupPage.waitForLoaded();
  }

  async deleteCurrentUser(): Promise<void> {
    await this.loggedHomePage.deleteAccount();
    await this.accountDeletedPage.expectVisible();
    await this.accountDeletedPage.continue();
  }

  async addFirstTwoProductsToCart(): Promise<void> {
    await this.productsPage.goto();
    await this.productsPage.waitForLoaded();
    await this.productsPage.addFirstTwoProductsToCart();
    await this.productsPage.viewCart();
    await this.cartPage.expectDisplayed();
  }

  async placeOrder(comment: string, paymentDetails: PaymentDetails): Promise<void> {
    await this.cartPage.proceedToCheckout();
    await this.checkoutPage.expectAddressDetailsAndReviewOrder();
    await this.checkoutPage.enterCommentAndPlaceOrder(comment);
    await this.paymentPage.payAndConfirm(paymentDetails);
    await this.paymentPage.expectOrderSuccess();
  }
}
