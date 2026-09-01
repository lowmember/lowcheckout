import type { ReactNode } from "react";

import { cn } from "../internal/cn";
import { buildThemeVariables } from "../lib/checkout-theme";
import type { CheckoutTheme } from "../types/checkout-schema";

interface CheckoutThemeShellProps {
  theme: CheckoutTheme;
  children: ReactNode;
  className?: string;
}

/**
 * Aplica o tema como custom properties e abre o container query.
 *
 * Usado pelo renderer e pelas telas de PIX e obrigado, para que o comprador
 * atravesse todo o fluxo dentro do mesmo tema, sem salto visual.
 */
export function CheckoutThemeShell({ theme, children, className }: CheckoutThemeShellProps) {
  return (
    <div
      className={cn("@container w-full", className)}
      style={{
        ...buildThemeVariables(theme),
        backgroundColor: "var(--lc-background)",
        fontFamily: "var(--lc-font)",
      }}
    >
      {children}
    </div>
  );
}
