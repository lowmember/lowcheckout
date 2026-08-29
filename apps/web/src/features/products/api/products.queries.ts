import { queryOptions } from "@tanstack/react-query";

import { getProduct, listProducts } from "@/features/products/api/products.api";
import type { ListProductsParams } from "@/features/products/types/product";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ListProductsParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (productId: string) => [...productKeys.details(), productId] as const,
};

export const productQueries = {
  list: (params: ListProductsParams = {}) =>
    queryOptions({
      queryKey: productKeys.list(params),
      queryFn: () => listProducts(params),
    }),

  detail: (productId: string) =>
    queryOptions({
      queryKey: productKeys.detail(productId),
      queryFn: () => getProduct(productId),
    }),
};
