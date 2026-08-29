import { and, desc, eq } from "drizzle-orm";

import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";
import type { PaymentWebhookEvent } from "@/domain/payments/entities/payment-webhook-event.entity";
import type { Payment } from "@/domain/payments/entities/payment.entity";
import type { PaymentWebhookEventsRepository } from "@/domain/payments/repositories/payment-webhook-events.repository";
import type { PaymentsRepository } from "@/domain/payments/repositories/payments.repository";
import type { Database } from "@/infra/persistence/drizzle/database";
import {
  toPayment,
  toPaymentRow,
  toPaymentWebhookEventRow,
} from "@/infra/persistence/drizzle/mappers/payment.mapper";
import { paymentWebhookEvents, payments } from "@/infra/persistence/drizzle/schema";

export class DrizzlePaymentsRepository implements PaymentsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findByExternalChargeId(
    provider: GatewayProvider,
    externalChargeId: string,
  ): Promise<Payment | null> {
    const [row] = await this.db
      .select()
      .from(payments)
      .where(
        and(eq(payments.provider, provider), eq(payments.externalChargeId, externalChargeId)),
      )
      .limit(1);

    return row ? toPayment(row) : null;
  }

  async findLatestByOrder(orderId: string): Promise<Payment | null> {
    const [row] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .orderBy(desc(payments.createdAt))
      .limit(1);

    return row ? toPayment(row) : null;
  }

  async create(payment: Payment): Promise<void> {
    await this.db.insert(payments).values(toPaymentRow(payment));
  }

  async update(payment: Payment): Promise<void> {
    const row = toPaymentRow(payment);

    await this.db.update(payments).set(row).where(eq(payments.id, row.id));
  }
}

export class DrizzlePaymentWebhookEventsRepository implements PaymentWebhookEventsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * `on conflict do nothing` sobre o `unique(provider, external_event_id)`: a
   * reentrega do gateway não insere nada e o `returning` vem vazio. É esse
   * retorno vazio que faz a idempotência (RF-GTW-02) — sem consulta prévia e
   * sem janela de corrida entre duas entregas simultâneas.
   */
  async createIfNew(event: PaymentWebhookEvent): Promise<boolean> {
    const inserted = await this.db
      .insert(paymentWebhookEvents)
      .values(toPaymentWebhookEventRow(event))
      .onConflictDoNothing({
        target: [paymentWebhookEvents.provider, paymentWebhookEvents.externalEventId],
      })
      .returning({ id: paymentWebhookEvents.id });

    return inserted.length > 0;
  }

  async update(event: PaymentWebhookEvent): Promise<void> {
    const row = toPaymentWebhookEventRow(event);

    await this.db
      .update(paymentWebhookEvents)
      .set(row)
      .where(eq(paymentWebhookEvents.id, row.id));
  }
}
