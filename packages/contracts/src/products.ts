export const PRODUCT_STATUSES = ["active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  defaultDeliveryUrl: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

/** Item da listagem: RF-PROD-02 pede a quantidade de ofertas ao lado. */
export interface ProductListItem extends Product {
  offersCount: number;
}
