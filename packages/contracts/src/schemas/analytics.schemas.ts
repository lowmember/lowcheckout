import { z } from "zod";

import { ANALYTICS_GRANULARITIES } from "../analytics";

/**
 * O seletor da home manda instantes ISO. A ordem das datas e o tamanho máximo do
 * intervalo são regra de negócio e vivem no value object `AnalyticsPeriod`.
 */
const instantSchema = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

const periodSchema = {
  from: instantSchema.nullable().optional(),
  to: instantSchema.nullable().optional(),
};

export const getAnalyticsOverviewSchema = z.object(periodSchema);

export const getSalesSeriesSchema = z.object({
  ...periodSchema,
  granularity: z.enum(ANALYTICS_GRANULARITIES).nullable().optional(),
});

export const getTopCheckoutsSchema = z.object({
  ...periodSchema,
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export type GetAnalyticsOverviewParams = z.input<typeof getAnalyticsOverviewSchema>;
export type GetSalesSeriesParams = z.input<typeof getSalesSeriesSchema>;
export type GetTopCheckoutsParams = z.input<typeof getTopCheckoutsSchema>;
