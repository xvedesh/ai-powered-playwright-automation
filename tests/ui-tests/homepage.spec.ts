import { test, expect } from '@fixtures/test';

test('homepage should open successfully', async ({ homePage, page }) => {
  await test.step('Open the home page', async () => {
    await homePage.goto();
    await homePage.waitForLoaded();
  });

  await test.step('Verify the shopper lands on the Automation Exercise home page', async () => {
    await homePage.expectHomeUrl();
    await expect(page, 'The browser title should identify the Automation Exercise home page.').toHaveTitle(/Automation Exercise/i);
  });
});
