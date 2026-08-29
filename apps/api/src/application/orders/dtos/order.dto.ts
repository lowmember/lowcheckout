import type { OrderStatus } from "@/domain/orders/value-objects/order-status";

/**
 * Contrato de saída dos casos de uso — só primitivos, nunca a entidade.
 *
 * Os campos `*Snapshot` são os dados **congelados na compra** (RF-PAG-06), não
 * o estado atual do produto ou da oferta: é isso que faz a tela de vendas
 * continuar correta depois de o lojista editar o catálogo.
 *
 * `deliveryUrlSnapshot` fica de fora de propósito — a listagem do painel não
 * precisa distribuir o acesso ao entregável.
 */
export interface OrderDto {
  id: string;
  checkoutId: string;
  offerId: string;
  productId: string;
  status: OrderStatus;
  amountInCents: number;
  currency: string;
  productNameSnapshot: string;
  offerNameSnapshot: string;
  buyerName: string;
  buyerEmail: string;
  /** Só dígitos. */
  buyerDocument: string;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
}
