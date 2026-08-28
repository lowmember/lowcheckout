import { useId } from "react";

import { cn } from "@/shared/lib/cn";
import { CONTROL_CLASSNAME, CONTROL_ERROR_CLASSNAME, Field } from "@/shared/ui/field";

interface ColorFieldProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function ColorField({ label, value, error, onChange }: ColorFieldProps) {
  const id = useId();
  const isValidColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

  return (
    <Field id={id} label={label} error={error}>
      <div className="flex items-center gap-2">
        <label
          className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-neutral-200 transition-colors hover:border-neutral-300"
          style={{ backgroundColor: isValidColor ? value : "#ffffff" }}
        >
          <span className="sr-only">{`Seletor de cor: ${label}`}</span>
          <input
            type="color"
            value={isValidColor ? value : "#000000"}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>

        <input
          id={id}
          value={value}
          spellCheck={false}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          className={cn(CONTROL_CLASSNAME, "font-mono", error && CONTROL_ERROR_CLASSNAME)}
        />
      </div>
    </Field>
  );
}
