import type { ProductStatus } from "@/domain/products/value-objects/product-status";

/** Contrato de saída dos casos de uso — só primitivos, nunca a entidade. */
export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  defaultDeliveryUrl: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

/** Item da listagem: RF-PROD-02 pede a quantidade de ofertas ao lado do produto. */
export interface ProductListItemDto extends ProductDto {
  offersCount: number;
}
