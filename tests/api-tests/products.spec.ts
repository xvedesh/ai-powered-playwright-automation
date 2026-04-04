import { test, expect } from '@fixtures/test';

test('should get products list via API', async ({ productsService }) => {
  const response = await productsService.getAllProducts();

  expect(response.responseCode).toBe(200);
  expect(response.products.length).toBeGreaterThan(0);
  expect(response.products[0]).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      name: expect.any(String),
      price: expect.any(String)
    })
  );
});
