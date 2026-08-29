import { Product } from "@/domain/products/entities/product.entity";
import { toProductStatus } from "@/domain/products/value-objects/product-status";
import type { NewProductRow, ProductRow } from "@/infra/persistence/drizzle/schema";

export function toProduct(row: ProductRow): Product {
  return Product.restore({
    id: row.id,
    accountId: row.accountId,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    defaultDeliveryUrl: row.defaultDeliveryUrl,
    status: toProductStatus(row.status),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toProductRow(product: Product): NewProductRow {
  const snapshot = product.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    name: snapshot.name,
    description: snapshot.description,
    imageUrl: snapshot.imageUrl,
    defaultDeliveryUrl: snapshot.defaultDeliveryUrl,
    status: snapshot.status,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}
