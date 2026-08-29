import type { CheckoutDto } from "@/application/checkouts/dtos/checkout.dto";
import type { Checkout } from "@/domain/checkouts/entities/checkout.entity";

export function toCheckoutDto(checkout: Checkout): CheckoutDto {
  const snapshot = checkout.toSnapshot();

  return {
    id: snapshot.id,
    productId: snapshot.productId,
    internalTitle: snapshot.internalTitle,
    displayName: snapshot.displayName,
    bannerDesktopUrl: snapshot.bannerDesktopUrl,
    bannerMobileUrl: snapshot.bannerMobileUrl,
    customization: snapshot.customization,
    status: snapshot.status,
    createdAt: snapshot.createdAt.toISOString(),
    updatedAt: snapshot.updatedAt.toISOString(),
  };
}
