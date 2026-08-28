import type { ComponentProps } from "react";
import { useId } from "react";

import { cn } from "@/shared/lib/cn";
import { CONTROL_CLASSNAME, CONTROL_ERROR_CLASSNAME, Field } from "@/shared/ui/field";

interface TextareaFieldProps extends Omit<ComponentProps<"textarea">, "id"> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextareaField({ label, error, hint, className, ...props }: TextareaFieldProps) {
  const id = useId();

  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(
          CONTROL_CLASSNAME,
          "h-auto min-h-24 py-2.5 leading-relaxed",
          error && CONTROL_ERROR_CLASSNAME,
          className,
        )}
        {...props}
      />
    </Field>
  );
}
