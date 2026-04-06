import { ProductSearchBuilder } from '@builders/ProductSearchBuilder';
import { test, expect } from '@fixtures/test';

test('product from API should be visible in UI', async ({ productsService, productsPage }) => {
  const apiResponse = await test.step('Request the product catalog from the API service', async () => {
    return productsService.getAllProducts();
  });

  await test.step('Validate the API response before continuing with the UI search', async () => {
    expect(apiResponse.responseCode, 'The product catalog API should return a 200 response code.').toBe(200);
    expect(apiResponse.products.length, 'The product catalog API should return at least one product.').toBeGreaterThan(0);
  });

  const firstProduct = apiResponse.products[0];
  expect(firstProduct, 'The API response should include a first product that can be searched in the UI.').toBeDefined();
  const search = ProductSearchBuilder.fromProduct(firstProduct!);

  await test.step('Search for the API product in the UI catalog', async () => {
    await productsPage.goto();
    await productsPage.waitForLoaded();
    await productsPage.searchProduct(search.searchTerm);
    await productsPage.expectProductVisible(search.expectedProductName);
  });
});
