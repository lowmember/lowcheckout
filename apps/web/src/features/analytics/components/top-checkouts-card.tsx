import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { useTopCheckouts } from "@/features/analytics/hooks/use-top-checkouts";
import type { AnalyticsRange } from "@/features/analytics/types/analytics";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { HorizontalBar } from "@/shared/ui/charts/horizontal-bar";
import { TrophyIcon } from "@/shared/ui/icons";
import { Skeleton } from "@/shared/ui/skeleton";

interface TopCheckoutsCardProps {
  range: AnalyticsRange;
}

/** Ranking por faturamento (RF-ANL-05): barras horizontais, medida única, uma cor. */
export function TopCheckoutsCard({ range }: TopCheckoutsCardProps) {
  const { topCheckouts, isLoadingTopCheckouts, hasTopCheckoutsError } = useTopCheckouts(range);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const maxRevenue = Math.max(...topCheckouts.map((item) => item.revenueInCents), 0);
  const totalRevenue = topCheckouts.reduce((sum, item) => sum + item.revenueInCents, 0);

  return (
    <Card className="flex h-full min-w-0 flex-col">
      <CardHeader
        title="Checkouts por faturamento"
        description="Os cinco que mais venderam no período."
      />

      <CardBody className="flex-1">
        {isLoadingTopCheckouts && (
          <div className="space-y-4">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        )}

        {hasTopCheckoutsError && !isLoadingTopCheckouts && (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-neutral-200 border-dashed bg-neutral-50/60 px-4 text-center">
            <p className="text-red-600 text-sm">Não foi possível carregar o ranking.</p>
          </div>
        )}

        {!isLoadingTopCheckouts && !hasTopCheckoutsError && topCheckouts.length === 0 && (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-lg border border-neutral-200 border-dashed bg-neutral-50/60 px-4 text-center">
            <TrophyIcon className="size-5 text-neutral-300" />
            <p className="mt-2 text-neutral-500 text-sm">Sem vendas no período</p>
            <p className="mt-0.5 text-neutral-400 text-xs">
              O ranking aparece assim que um checkout faturar.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {topCheckouts.map((checkout, index) => {
            const share = totalRevenue > 0 ? (checkout.revenueInCents / totalRevenue) * 100 : 0;
            const isHovered = hoveredId === checkout.checkoutId;

            return (
              <li key={checkout.checkoutId} className="relative">
                <Link
                  to="/checkouts/$checkoutId"
                  params={{ checkoutId: checkout.checkoutId }}
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                  onMouseEnter={() => setHoveredId(checkout.checkoutId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(checkout.checkoutId)}
                  onBlur={() => setHoveredId(null)}
                >
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate font-medium text-neutral-700 text-sm">
                      <span className="mr-1.5 text-neutral-400 tabular-nums">{index + 1}.</span>
                      {checkout.internalTitle}
                    </p>
                    <p className="shrink-0 font-semibold text-neutral-900 text-sm tabular-nums">
                      {formatCurrency(checkout.revenueInCents)}
                    </p>
                  </div>

                  <HorizontalBar
                    value={checkout.revenueInCents}
                    max={maxRevenue}
                    isMuted={hoveredId !== null && !isHovered}
                  />
                </Link>

                {isHovered && (
                  <div className="pointer-events-none absolute right-0 bottom-full z-10 mb-1.5 animate-fade-in rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 shadow-neutral-900/10 shadow-md">
                    <p className="whitespace-nowrap text-[11px] text-neutral-500 leading-tight">
                      {checkout.ordersCount === 1
                        ? "1 venda aprovada"
                        : `${checkout.ordersCount} vendas aprovadas`}
                    </p>
                    <p className="whitespace-nowrap font-semibold text-neutral-900 text-sm leading-tight">
                      {formatCurrency(checkout.revenueInCents)}
                    </p>
                    <p className="whitespace-nowrap text-[11px] text-neutral-500 leading-tight">
                      {share.toFixed(0)}% do faturamento do topo
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}
