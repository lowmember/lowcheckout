import { queryOptions } from "@tanstack/react-query";

import {
  getAnalyticsOverview,
  getSalesSeries,
  getTopCheckouts,
} from "@/features/analytics/api/analytics.api";
import type { AnalyticsRange } from "@/features/analytics/types/analytics";

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: (range: AnalyticsRange) => [...analyticsKeys.all, "overview", range] as const,
  salesSeries: (range: AnalyticsRange) => [...analyticsKeys.all, "sales-series", range] as const,
  topCheckouts: (range: AnalyticsRange) => [...analyticsKeys.all, "top-checkouts", range] as const,
};

export const analyticsQueries = {
  overview: (range: AnalyticsRange) =>
    queryOptions({
      queryKey: analyticsKeys.overview(range),
      queryFn: () => getAnalyticsOverview(range),
    }),

  salesSeries: (range: AnalyticsRange) =>
    queryOptions({
      queryKey: analyticsKeys.salesSeries(range),
      queryFn: () => getSalesSeries(range),
    }),

  topCheckouts: (range: AnalyticsRange) =>
    queryOptions({
      queryKey: analyticsKeys.topCheckouts(range),
      queryFn: () => getTopCheckouts(range),
    }),
};
