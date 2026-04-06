import type { UserRegistration } from '@models/UserRegistration';

export class UserRegistrationBuilder {
  private readonly seed = Date.now();
  private registration: UserRegistration = {
    title: 'Mr',
    name: `Playwright User ${this.seed}`,
    email: `playwright.user.${this.seed}@example.com`,
    password: 'Password123!',
    birthDay: '10',
    birthMonth: '5',
    birthYear: '1995',
    firstName: 'Playwright',
    lastName: 'Tester',
    company: 'Automation Labs',
    address1: '123 Test Street',
    address2: 'Suite 100',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    zipcode: '94105',
    mobileNumber: '1234567890'
  };

  static create(): UserRegistrationBuilder {
    return new UserRegistrationBuilder();
  }

  withEmail(email: string): UserRegistrationBuilder {
    this.registration.email = email;
    return this;
  }

  withPassword(password: string): UserRegistrationBuilder {
    this.registration.password = password;
    return this;
  }

  withName(name: string): UserRegistrationBuilder {
    this.registration.name = name;
    return this;
  }

  build(): UserRegistration {
    return { ...this.registration };
  }
}
