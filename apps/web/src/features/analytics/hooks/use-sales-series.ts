import { useQuery } from "@tanstack/react-query";

import { analyticsQueries } from "@/features/analytics/api/analytics.queries";
import type { AnalyticsRange } from "@/features/analytics/types/analytics";

export function useSalesSeries(range: AnalyticsRange) {
  const { data, isLoading, isError } = useQuery(analyticsQueries.salesSeries(range));

  return {
    salesSeries: data,
    isLoadingSalesSeries: isLoading,
    hasSalesSeriesError: isError,
  };
}
