import { CheckoutEvent } from "@/domain/analytics/entities/checkout-event.entity";
import type { NewCheckoutEventRow } from "@/infra/persistence/drizzle/schema";

export function toCheckoutEventRow(event: CheckoutEvent): NewCheckoutEventRow {
  const snapshot = event.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    checkoutId: snapshot.checkoutId,
    checkoutOfferId: snapshot.checkoutOfferId,
    orderId: snapshot.orderId,
    type: snapshot.type,
    visitorId: snapshot.visitorId,
    utm: snapshot.utm,
    occurredAt: snapshot.occurredAt,
  };
}
