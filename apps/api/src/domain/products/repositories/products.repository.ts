import type { Product } from "@/domain/products/entities/product.entity";
import type { ProductStatus } from "@/domain/products/value-objects/product-status";
import type { AccountScopedQuery, Page } from "@/domain/shared/repositories/page";

export interface ProductQuery extends AccountScopedQuery {
  status?: ProductStatus;
  search?: string;
}

/**
 * Porta de persistência de produtos. Toda leitura é escopada por conta: produto
 * de outra conta simplesmente não existe para quem consulta (RF-AUTH-03).
 */
export interface ProductsRepository {
  findMany(query: ProductQuery): Promise<Page<Product>>;
  findById(accountId: string, productId: string): Promise<Product | null>;
  create(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
}
