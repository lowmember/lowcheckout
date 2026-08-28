import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

interface ButtonProps extends ComponentProps<"button"> {
  isLoading?: boolean;
}

export function Button({ className, isLoading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        "group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 font-medium text-sm text-white",
        "transition-[background-color,box-shadow,scale] duration-200 ease-out",
        "hover:bg-neutral-900 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
