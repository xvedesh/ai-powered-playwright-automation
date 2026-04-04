import { APIRequestContext, APIResponse, expect } from '@playwright/test';

type RequestOptions = {
  data?: Record<string, string | number | boolean>;
  failOnStatusCode?: boolean;
};

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async get<TResponse>(url: string, options?: RequestOptions): Promise<TResponse> {
    const response = await this.request.get(url, {
      failOnStatusCode: options?.failOnStatusCode ?? false
    });

    await this.assertSuccessful(response, url);

    return (await response.json()) as TResponse;
  }

  async post<TResponse>(url: string, options?: RequestOptions): Promise<TResponse> {
    const response = await this.request.post(url, {
      form: options?.data,
      failOnStatusCode: options?.failOnStatusCode ?? false
    });

    await this.assertSuccessful(response, url);

    return (await response.json()) as TResponse;
  }

  private async assertSuccessful(response: APIResponse, url: string): Promise<void> {
    expect.soft(response.ok(), `Expected successful API response from ${url}`).toBeTruthy();

    if (!response.ok()) {
      const responseText = await response.text();
      throw new Error(`API request failed for ${url}: ${response.status()} ${response.statusText()} - ${responseText}`);
    }
  }
}
