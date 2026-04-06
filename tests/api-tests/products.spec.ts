import { test, expect } from '@fixtures/test';

test('should get products list via API', async ({ productsService }) => {
  const response = await test.step('Request the complete product list from the API service', async () => {
    return productsService.getAllProducts();
  });

  await test.step('Verify the products API returns a valid catalog response', async () => {
    expect(response.responseCode, 'The products API should return a 200 response code.').toBe(200);
    expect(response.products.length, 'The products API should return at least one product.').toBeGreaterThan(0);
    expect(response.products[0], 'The first product returned by the API should include the expected fields.').toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        price: expect.any(String)
      })
    );
  });
});
