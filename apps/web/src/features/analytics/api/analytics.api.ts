import { toQueryParams } from "@/features/analytics/lib/period";
import type {
  AnalyticsOverview,
  AnalyticsRange,
  SalesSeries,
  TopCheckouts,
} from "@/features/analytics/types/analytics";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/types";

export async function getAnalyticsOverview(range: AnalyticsRange) {
  const response = await httpClient.get<ApiResponse<AnalyticsOverview>>("/analytics/overview", {
    params: toQueryParams(range),
  });
  return response.data.data;
}

export async function getSalesSeries(range: AnalyticsRange) {
  const response = await httpClient.get<ApiResponse<SalesSeries>>("/analytics/sales-series", {
    params: toQueryParams(range),
  });
  return response.data.data;
}

export async function getTopCheckouts(range: AnalyticsRange) {
  const response = await httpClient.get<ApiResponse<TopCheckouts>>("/analytics/top-checkouts", {
    params: { ...toQueryParams(range), limit: 5 },
  });
  return response.data.data.items;
}
