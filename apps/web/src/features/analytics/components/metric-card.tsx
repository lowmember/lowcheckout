import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export type MetricTone = "positive" | "negative" | "neutral";

const ICON_TONES: Record<MetricTone, string> = {
  positive: "border-emerald-200 bg-emerald-50 text-emerald-600",
  negative: "border-red-200 bg-red-50 text-red-600",
  neutral: "border-neutral-200 bg-neutral-50 text-neutral-500",
};

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  /** O ícone reforça o status da métrica; nunca é enfeite. */
  tone?: MetricTone;
  support?: ReactNode;
  isLoading?: boolean;
}

export function MetricCard({
  label,
  value,
  icon,
  tone = "neutral",
  support,
  isLoading = false,
}: MetricCardProps) {
  return (
    <Card className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="pt-0.5 text-neutral-500 text-sm">{label}</p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg border",
            ICON_TONES[tone],
          )}
        >
          {icon}
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="mt-2.5 h-8 w-32" />
      ) : (
        <p className="mt-1.5 font-semibold text-[28px] text-neutral-900 leading-none tracking-tight">
          {value}
        </p>
      )}

      {support && <div className="mt-2.5 text-neutral-500 text-xs">{support}</div>}
    </Card>
  );
}
