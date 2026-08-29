import { DefaultGetAnalyticsOverviewUseCase } from "@/application/analytics/use-cases/get-analytics-overview.usecase";
import { DefaultGetSalesSeriesUseCase } from "@/application/analytics/use-cases/get-sales-series.usecase";
import { DefaultGetTopCheckoutsUseCase } from "@/application/analytics/use-cases/get-top-checkouts.usecase";
import { getContainer } from "@/infra/di/container";
import { withPanelAccess } from "@/infra/di/factories/with-account-guard";
import { withErrorHandling } from "@/infra/di/factories/with-error-handling";
import {
  getAnalyticsOverviewSchema,
  getSalesSeriesSchema,
  getTopCheckoutsSchema,
} from "@/infra/validation/zod/schemas/analytics.schemas";
import { ZodValidator } from "@/infra/validation/zod/zod-validator.adapter";
import { GetAnalyticsOverviewController } from "@/presentation/http/controllers/analytics/get-analytics-overview.controller";
import { GetSalesSeriesController } from "@/presentation/http/controllers/analytics/get-sales-series.controller";
import { GetTopCheckoutsController } from "@/presentation/http/controllers/analytics/get-top-checkouts.controller";

export function makeGetAnalyticsOverviewController() {
  const { orderAnalyticsRepository, clock } = getContainer();

  return withErrorHandling(
    new GetAnalyticsOverviewController(
      withPanelAccess(new DefaultGetAnalyticsOverviewUseCase(orderAnalyticsRepository, clock)),
      new ZodValidator(getAnalyticsOverviewSchema),
    ),
  );
}

export function makeGetSalesSeriesController() {
  const { orderAnalyticsRepository, clock } = getContainer();

  return withErrorHandling(
    new GetSalesSeriesController(
      withPanelAccess(new DefaultGetSalesSeriesUseCase(orderAnalyticsRepository, clock)),
      new ZodValidator(getSalesSeriesSchema),
    ),
  );
}

export function makeGetTopCheckoutsController() {
  const { orderAnalyticsRepository, clock } = getContainer();

  return withErrorHandling(
    new GetTopCheckoutsController(
      withPanelAccess(new DefaultGetTopCheckoutsUseCase(orderAnalyticsRepository, clock)),
      new ZodValidator(getTopCheckoutsSchema),
    ),
  );
}
