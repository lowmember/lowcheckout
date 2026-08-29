import type { OrderEvent } from "@/domain/orders/entities/order-event.entity";

/** Append-only: eventos de pedido nascem e são lidos, nunca são editados. */
export interface OrderEventsRepository {
  create(event: OrderEvent): Promise<void>;
}
