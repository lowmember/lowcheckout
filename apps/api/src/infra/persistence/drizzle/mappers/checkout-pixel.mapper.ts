import { CheckoutPixel } from "@/domain/checkouts/entities/checkout-pixel.entity";
import type { CheckoutPixelRow, NewCheckoutPixelRow } from "@/infra/persistence/drizzle/schema";

export function toCheckoutPixel(row: CheckoutPixelRow): CheckoutPixel {
  return CheckoutPixel.restore({
    id: row.id,
    accountId: row.accountId,
    checkoutId: row.checkoutId,
    provider: row.provider,
    externalId: row.externalId,
    accessToken: row.accessToken,
    config: row.config,
    isEnabled: row.isEnabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toCheckoutPixelRow(pixel: CheckoutPixel): NewCheckoutPixelRow {
  const snapshot = pixel.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    checkoutId: snapshot.checkoutId,
    provider: snapshot.provider,
    externalId: snapshot.externalId,
    accessToken: snapshot.accessToken,
    config: snapshot.config,
    isEnabled: snapshot.isEnabled,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}
