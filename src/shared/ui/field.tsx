import type { ReactNode } from "react";

export const CONTROL_CLASSNAME = [
  "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-neutral-900 text-sm outline-none",
  "ring-0 ring-neutral-900/5",
  "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
  "placeholder:text-neutral-400 hover:border-neutral-300",
  "focus:border-neutral-900 focus:ring-4",
  "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400",
].join(" ");

export const CONTROL_ERROR_CLASSNAME =
  "border-red-300 ring-red-500/10 hover:border-red-400 focus:border-red-500";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-medium text-neutral-700 text-sm">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 animate-fade-in text-red-600 text-xs">{error}</p>}
    </div>
  );
}
