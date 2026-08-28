import type {
  CreateProductInput,
  ListProductsParams,
  Product,
  ProductListItem,
  UpdateProductInput,
} from "@/features/products/types/product";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse, PaginatedResponse } from "@/shared/api/types";

export async function listProducts(params: ListProductsParams = {}) {
  const response = await httpClient.get<PaginatedResponse<ProductListItem>>("/products", {
    params,
  });
  return response.data;
}

export async function getProduct(productId: string) {
  const response = await httpClient.get<ApiResponse<Product>>(`/products/${productId}`);
  return response.data.data;
}

export async function createProduct(input: CreateProductInput) {
  const response = await httpClient.post<ApiResponse<Product>>("/products", input);
  return response.data.data;
}

export async function updateProduct(productId: string, input: UpdateProductInput) {
  const response = await httpClient.patch<ApiResponse<Product>>(`/products/${productId}`, input);
  return response.data.data;
}
