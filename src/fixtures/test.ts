import { request as playwrightRequest, test as base, type APIRequestContext } from '@playwright/test';
import { ApiClient } from '@api/core/ApiClient';
import { ProductsService } from '@api/services/ProductsService';
import { UsersService } from '@api/services/UsersService';
import { env } from '@config/env';
import { installAdGuards } from '@core/browser/AdGuard';
import { AutomationExerciseFlows } from '@core/workflows/AutomationExerciseFlows';
import { AccountCreatedPage } from '@pages/AccountCreatedPage';
import { AccountDeletedPage } from '@pages/AccountDeletedPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { ContactUsPage } from '@pages/ContactUsPage';
import { EnterAccountInformationPage } from '@pages/EnterAccountInformationPage';
import { HomePage } from '@pages/HomePage';
import { LoggedHomePage } from '@pages/LoggedHomePage';
import { LoginSignupPage } from '@pages/LoginSignupPage';
import { PaymentPage } from '@pages/PaymentPage';
import { ProductDetailPage } from '@pages/ProductDetailPage';
import { ProductsPage } from '@pages/ProductsPage';
import { TestCasesPage } from '@pages/TestCasesPage';

type Fixtures = {
  homePage: HomePage;
  loginSignupPage: LoginSignupPage;
  enterAccountInformationPage: EnterAccountInformationPage;
  accountCreatedPage: AccountCreatedPage;
  accountDeletedPage: AccountDeletedPage;
  loggedHomePage: LoggedHomePage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
  contactUsPage: ContactUsPage;
  testCasesPage: TestCasesPage;
  automationExerciseFlows: AutomationExerciseFlows;
  apiRequestContext: APIRequestContext;
  apiClient: ApiClient;
  productsService: ProductsService;
  usersService: UsersService;
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await installAdGuards(page);
    await use(page);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginSignupPage: async ({ page }, use) => {
    await use(new LoginSignupPage(page));
  },

  enterAccountInformationPage: async ({ page }, use) => {
    await use(new EnterAccountInformationPage(page));
  },

  accountCreatedPage: async ({ page }, use) => {
    await use(new AccountCreatedPage(page));
  },

  accountDeletedPage: async ({ page }, use) => {
    await use(new AccountDeletedPage(page));
  },

  loggedHomePage: async ({ page }, use) => {
    await use(new LoggedHomePage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },

  contactUsPage: async ({ page }, use) => {
    await use(new ContactUsPage(page));
  },

  testCasesPage: async ({ page }, use) => {
    await use(new TestCasesPage(page));
  },

  automationExerciseFlows: async ({ page }, use) => {
    await use(new AutomationExerciseFlows(page));
  },

  apiRequestContext: async ({}, use) => {
    const apiRequestContext = await playwrightRequest.newContext({
      baseURL: env.apiBaseUrl
    });

    await use(apiRequestContext);
    await apiRequestContext.dispose();
  },

  apiClient: async ({ apiRequestContext }, use) => {
    await use(new ApiClient(apiRequestContext));
  },

  productsService: async ({ apiClient }, use) => {
    await use(new ProductsService(apiClient));
  },

  usersService: async ({ apiClient }, use) => {
    await use(new UsersService(apiClient));
  }
});

export { expect } from '@playwright/test';
