import { useQuery } from "@tanstack/react-query";

import { offerQueries } from "@/features/offers/api/offers.queries";

export function useProductOffers(productId: string) {
  const { data, isLoading, isError } = useQuery(offerQueries.listByProduct(productId));

  return {
    offers: data?.data ?? [],
    isLoadingOffers: isLoading,
    hasOffersError: isError,
  };
}
