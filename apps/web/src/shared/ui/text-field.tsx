import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/shared/lib/cn";
import { CONTROL_CLASSNAME, CONTROL_ERROR_CLASSNAME, Field } from "@/shared/ui/field";

interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function TextField({ label, error, hint, className, ...props }: TextFieldProps) {
  const id = useId();

  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(CONTROL_CLASSNAME, error && CONTROL_ERROR_CLASSNAME, className)}
        {...props}
      />
    </Field>
  );
}
