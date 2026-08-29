import { useQuery } from "@tanstack/react-query";

import { productQueries } from "@/features/products/api/products.queries";
import type { ListProductsParams } from "@/features/products/types/product";

export function useProducts(params: ListProductsParams = {}) {
  const { data, isLoading, isError } = useQuery(productQueries.list(params));

  return {
    products: data?.data ?? [],
    productsMeta: data?.meta,
    isLoadingProducts: isLoading,
    hasProductsError: isError,
  };
}
