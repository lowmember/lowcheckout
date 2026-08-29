import { Checkout } from "@/domain/checkouts/entities/checkout.entity";
import { toCheckoutStatus } from "@/domain/checkouts/value-objects/checkout-status";
import type { CheckoutRow, NewCheckoutRow } from "@/infra/persistence/drizzle/schema";

export function toCheckout(row: CheckoutRow): Checkout {
  return Checkout.restore({
    id: row.id,
    accountId: row.accountId,
    productId: row.productId,
    internalTitle: row.internalTitle,
    displayName: row.displayName,
    bannerDesktopUrl: row.bannerDesktopUrl,
    bannerMobileUrl: row.bannerMobileUrl,
    customization: row.customization,
    status: toCheckoutStatus(row.status),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toCheckoutRow(checkout: Checkout): NewCheckoutRow {
  const snapshot = checkout.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    productId: snapshot.productId,
    internalTitle: snapshot.internalTitle,
    displayName: snapshot.displayName,
    bannerDesktopUrl: snapshot.bannerDesktopUrl,
    bannerMobileUrl: snapshot.bannerMobileUrl,
    customization: snapshot.customization,
    status: snapshot.status,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}
