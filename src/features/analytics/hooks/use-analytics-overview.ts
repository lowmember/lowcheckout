import { useQuery } from "@tanstack/react-query";

import { analyticsQueries } from "@/features/analytics/api/analytics.queries";
import type { AnalyticsRange } from "@/features/analytics/types/analytics";

export function useAnalyticsOverview(range: AnalyticsRange) {
  const { data, isLoading, isError } = useQuery(analyticsQueries.overview(range));

  return {
    overview: data,
    isLoadingOverview: isLoading,
    hasOverviewError: isError,
  };
}
