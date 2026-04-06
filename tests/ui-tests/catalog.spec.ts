import { ProductReviewBuilder } from '@builders/ProductReviewBuilder';
import { test, expect } from '@fixtures/test';

test.describe('Automation Exercise catalog and product scenarios', () => {
  test('Test Case 8: Verify All Products and product detail page', async ({
    productsPage,
    productDetailPage
  }) => {
    await test.step('Open the full products catalog', async () => {
      await productsPage.goto();
      await productsPage.waitForLoaded();
    });

    await test.step('Open the first product details page', async () => {
      await productsPage.openFirstProductDetails();
    });

    await test.step('Verify the product details are visible', async () => {
      await productDetailPage.expectProductDetailsVisible();
    });
  });

  test('Test Case 9: Search Product', async ({
    productsPage
  }) => {
    await test.step('Open the products catalog and search for Blue Top', async () => {
      await productsPage.goto();
      await productsPage.waitForLoaded();
      await productsPage.searchProduct('Blue Top');
      await productsPage.expectSearchedProductsVisible();
    });

    await test.step('Verify the search results contain matching products', async () => {
      const resultNames = await productsPage.getSearchResultNames();
      expect(resultNames.length, 'The search should return at least one matching product.').toBeGreaterThan(0);
      expect(resultNames.some((name) => name.toLowerCase().includes('blue')), 'At least one search result should contain the word Blue.').toBeTruthy();
    });
  });

  test('Test Case 12: Add Products in Cart', async ({
    productsPage,
    cartPage
  }) => {
    await test.step('Add the first two products to the shopping cart', async () => {
      await productsPage.goto();
      await productsPage.waitForLoaded();
      await productsPage.addFirstTwoProductsToCart();
      await productsPage.viewCart();
      await cartPage.expectDisplayed();
    });

    await test.step('Verify the cart shows product, price, quantity, and total details', async () => {
      const productNames = await cartPage.getProductNames();
      const prices = await cartPage.getPrices();
      const quantities = await cartPage.getQuantities();
      const totalPrices = await cartPage.getTotalPrices();

      expect(productNames.length, 'The cart should list at least two products after adding two items.').toBeGreaterThanOrEqual(2);
      expect(prices.length, 'The cart should display prices for each added product.').toBeGreaterThanOrEqual(2);
      expect(quantities.length, 'The cart should display quantities for each added product.').toBeGreaterThanOrEqual(2);
      expect(totalPrices.length, 'The cart should display line totals for each added product.').toBeGreaterThanOrEqual(2);
    });
  });

  test('Test Case 13: Verify Product quantity in Cart', async ({
    productDetailPage,
    cartPage
  }) => {
    await test.step('Open the first product details page', async () => {
      await productDetailPage.goto(1);
      await productDetailPage.expectProductDetailsVisible();
    });

    await test.step('Set the desired quantity and add the product to the cart', async () => {
      await productDetailPage.setQuantity(4);
      await productDetailPage.addToCart();
      await productDetailPage.viewCart();
    });

    await test.step('Verify the product is displayed with quantity four in the cart', async () => {
      await cartPage.expectProductWithQuantity('Blue Top', '4');
    });
  });

  test('Test Case 18: View Category Products', async ({
    homePage,
    page
  }) => {
    await test.step('Open the home page and verify category navigation is available', async () => {
      await homePage.goto();
      await homePage.waitForLoaded();
      await homePage.expectCategoriesVisible();
    });

    await test.step('Open the women dress category page', async () => {
      await homePage.openWomenDressCategory();
      await expect(page, 'The user should be redirected to the Women Dress category page.').toHaveURL(/\/category_products\/1$/);
    });

    await test.step('Open the men tshirts category page', async () => {
      await homePage.openMenTshirtsCategory();
      await expect(page, 'The user should be redirected to the Men Tshirts category page.').toHaveURL(/\/category_products\/3$/);
    });
  });

  test('Test Case 19: View & Cart Brand Products', async ({
    productsPage,
    page
  }) => {
    await test.step('Open the products page and verify the brands filter is visible', async () => {
      await productsPage.goto();
      await productsPage.waitForLoaded();
      await productsPage.expectBrandsVisible();
    });

    await test.step('Open the Polo brand catalog', async () => {
      await productsPage.openPoloBrand();
      await expect(page, 'The user should be redirected to the Polo brand product page.').toHaveURL(/\/brand_products\/Polo$/);
      await expect(productsPage.productsList, 'The Polo brand page should show a list of products.').toBeVisible();
    });

    await test.step('Open the Madame brand catalog', async () => {
      await productsPage.openMadameBrand();
      await expect(page, 'The user should be redirected to the Madame brand product page.').toHaveURL(/\/brand_products\/Madame$/);
      await expect(productsPage.productsList, 'The Madame brand page should show a list of products.').toBeVisible();
    });
  });

  test('Test Case 21: Add review on product', async ({
    productDetailPage
  }) => {
    const review = ProductReviewBuilder.create().build();

    await test.step('Open the first product details page', async () => {
      await productDetailPage.goto(1);
    });

    await test.step('Submit a product review', async () => {
      await productDetailPage.submitReview(review);
    });

    await test.step('Verify the review confirmation message', async () => {
      await productDetailPage.expectReviewSuccess();
    });
  });

  test('Test Case 22: Add to cart from Recommended items', async ({
    homePage,
    cartPage
  }) => {
    await test.step('Scroll to the recommended items section on the home page', async () => {
      await homePage.goto();
      await homePage.waitForLoaded();
      await homePage.scrollToFooter();
      await homePage.expectRecommendedItemsVisible();
    });

    await test.step('Add a recommended product to the shopping cart', async () => {
      await homePage.addRecommendedProductToCart();
      await homePage.viewCartFromModal();
    });

    await test.step('Verify the shopping cart contains the recommended product', async () => {
      const productNames = await cartPage.getProductNames();
      expect(productNames.length, 'The cart should contain at least one product after adding a recommended item.').toBeGreaterThan(0);
    });
  });
});
