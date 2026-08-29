import { PERIOD_LABELS, PERIODS } from "@/features/analytics/lib/period";
import type { AnalyticsPeriod, AnalyticsRange } from "@/features/analytics/types/analytics";
import { CONTROL_CLASSNAME } from "@/shared/ui/field";
import { SegmentedControl } from "@/shared/ui/segmented-control";

const PERIOD_OPTIONS = PERIODS.map((period) => ({
  value: period,
  label: PERIOD_LABELS[period],
}));

interface PeriodSelectorProps {
  range: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
}

/** Seletor único: controla faturamento, cards, gráfico e ranking (RF-ANL-01). */
export function PeriodSelector({ range, onChange }: PeriodSelectorProps) {
  const hasInvertedDates = Boolean(range.from && range.to && range.from > range.to);

  function handlePeriodChange(period: AnalyticsPeriod) {
    if (period !== "custom") {
      onChange({ period });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    onChange({ period, from: range.from ?? today, to: range.to ?? today });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl
        options={PERIOD_OPTIONS}
        value={range.period}
        onChange={handlePeriodChange}
        ariaLabel="Período das métricas"
      />

      {range.period === "custom" && (
        <div className="flex animate-fade-in flex-wrap items-center gap-2">
          <input
            type="date"
            aria-label="Data inicial"
            value={range.from ?? ""}
            onChange={(event) => onChange({ ...range, from: event.target.value })}
            className={`${CONTROL_CLASSNAME} h-8 w-auto px-2.5 text-xs`}
          />
          <span className="text-neutral-400 text-xs">até</span>
          <input
            type="date"
            aria-label="Data final"
            value={range.to ?? ""}
            onChange={(event) => onChange({ ...range, to: event.target.value })}
            className={`${CONTROL_CLASSNAME} h-8 w-auto px-2.5 text-xs`}
          />
          {hasInvertedDates && (
            <span className="text-red-600 text-xs">A data final não pode ser anterior.</span>
          )}
        </div>
      )}
    </div>
  );
}
