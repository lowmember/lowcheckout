import { useQuery } from "@tanstack/react-query";

import { productQueries } from "@/features/products/api/products.queries";

export function useProduct(productId: string) {
  const { data, isLoading, isError } = useQuery(productQueries.detail(productId));

  return {
    product: data,
    isLoadingProduct: isLoading,
    hasProductError: isError,
  };
}
