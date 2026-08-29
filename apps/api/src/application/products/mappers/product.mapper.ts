import type { ProductDto, ProductListItemDto } from "@/application/products/dtos/product.dto";
import type { Product } from "@/domain/products/entities/product.entity";

export function toProductDto(product: Product): ProductDto {
  const snapshot = product.toSnapshot();

  return {
    id: snapshot.id,
    name: snapshot.name,
    description: snapshot.description,
    imageUrl: snapshot.imageUrl,
    defaultDeliveryUrl: snapshot.defaultDeliveryUrl,
    status: snapshot.status,
    createdAt: snapshot.createdAt.toISOString(),
    updatedAt: snapshot.updatedAt.toISOString(),
  };
}

export function toProductListItemDto(product: Product, offersCount: number): ProductListItemDto {
  return { ...toProductDto(product), offersCount };
}
