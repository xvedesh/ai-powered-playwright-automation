import type { Product } from '@api/models/Product';

export class ProductSearchBuilder {
  private constructor(
    readonly searchTerm: string,
    readonly expectedProductName: string
  ) {}

  static fromProduct(product: Product): ProductSearchBuilder {
    return new ProductSearchBuilder(product.name, product.name);
  }

  static withSearchTerm(searchTerm: string, expectedProductName = searchTerm): ProductSearchBuilder {
    return new ProductSearchBuilder(searchTerm, expectedProductName);
  }
}
