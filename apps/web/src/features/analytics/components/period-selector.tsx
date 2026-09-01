import { useState } from "react";

import { describeRange, PERIOD_LABELS, PERIODS } from "@/features/analytics/lib/period";
import type { AnalyticsPeriod, AnalyticsRange } from "@/features/analytics/types/analytics";
import { todayIsoDate } from "@/shared/lib/date-range";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { SegmentedControl } from "@/shared/ui/segmented-control";

interface PeriodSelectorProps {
  range: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
}

/** Seletor único: controla faturamento, cards, gráfico e ranking (RF-ANL-01). */
export function PeriodSelector({ range, onChange }: PeriodSelectorProps) {
  const [pickerKey, setPickerKey] = useState(0);

  /** Escolhido o intervalo, o rótulo do segmento deixa de ser "Personalizado". */
  const options = PERIODS.map((period) => ({
    value: period,
    label:
      period === "custom" && range.period === "custom" && range.from && range.to
        ? describeRange(range)
        : PERIOD_LABELS[period],
  }));

  function handlePeriodChange(period: AnalyticsPeriod) {
    if (period !== "custom") {
      onChange({ period });
      return;
    }

    const today = todayIsoDate();
    onChange({ period, from: range.from ?? today, to: range.to ?? today });
    // Remonta o calendário para que ele abra já no intervalo corrente.
    setPickerKey((current) => current + 1);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl
        options={options}
        value={range.period}
        onChange={handlePeriodChange}
        ariaLabel="Período das métricas"
      />

      {range.period === "custom" && (
        <DateRangePicker
          key={pickerKey}
          className="animate-fade-in"
          value={{ from: range.from, to: range.to }}
          onApply={({ from, to }) => onChange({ period: "custom", from, to })}
          onClear={() => onChange({ period: "custom", from: undefined, to: undefined })}
        />
      )}
    </div>
  );
}
