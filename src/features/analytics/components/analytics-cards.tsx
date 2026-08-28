import { MetricCard } from "@/features/analytics/components/metric-card";
import { useAnalyticsOverview } from "@/features/analytics/hooks/use-analytics-overview";
import type { AnalyticsRange } from "@/features/analytics/types/analytics";
import { formatCurrency } from "@/shared/lib/format-currency";
import { ReceiptCheckIcon, RevenueUpIcon, TicketIcon } from "@/shared/ui/icons";

interface SalesBreakdownProps {
  approved: number;
  pending: number;
  expired: number;
}

/** Aprovadas, pendentes e expiradas (RF-ANL-03): cor de status sempre com rótulo. */
function SalesBreakdown({ approved, pending, expired }: SalesBreakdownProps) {
  const items = [
    { label: "aprovadas", value: approved, dot: "bg-emerald-500" },
    { label: "pendentes", value: pending, dot: "bg-amber-500" },
    { label: "expiradas", value: expired, dot: "bg-red-500" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${item.dot}`} />
          <span className="font-medium text-neutral-700 tabular-nums">{item.value}</span>
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}

interface AnalyticsCardsProps {
  range: AnalyticsRange;
}

export function AnalyticsCards({ range }: AnalyticsCardsProps) {
  const { overview, isLoadingOverview, hasOverviewError } = useAnalyticsOverview(range);

  const currency = overview?.currency ?? "BRL";
  const revenue = overview?.revenueInCents ?? 0;
  const pendingRevenue = overview?.pendingRevenueInCents ?? 0;
  const averageTicket = overview?.averageTicketInCents ?? 0;
  const approved = overview?.sales.approved ?? 0;
  const pending = overview?.sales.pending ?? 0;
  const expired = overview?.sales.expired ?? 0;

  const totalSales = approved + pending + expired;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label="Faturamento"
        value={formatCurrency(revenue, currency)}
        icon={<RevenueUpIcon className="size-4" />}
        tone={revenue > 0 ? "positive" : "neutral"}
        isLoading={isLoadingOverview}
        support={
          hasOverviewError ? (
            <span className="text-red-600">Não foi possível carregar.</span>
          ) : (
            <span>
              {pendingRevenue > 0
                ? `+ ${formatCurrency(pendingRevenue, currency)} pendentes`
                : "Sem valores pendentes"}
            </span>
          )
        }
      />

      <MetricCard
        label="Vendas"
        value={String(totalSales)}
        icon={<ReceiptCheckIcon className="size-4" />}
        // Sem nenhuma venda não há o que comemorar nem o que alertar: verde num
        // período zerado afirma um sucesso que não aconteceu.
        tone={totalSales === 0 ? "neutral" : expired > approved ? "negative" : "positive"}
        isLoading={isLoadingOverview}
        support={
          hasOverviewError ? (
            <span className="text-red-600">Não foi possível carregar.</span>
          ) : (
            <SalesBreakdown approved={approved} pending={pending} expired={expired} />
          )
        }
      />

      <MetricCard
        label="Ticket médio"
        value={formatCurrency(averageTicket, currency)}
        icon={<TicketIcon className="size-4" />}
        tone="neutral"
        isLoading={isLoadingOverview}
        support={
          hasOverviewError ? (
            <span className="text-red-600">Não foi possível carregar.</span>
          ) : (
            <span>Média por venda aprovada no período</span>
          )
        }
      />
    </div>
  );
}
