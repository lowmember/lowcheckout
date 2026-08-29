import type { CheckoutCustomizationProps } from "@/domain/checkouts/value-objects/checkout-customization";
import type { CheckoutStatus } from "@/domain/checkouts/value-objects/checkout-status";

/** Contrato de saída dos casos de uso — só primitivos, nunca a entidade. */
export interface CheckoutDto {
  id: string;
  /** Imutável após a criação (RF-CHK-03). */
  productId: string;
  internalTitle: string;
  displayName: string;
  bannerDesktopUrl: string | null;
  bannerMobileUrl: string | null;
  customization: CheckoutCustomizationProps;
  status: CheckoutStatus;
  createdAt: string;
  updatedAt: string;
}
