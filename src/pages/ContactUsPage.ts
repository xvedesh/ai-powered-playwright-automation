import { expect, type Locator, type Page } from '@playwright/test';

import type { ContactMessage } from '@models/ContactMessage';
import { BasePage } from '@pages/BasePage';

export class ContactUsPage extends BasePage {
  readonly contactForm: Locator;
  readonly getInTouch: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly uploadFileInput: Locator;
  readonly submitButton: Locator;
  readonly alertSuccess: Locator;
  readonly homePageButton: Locator;

  constructor(page: Page) {
    super(page);
    this.contactForm = page.locator('form').first();
    this.getInTouch = page.getByRole('heading', { name: 'Get In Touch' });
    this.nameInput = this.contactForm.getByPlaceholder('Name');
    this.emailInput = this.contactForm.getByPlaceholder('Email');
    this.subjectInput = this.contactForm.getByPlaceholder('Subject');
    this.messageInput = this.contactForm.getByPlaceholder('Your Message Here');
    this.uploadFileInput = this.contactForm.locator(`[name='upload_file']`);
    this.submitButton = this.contactForm.getByRole('button', { name: 'Submit' });
    this.alertSuccess = page.locator('#contact-page .status.alert.alert-success').first();
    this.homePageButton = page.getByRole('link', { name: 'Home' });
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.getInTouch, 'The contact page should show the Get In Touch heading.').toBeVisible();
    await expect(this.emailInput, 'The contact email field should be visible before the form is submitted.').toBeVisible();
  }

  async submitContactForm(contactMessage: ContactMessage): Promise<void> {
    await this.nameInput.click();
    await this.nameInput.fill(contactMessage.name);
    await this.emailInput.click();
    await this.emailInput.fill(contactMessage.email);
    await this.subjectInput.fill(contactMessage.subject);
    await this.messageInput.fill(contactMessage.message);
    await this.uploadFileInput.setInputFiles(contactMessage.filePath);
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await this.submitButton.click();
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.alertSuccess, 'The contact us form should confirm successful submission.').toBeVisible();
  }

  async clickHome(): Promise<void> {
    await this.homePageButton.click();
  }
}
