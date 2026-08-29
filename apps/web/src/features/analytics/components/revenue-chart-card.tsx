import { useSalesSeries } from "@/features/analytics/hooks/use-sales-series";
import { describeRange } from "@/features/analytics/lib/period";
import type { AnalyticsRange } from "@/features/analytics/types/analytics";
import { formatCompactCurrency, formatCurrency } from "@/shared/lib/format-currency";
import { formatAxisLabel } from "@/shared/lib/format-date";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { AreaLineChart } from "@/shared/ui/charts/area-line-chart";
import { Skeleton } from "@/shared/ui/skeleton";

interface RevenueChartCardProps {
  range: AnalyticsRange;
}

/** Série única de faturamento (RF-ANL-04): área + linha, sem legenda, um eixo Y. */
export function RevenueChartCard({ range }: RevenueChartCardProps) {
  const { salesSeries, isLoadingSalesSeries, hasSalesSeriesError } = useSalesSeries(range);

  const currency = salesSeries?.currency ?? "BRL";
  const granularity = salesSeries?.granularity ?? "day";
  const points = (salesSeries?.points ?? []).map((point) => ({
    label: formatAxisLabel(point.bucket, granularity),
    value: point.revenueInCents,
  }));

  const total = points.reduce((sum, point) => sum + point.value, 0);

  return (
    <Card className="min-w-0">
      <CardHeader
        title="Faturamento no período"
        description={describeRange(range)}
        action={
          isLoadingSalesSeries ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <p className="font-semibold text-neutral-900 text-xl tracking-tight">
              {formatCurrency(total, currency)}
            </p>
          )
        }
      />

      <CardBody>
        {isLoadingSalesSeries && <Skeleton className="h-[260px] w-full" />}

        {hasSalesSeriesError && !isLoadingSalesSeries && (
          <div className="flex h-[260px] items-center justify-center rounded-lg border border-neutral-200 border-dashed bg-neutral-50/60">
            <p className="text-red-600 text-sm">Não foi possível carregar o faturamento.</p>
          </div>
        )}

        {!isLoadingSalesSeries && !hasSalesSeriesError && (
          <AreaLineChart
            points={points}
            ariaLabel="Faturamento ao longo do período"
            emptyMessage="Sem vendas no período"
            formatValue={(value) => formatCurrency(value, currency)}
            formatAxisValue={(value) => formatCompactCurrency(value, currency)}
          />
        )}
      </CardBody>
    </Card>
  );
}
