import { useQuery } from "@tanstack/react-query";

import { checkoutQueries } from "@/features/checkouts/api/checkouts.queries";

export function useCheckout(checkoutId: string) {
  const { data, isLoading, isError } = useQuery(checkoutQueries.detail(checkoutId));

  return {
    checkout: data,
    isLoadingCheckout: isLoading,
    hasCheckoutError: isError,
  };
}
