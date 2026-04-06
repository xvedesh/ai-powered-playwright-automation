import { UserRegistrationBuilder } from '@builders/UserRegistrationBuilder';
import { test } from '@fixtures/test';

test.describe.configure({ timeout: 120000 });

test.describe('Automation Exercise account and auth scenarios', () => {
  test('Test Case 1: Register User', async ({
    automationExerciseFlows
  }) => {
    const user = UserRegistrationBuilder.create().build();

    await test.step('Register a brand-new shopper account', async () => {
      await automationExerciseFlows.registerUser(user);
    });

    await test.step('Delete the newly created shopper account', async () => {
      await automationExerciseFlows.deleteCurrentUser();
    });
  });

  test('Test Case 2: Login User with correct email and password', async ({
    automationExerciseFlows
  }) => {
    const user = UserRegistrationBuilder.create().build();

    await test.step('Create a shopper account for the login scenario', async () => {
      await automationExerciseFlows.registerUser(user);
    });

    await test.step('Sign out from the newly created account', async () => {
      await automationExerciseFlows.logoutUser();
    });

    await test.step('Sign back in with the registered shopper credentials', async () => {
      await automationExerciseFlows.loginUser(user.email, user.password, user.name);
    });

    await test.step('Clean up the shopper account after validation', async () => {
      await automationExerciseFlows.deleteCurrentUser();
    });
  });

  test('Test Case 3: Login User with incorrect email and password', async ({
    homePage,
    loginSignupPage
  }) => {
    await test.step('Open the login page from the home page', async () => {
      await homePage.goto();
      await homePage.waitForLoaded();
      await homePage.openSignupLogin();
      await loginSignupPage.waitForLoaded();
    });

    await test.step('Submit invalid shopper credentials', async () => {
      await loginSignupPage.login('invalid.user@example.com', 'WrongPassword123!');
    });

    await test.step('Verify the invalid login error message', async () => {
      await loginSignupPage.expectInvalidLoginError();
    });
  });

  test('Test Case 4: Logout User', async ({
    automationExerciseFlows,
    loginSignupPage
  }) => {
    const user = UserRegistrationBuilder.create().build();

    await test.step('Register a shopper account for the logout scenario', async () => {
      await automationExerciseFlows.registerUser(user);
    });

    await test.step('Log out and verify the authentication page is visible again', async () => {
      await automationExerciseFlows.logoutUser();
      await loginSignupPage.waitForLoaded();
    });

    await test.step('Log back in to confirm the shopper can re-enter the application', async () => {
      await automationExerciseFlows.loginUser(user.email, user.password, user.name);
    });

    await test.step('Delete the shopper account after the logout scenario completes', async () => {
      await automationExerciseFlows.deleteCurrentUser();
    });
  });

  test('Test Case 5: Register User with existing email', async ({
    automationExerciseFlows,
    homePage,
    loginSignupPage
  }) => {
    const user = UserRegistrationBuilder.create().build();

    await test.step('Create an initial shopper account with the target email address', async () => {
      await automationExerciseFlows.registerUser(user);
      await automationExerciseFlows.logoutUser();
    });

    await test.step('Attempt to register the same shopper email address again', async () => {
      await homePage.openSignupLogin();
      await loginSignupPage.waitForLoaded();
      await loginSignupPage.signup(user);
    });

    await test.step('Verify the duplicate email validation message', async () => {
      await loginSignupPage.expectExistingEmailError();
    });

    await test.step('Sign in and remove the original shopper account', async () => {
      await automationExerciseFlows.loginUser(user.email, user.password, user.name);
      await automationExerciseFlows.deleteCurrentUser();
    });
  });
});
