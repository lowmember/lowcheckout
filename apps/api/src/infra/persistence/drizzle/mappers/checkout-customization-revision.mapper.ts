import { CheckoutCustomizationRevision } from "@/domain/checkouts/entities/checkout-customization-revision.entity";
import type { NewCheckoutCustomizationRevisionRow } from "@/infra/persistence/drizzle/schema";

export function toCheckoutCustomizationRevisionRow(
  revision: CheckoutCustomizationRevision,
): NewCheckoutCustomizationRevisionRow {
  const snapshot = revision.toSnapshot();

  return {
    id: snapshot.id,
    checkoutId: snapshot.checkoutId,
    customization: snapshot.customization,
    source: snapshot.source,
    createdByUserId: snapshot.createdByUserId,
    createdAt: snapshot.createdAt,
  };
}
