import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<TValue extends string> {
  options: SegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  className?: string;
}

export function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<TValue>) {
  return (
    <fieldset
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5",
        className,
      )}
    >
      <legend className="sr-only">{ariaLabel}</legend>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-[7px] px-3 font-medium text-xs",
              "transition-[background-color,color,box-shadow] duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1",
              isSelected
                ? "bg-white text-neutral-900 shadow-neutral-900/5 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
