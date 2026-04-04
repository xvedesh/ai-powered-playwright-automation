import { ProductSearchBuilder } from '@builders/ProductSearchBuilder';
import { test, expect } from '@fixtures/test';

test('product from API should be visible in UI', async ({ productsService, productsPage }) => {
  const apiResponse = await productsService.getAllProducts();

  expect(apiResponse.responseCode).toBe(200);
  expect(apiResponse.products.length).toBeGreaterThan(0);

  const firstProduct = apiResponse.products[0];
  expect(firstProduct).toBeDefined();

  const search = ProductSearchBuilder.fromProduct(firstProduct!);

  await productsPage.goto();
  await productsPage.waitForLoaded();
  await productsPage.searchProduct(search.searchTerm);
  await productsPage.expectProductVisible(search.expectedProductName);
});
