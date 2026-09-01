import type { CheckoutSectionType } from "@lowcheckout/checkout-renderer";
import type { ReactNode } from "react";

import {
  CartIcon,
  HelpCircleIcon,
  ImageIcon,
  LayersIcon,
  ListDetailsIcon,
  PackageIcon,
  QuoteIcon,
  ShieldCheckIcon,
  TicketIcon,
} from "@/shared/ui/icons";

/**
 * Ícone por tipo de seção. Vive no builder, e não no registry, para manter o
 * catálogo de seções livre de JSX — ele precisa ser serializável.
 */
export const SECTION_ICONS: Record<CheckoutSectionType, ReactNode> = {
  hero: <ImageIcon className="size-4" />,
  product: <PackageIcon className="size-4" />,
  benefits: <ListDetailsIcon className="size-4" />,
  "social-proof": <QuoteIcon className="size-4" />,
  guarantee: <ShieldCheckIcon className="size-4" />,
  faq: <HelpCircleIcon className="size-4" />,
  "checkout-form": <TicketIcon className="size-4" />,
  "payment-cta": <CartIcon className="size-4" />,
  footer: <LayersIcon className="size-4" />,
};
