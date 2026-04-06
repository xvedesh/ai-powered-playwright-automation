import { ContactMessageBuilder } from '@builders/ContactMessageBuilder';
import { test, expect } from '@fixtures/test';

test.describe('Automation Exercise navigation and footer scenarios', () => {
  test('Test Case 6: Contact Us Form', async ({
    homePage,
    contactUsPage
  }) => {
    const contactMessage = ContactMessageBuilder.create().build();

    await test.step('Open the contact us page from the home page', async () => {
      await homePage.goto();
      await homePage.waitForLoaded();
      await homePage.openContactUs();
      await contactUsPage.waitForLoaded();
    });

    await test.step('Submit the contact us form with shopper details', async () => {
      await contactUsPage.submitContactForm(contactMessage);
    });

    await test.step('Verify the contact us success message and return home', async () => {
      await contactUsPage.expectSuccessMessage();
      await contactUsPage.clickHome();
      await homePage.waitForLoaded();
    });
  });

  test('Test Case 7: Verify Test Cases Page', async ({
    homePage,
    testCasesPage
  }) => {
    await test.step('Open the Test Cases page from the home page', async () => {
      await homePage.goto();
      await homePage.waitForLoaded();
      await homePage.openTestCases();
      await testCasesPage.expectLoaded();
    });
  });

  test('Test Case 10: Verify Subscription in home page', async ({
    homePage
  }) => {
    await test.step('Scroll to the home page footer subscription section', async () => {
      await homePage.goto();
      await homePage.waitForLoaded();
      await homePage.scrollToFooter();
    });

    await test.step('Subscribe from the home page footer', async () => {
      await homePage.subscribe(`subscriber.${Date.now()}@example.com`);
      await homePage.expectSubscriptionSuccess();
    });
  });

  test('Test Case 11: Verify Subscription in Cart page', async ({
    homePage,
    cartPage
  }) => {
    await test.step('Open the cart page and scroll to the subscription section', async () => {
      await homePage.goto();
      await homePage.waitForLoaded();
      await homePage.openCart();
      await cartPage.scrollToFooter();
    });

    await test.step('Subscribe from the cart page footer', async () => {
      await cartPage.subscribe(`cart.subscriber.${Date.now()}@example.com`);
      await cartPage.expectSubscriptionSuccess();
    });
  });

  test('Test Case 25: Verify Scroll Up using Arrow button and Scroll Down functionality', async ({
    homePage
  }) => {
    await test.step('Scroll to the footer from the home page', async () => {
      await homePage.goto();
      await homePage.waitForLoaded();
      await homePage.scrollToFooter();
    });

    await test.step('Use the arrow button to return to the top of the page', async () => {
      await homePage.clickScrollUp();
      await homePage.expectMainHeadingVisible();
    });
  });

  test('Test Case 26: Verify Scroll Up without Arrow button and Scroll Down functionality', async ({
    homePage,
    page
  }) => {
    await test.step('Scroll to the footer from the home page', async () => {
      await homePage.goto();
      await homePage.waitForLoaded();
      await homePage.scrollToFooter();
    });

    await test.step('Scroll back to the top without using the arrow button', async () => {
      await homePage.scrollPageToTop();
      const scrollPosition = await page.evaluate(() => window.scrollY);
      expect(scrollPosition, 'The page should be scrolled back to the top after the manual scroll action.').toBe(0);
      await homePage.expectMainHeadingVisible();
    });
  });
});
