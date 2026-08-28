import type { ComponentProps } from "react";
import { useId } from "react";

import { cn } from "@/shared/lib/cn";
import { CONTROL_CLASSNAME, CONTROL_ERROR_CLASSNAME, Field } from "@/shared/ui/field";
import { ChevronDownIcon } from "@/shared/ui/icons";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<ComponentProps<"select">, "id" | "children"> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export function SelectField({ label, options, error, className, ...props }: SelectFieldProps) {
  const id = useId();

  return (
    <Field id={id} label={label} error={error}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          className={cn(
            CONTROL_CLASSNAME,
            "peer cursor-pointer appearance-none pr-10",
            error && CONTROL_ERROR_CLASSNAME,
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className={cn(
            "pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-neutral-500",
            "transition-[rotate,color] duration-200 ease-out",
            "peer-hover:text-neutral-700 peer-focus:rotate-180 peer-focus:text-neutral-900",
          )}
        />
      </div>
    </Field>
  );
}
