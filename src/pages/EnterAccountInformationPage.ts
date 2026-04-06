import { expect, type Locator, type Page } from '@playwright/test';

import type { UserRegistration } from '@models/UserRegistration';
import { BasePage } from '@pages/BasePage';

export class EnterAccountInformationPage extends BasePage {
  readonly enterAccountInformation: Locator;
  readonly titleMrCheckbox: Locator;
  readonly passwordInput: Locator;
  readonly daysSelect: Locator;
  readonly monthsSelect: Locator;
  readonly yearsSelect: Locator;
  readonly newsletterCheckbox: Locator;
  readonly specialOffersCheckbox: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countrySelect: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    this.enterAccountInformation = page.getByText('Enter Account Information');
    this.titleMrCheckbox = page.locator('#id_gender1');
    this.passwordInput = page.locator('#password');
    this.daysSelect = page.locator('#days');
    this.monthsSelect = page.locator('#months');
    this.yearsSelect = page.locator('#years');
    this.newsletterCheckbox = page.locator('#newsletter');
    this.specialOffersCheckbox = page.locator('#optin');
    this.firstNameInput = page.locator('#first_name');
    this.lastNameInput = page.locator('#last_name');
    this.companyInput = page.locator('#company');
    this.address1Input = page.locator('#address1');
    this.address2Input = page.locator('#address2');
    this.countrySelect = page.locator('#country');
    this.stateInput = page.locator('#state');
    this.cityInput = page.locator('#city');
    this.zipcodeInput = page.locator('#zipcode');
    this.mobileNumberInput = page.locator('#mobile_number');
    this.createAccountButton = page.getByRole('button', { name: /create account/i });
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.enterAccountInformation, 'The account information form should be visible after signup details are submitted.').toBeVisible();
  }

  async completeRegistration(user: UserRegistration): Promise<void> {
    if (user.title === 'Mr') {
      await this.titleMrCheckbox.check();
    }

    await this.passwordInput.fill(user.password);
    await this.daysSelect.selectOption(user.birthDay);
    await this.monthsSelect.selectOption(user.birthMonth);
    await this.yearsSelect.selectOption(user.birthYear);
    await this.newsletterCheckbox.check();
    await this.specialOffersCheckbox.check();
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.companyInput.fill(user.company);
    await this.address1Input.fill(user.address1);
    await this.address2Input.fill(user.address2);
    await this.countrySelect.selectOption({ label: user.country });
    await this.stateInput.fill(user.state);
    await this.cityInput.fill(user.city);
    await this.zipcodeInput.fill(user.zipcode);
    await this.mobileNumberInput.fill(user.mobileNumber);
    await this.createAccountButton.click();
  }
}
