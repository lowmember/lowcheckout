import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: "bg-neutral-800 text-white hover:bg-neutral-900 focus-visible:ring-neutral-900",
  secondary:
    "border border-neutral-200 bg-white text-neutral-700 shadow-neutral-900/5 shadow-sm hover:border-neutral-300 hover:text-neutral-900 focus-visible:ring-neutral-900",
  ghost:
    "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-900",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

const SIZE_CLASSNAMES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3 text-sm",
  md: "h-11 gap-2 px-4 text-sm",
};

interface ButtonProps extends ComponentProps<"button"> {
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  isLoading,
  disabled,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        "group inline-flex items-center justify-center rounded-lg font-medium",
        "transition-[background-color,border-color,color,box-shadow,scale] duration-200 ease-out",
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        SIZE_CLASSNAMES[size],
        VARIANT_CLASSNAMES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
