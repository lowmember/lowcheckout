import type { CheckoutPixelDto } from "@/application/checkouts/dtos/checkout-pixel.dto";
import type { CheckoutPixel } from "@/domain/checkouts/entities/checkout-pixel.entity";

export function toCheckoutPixelDto(pixel: CheckoutPixel): CheckoutPixelDto {
  const snapshot = pixel.toSnapshot();

  return {
    id: snapshot.id,
    checkoutId: snapshot.checkoutId,
    provider: snapshot.provider,
    externalId: snapshot.externalId,
    hasAccessToken: snapshot.accessToken !== null,
    config: snapshot.config,
    isEnabled: snapshot.isEnabled,
    createdAt: snapshot.createdAt.toISOString(),
    updatedAt: snapshot.updatedAt.toISOString(),
  };
}
