import { ApiClient } from '@api/core/ApiClient';
import type { ProductsResponse } from '@api/models/Product';

export class ProductsService {
  constructor(private readonly apiClient: ApiClient) {}

  async getAllProducts(): Promise<ProductsResponse> {
    return this.apiClient.get<ProductsResponse>('/api/productsList');
  }
}
