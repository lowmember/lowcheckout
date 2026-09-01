import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import {
  addMonths,
  buildMonthGrid,
  type CalendarDay,
  formatIsoDateToBr,
  parseIsoDate,
  todayIsoDate,
  toIsoDate,
} from "@/shared/lib/date-range";
import { Button } from "@/shared/ui/button";
import { ChevronDownIcon, ChevronRightIcon } from "@/shared/ui/icons";

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const MONTH_LABELS = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
];

/** Faixa de anos oferecida no seletor: passado recente e o ano seguinte. */
function buildYearOptions(reference: number) {
  return Array.from({ length: 8 }, (_, index) => reference - 6 + index);
}

export interface DateRangeValue {
  from?: string;
  to?: string;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onApply: (range: Required<DateRangeValue>) => void;
  onClear?: () => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * Calendário de dois meses para escolher um intervalo. A seleção só sai daqui em
 * "Aplicar": enquanto o usuário clica nos dias, a mudança é local — o painel não
 * recarrega métricas a cada clique.
 */
export function DateRangePicker({
  value,
  onApply,
  onClear,
  ariaLabel = "Selecione um período",
  className,
}: DateRangePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>(value);

  const anchor = parseIsoDate(draft.from ?? value.from ?? todayIsoDate()) ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: 1,
  };
  const [visibleMonth, setVisibleMonth] = useState({ year: anchor.year, month: anchor.month });

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function open() {
    setDraft(value);

    const start = parseIsoDate(value.from ?? todayIsoDate());
    if (start) setVisibleMonth({ year: start.year, month: start.month });

    setIsOpen(true);
  }

  /** Primeiro clique abre um intervalo novo; o segundo o fecha, ordenando as pontas. */
  function selectDay(day: CalendarDay) {
    const iso = toIsoDate(day);

    setDraft((current) => {
      if (!current.from || current.to) return { from: iso };
      return current.from <= iso
        ? { from: current.from, to: iso }
        : { from: iso, to: current.from };
    });
  }

  const secondMonth = addMonths(visibleMonth.year, visibleMonth.month, 1);
  const label =
    value.from && value.to
      ? `${formatIsoDateToBr(value.from)} - ${formatIsoDateToBr(value.to)}`
      : ariaLabel;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        className={cn(
          "inline-flex h-8 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 font-medium text-neutral-700 text-xs",
          "transition-colors duration-200 ease-out hover:border-neutral-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1",
          isOpen && "border-neutral-900",
        )}
      >
        {label}
        <ChevronDownIcon
          className={cn(
            "size-3.5 text-neutral-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={ariaLabel}
          className="absolute right-0 z-40 mt-2 w-max animate-pop-in origin-top-right rounded-xl border border-neutral-200 bg-white p-4 shadow-neutral-900/10 shadow-lg"
        >
          <div className="flex flex-col gap-6 sm:flex-row">
            <MonthCalendar
              year={visibleMonth.year}
              month={visibleMonth.month}
              draft={draft}
              canGoBack
              onGoBack={() => setVisibleMonth(addMonths(visibleMonth.year, visibleMonth.month, -1))}
              onChangeMonth={(month) => setVisibleMonth((current) => ({ ...current, month }))}
              onChangeYear={(year) => setVisibleMonth((current) => ({ ...current, year }))}
              onSelectDay={selectDay}
            />

            <MonthCalendar
              year={secondMonth.year}
              month={secondMonth.month}
              draft={draft}
              canGoForward
              onGoForward={() =>
                setVisibleMonth(addMonths(visibleMonth.year, visibleMonth.month, 1))
              }
              onChangeMonth={(month) => setVisibleMonth(addMonths(secondMonth.year, month, -1))}
              onChangeYear={(year) => setVisibleMonth(addMonths(year, secondMonth.month, -1))}
              onSelectDay={selectDay}
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-neutral-100 border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft({});
                onClear?.();
              }}
            >
              Limpar
            </Button>
            <Button
              size="sm"
              disabled={!draft.from || !draft.to}
              onClick={() => {
                if (!draft.from || !draft.to) return;

                onApply({ from: draft.from, to: draft.to });
                setIsOpen(false);
              }}
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MonthCalendarProps {
  year: number;
  month: number;
  draft: DateRangeValue;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
  onSelectDay: (day: CalendarDay) => void;
}

function MonthCalendar({
  year,
  month,
  draft,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onChangeMonth,
  onChangeYear,
  onSelectDay,
}: MonthCalendarProps) {
  const days = buildMonthGrid(year, month);

  return (
    <div className="w-[236px]">
      <div className="mb-3 flex items-center justify-between gap-1">
        <NavArrow direction="previous" isVisible={Boolean(canGoBack)} onClick={onGoBack} />

        <div className="flex items-center gap-1.5">
          <SelectControl
            ariaLabel="Mês"
            value={String(month)}
            options={MONTH_LABELS.map((label, index) => ({ value: String(index), label }))}
            onChange={(next) => onChangeMonth(Number(next))}
          />
          <SelectControl
            ariaLabel="Ano"
            value={String(year)}
            options={buildYearOptions(new Date().getFullYear()).map((option) => ({
              value: String(option),
              label: String(option),
            }))}
            onChange={(next) => onChangeYear(Number(next))}
          />
        </div>

        <NavArrow direction="next" isVisible={Boolean(canGoForward)} onClick={onGoForward} />
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((weekday) => (
          <span
            key={weekday}
            className="flex h-7 items-center justify-center text-[11px] text-neutral-400"
          >
            {weekday}
          </span>
        ))}

        {days.map((day) => {
          const iso = toIsoDate(day);
          const isOutside = day.month !== month;
          const isStart = iso === draft.from;
          const isEnd = iso === draft.to;
          const isInRange = Boolean(draft.from && draft.to && iso > draft.from && iso < draft.to);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex h-8 items-center justify-center rounded-md text-xs tabular-nums",
                "transition-colors duration-150 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
                isOutside ? "text-neutral-300" : "text-neutral-700",
                isInRange && "bg-neutral-100 text-neutral-900",
                (isStart || isEnd) && "bg-neutral-900 font-medium text-white",
                !isStart && !isEnd && !isInRange && "hover:bg-neutral-100",
              )}
            >
              {day.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface NavArrowProps {
  direction: "previous" | "next";
  isVisible: boolean;
  onClick?: () => void;
}

function NavArrow({ direction, isVisible, onClick }: NavArrowProps) {
  if (!isVisible) return <span className="size-7" />;

  return (
    <button
      type="button"
      aria-label={direction === "previous" ? "Mês anterior" : "Próximo mês"}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
    >
      <ChevronRightIcon className={cn("size-4", direction === "previous" && "rotate-180")} />
    </button>
  );
}

interface SelectControlProps {
  ariaLabel: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectControl({ ariaLabel, value, options, onChange }: SelectControlProps) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-7 appearance-none rounded-md border border-neutral-200 bg-white py-0 pr-6 pl-2.5 font-medium text-neutral-800 text-xs",
          "transition-colors duration-200 ease-out hover:border-neutral-300",
          "focus:border-neutral-900 focus:outline-none",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1.5 right-1.5 size-3.5 text-neutral-400" />
    </div>
  );
}
