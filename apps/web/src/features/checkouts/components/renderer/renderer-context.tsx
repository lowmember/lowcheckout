import { createContext, type ReactNode, useContext } from "react";

import type { CheckoutFormController } from "@/features/checkouts/types/checkout-buyer";
import type { CheckoutContent } from "@/features/checkouts/types/checkout-content";

export type CheckoutViewport = "desktop" | "mobile";

/** Id do `<form>`: o botão de pagamento é outra seção e submete via `form=`. */
export const CHECKOUT_FORM_ID = "lc-checkout-form";

interface RendererContextValue {
  content: CheckoutContent;
  viewport: CheckoutViewport;
  /** Ausente no preview do editor: os campos ficam inertes. */
  form?: CheckoutFormController;
}

const RendererContext = createContext<RendererContextValue | null>(null);

interface RendererProviderProps extends RendererContextValue {
  children: ReactNode;
}

export function RendererProvider({ children, ...value }: RendererProviderProps) {
  return <RendererContext.Provider value={value}>{children}</RendererContext.Provider>;
}

export function useRendererContext() {
  const value = useContext(RendererContext);

  if (!value) {
    throw new Error("useRendererContext precisa estar dentro de <CheckoutRenderer>.");
  }

  return value;
}
