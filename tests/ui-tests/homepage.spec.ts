import { test, expect } from '@fixtures/test';

test('homepage should open successfully', async ({ homePage, page }) => {
  await homePage.goto();
  await homePage.waitForLoaded();

  await homePage.expectHomeUrl();
  await expect(page).toHaveTitle(/Automation Exercise/i);
});
