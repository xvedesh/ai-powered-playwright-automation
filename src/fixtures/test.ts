import { request as playwrightRequest, test as base, type APIRequestContext } from '@playwright/test';
import { ApiClient } from '@api/core/ApiClient';
import { ProductsService } from '@api/services/ProductsService';
import { UsersService } from '@api/services/UsersService';
import { env } from '@config/env';
import { HomePage } from '@pages/HomePage';
import { ProductsPage } from '@pages/ProductsPage';

type Fixtures = {
  homePage: HomePage;
  productsPage: ProductsPage;
  apiRequestContext: APIRequestContext;
  apiClient: ApiClient;
  productsService: ProductsService;
  usersService: UsersService;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
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
