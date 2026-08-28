import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export interface TabItem<TValue extends string> {
  value: TValue;
  label: string;
  icon?: ReactNode;
}

interface TabsProps<TValue extends string> {
  items: TabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  className?: string;
}

export function Tabs<TValue extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: TabsProps<TValue>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex items-center gap-1 border-neutral-200 border-b", className)}
    >
      {items.map((item) => {
        const isSelected = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(item.value)}
            className={cn(
              "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-medium text-sm",
              "transition-[color,border-color] duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
              isSelected
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-800",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
