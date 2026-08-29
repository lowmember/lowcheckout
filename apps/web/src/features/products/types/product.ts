export type ProductStatus = "active" | "archived";

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

/** A listagem devolve o produto com a contagem de ofertas (RF-PROD-02). */
export interface ProductListItem extends Product {
  offersCount: number;
}

export interface ListProductsParams {
  page?: number;
  perPage?: number;
  status?: ProductStatus;
  search?: string;
}

export interface CreateProductInput {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  defaultDeliveryUrl?: string | null;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  status?: ProductStatus;
}

export type ProductFieldErrors = Partial<Record<keyof CreateProductInput, string>>;
