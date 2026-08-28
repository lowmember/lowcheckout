import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  AnalyticsCards,
  type AnalyticsPeriod,
  type AnalyticsRange,
  analyticsQueries,
  DEFAULT_PERIOD,
  isAnalyticsPeriod,
  PeriodSelector,
  RevenueChartCard,
  TopCheckoutsCard,
} from "@/features/analytics";
import { useSession } from "@/features/auth";

interface DashboardSearch {
  period?: AnalyticsPeriod;
  from?: string;
  to?: string;
}

export const Route = createFileRoute("/_app/")({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    period: isAnalyticsPeriod(search.period) ? search.period : undefined,
    from: typeof search.from === "string" ? search.from : undefined,
    to: typeof search.to === "string" ? search.to : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    const range: AnalyticsRange = {
      period: deps.period ?? DEFAULT_PERIOD,
      from: deps.from,
      to: deps.to,
    };

    return Promise.all([
      context.queryClient.ensureQueryData(analyticsQueries.overview(range)).catch(() => null),
      context.queryClient.ensureQueryData(analyticsQueries.salesSeries(range)).catch(() => null),
      context.queryClient.ensureQueryData(analyticsQueries.topCheckouts(range)).catch(() => null),
    ]);
  },
  component: DashboardPage,
});

function DashboardPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { session } = useSession();

  const range: AnalyticsRange = {
    period: search.period ?? DEFAULT_PERIOD,
    from: search.from,
    to: search.to,
  };

  const firstName = session?.user.name.split(" ")[0] ?? "por aqui";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-neutral-500 text-sm">Olá, {firstName} 👋</p>
          <h1 className="mt-1 font-semibold text-2xl text-neutral-900 tracking-tight">
            Acompanhe suas vendas
          </h1>
        </div>

        <PeriodSelector
          range={range}
          onChange={(next) =>
            navigate({
              search: { period: next.period, from: next.from, to: next.to },
              replace: true,
            })
          }
        />
      </header>

      <AnalyticsCards range={range} />

      <div className="grid gap-4 xl:grid-cols-[1.85fr_1fr]">
        <RevenueChartCard range={range} />
        <TopCheckoutsCard range={range} />
      </div>
    </div>
  );
}
