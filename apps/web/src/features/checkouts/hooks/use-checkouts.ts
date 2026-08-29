import { useQuery } from "@tanstack/react-query";

import { checkoutQueries } from "@/features/checkouts/api/checkouts.queries";
import type { ListCheckoutsParams } from "@/features/checkouts/types/checkout";

export function useCheckouts(params: ListCheckoutsParams = {}) {
  const { data, isLoading, isError } = useQuery(checkoutQueries.list(params));

  return {
    checkouts: data?.data ?? [],
    checkoutsMeta: data?.meta,
    isLoadingCheckouts: isLoading,
    hasCheckoutsError: isError,
  };
}
