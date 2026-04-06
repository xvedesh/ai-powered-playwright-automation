import { expect, type Locator, type Page } from '@playwright/test';

import type { UserRegistration } from '@models/UserRegistration';
import { BasePage } from '@pages/BasePage';

export class LoginSignupPage extends BasePage {
  readonly loginToYourAccountHeading: Locator;
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly errorLogin: Locator;
  readonly newUserSignupHeading: Locator;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly emailAddressAlreadyExist: Locator;

  constructor(page: Page) {
    super(page);
    this.loginToYourAccountHeading = page.getByRole('heading', { name: 'Login to your account' });
    this.loginEmailInput = page.getByPlaceholder('Email').first();
    this.loginPasswordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorLogin = page.getByText('Your email or password is incorrect!');
    this.newUserSignupHeading = page.getByRole('heading', { name: 'New User Signup!' });
    this.signupNameInput = page.getByPlaceholder('Name');
    this.signupEmailInput = page.getByPlaceholder('Email').nth(1);
    this.signupButton = page.getByRole('button', { name: 'Signup' });
    this.emailAddressAlreadyExist = page.getByText('Email Address already exist!');
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.loginToYourAccountHeading, 'The login section should be visible on the authentication page.').toBeVisible();
    await expect(this.newUserSignupHeading, 'The signup section should be visible on the authentication page.').toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
  }

  async signup(user: UserRegistration): Promise<void> {
    await this.signupNameInput.fill(user.name);
    await this.signupEmailInput.fill(user.email);
    await this.signupButton.click();
  }

  async expectInvalidLoginError(): Promise<void> {
    await expect(this.errorLogin, 'The application should explain that the login credentials are invalid.').toBeVisible();
  }

  async expectExistingEmailError(): Promise<void> {
    await expect(this.emailAddressAlreadyExist, 'The application should explain that the email address is already registered.').toBeVisible();
  }
}
