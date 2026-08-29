import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";
import type { Payment } from "@/domain/payments/entities/payment.entity";

export interface PaymentsRepository {
  /** Correlação webhook ↔ pedido: é sempre pelo identificador da cobrança (RF-PAG-04). */
  findByExternalChargeId(
    provider: GatewayProvider,
    externalChargeId: string,
  ): Promise<Payment | null>;
  findLatestByOrder(orderId: string): Promise<Payment | null>;
  create(payment: Payment): Promise<void>;
  update(payment: Payment): Promise<void>;
}
