import type { CheckoutEvent } from "@/domain/analytics/entities/checkout-event.entity";

/** Append-only. A escrita nunca pode derrubar o fluxo de compra que a originou. */
export interface CheckoutEventsRepository {
  create(event: CheckoutEvent): Promise<void>;
}
