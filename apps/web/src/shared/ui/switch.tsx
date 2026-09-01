import { cn } from "@/shared/lib/cn";

interface SwitchProps {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  /** Rótulo acessível — o texto visível fica a cargo de quem usa o componente. */
  ariaLabel: string;
  isDisabled?: boolean;
  className?: string;
}

/** Interruptor binário. Para três ou mais estados use `SegmentedControl`. */
export function Switch({ isChecked, onChange, ariaLabel, isDisabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={ariaLabel}
      disabled={isDisabled}
      onClick={() => onChange(!isChecked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5",
        "transition-colors duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isChecked ? "bg-emerald-600" : "bg-neutral-300",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-4 rounded-full bg-white shadow-neutral-900/20 shadow-sm",
          "transition-transform duration-200 ease-out",
          isChecked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}
