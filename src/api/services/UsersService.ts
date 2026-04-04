import { ApiClient } from '@api/core/ApiClient';
import type { UserCredentials, VerifyUserResponse } from '@api/models/User';

export class UsersService {
  constructor(private readonly apiClient: ApiClient) {}

  async verifyUser(credentials: UserCredentials): Promise<VerifyUserResponse> {
    return this.apiClient.post<VerifyUserResponse>('/api/verifyLogin', {
      data: credentials
    });
  }
}
