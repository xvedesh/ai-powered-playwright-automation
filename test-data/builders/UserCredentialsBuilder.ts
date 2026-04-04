import type { UserCredentials } from '@api/models/User';

export class UserCredentialsBuilder {
  private email = 'demo.user@example.com';
  private password = 'Password123!';

  static create(): UserCredentialsBuilder {
    return new UserCredentialsBuilder();
  }

  withEmail(email: string): UserCredentialsBuilder {
    this.email = email;
    return this;
  }

  withPassword(password: string): UserCredentialsBuilder {
    this.password = password;
    return this;
  }

  build(): UserCredentials {
    return {
      email: this.email,
      password: this.password
    };
  }
}
