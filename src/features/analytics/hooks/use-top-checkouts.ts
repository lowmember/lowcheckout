import { useQuery } from "@tanstack/react-query";

import { analyticsQueries } from "@/features/analytics/api/analytics.queries";
import type { AnalyticsRange } from "@/features/analytics/types/analytics";

export function useTopCheckouts(range: AnalyticsRange) {
  const { data, isLoading, isError } = useQuery(analyticsQueries.topCheckouts(range));

  return {
    topCheckouts: data ?? [],
    isLoadingTopCheckouts: isLoading,
    hasTopCheckoutsError: isError,
  };
}
