import type { Order } from "@/domain/orders/entities/order.entity";
import type { OrderStatus } from "@/domain/orders/value-objects/order-status";
import type { AccountScopedQuery, Page } from "@/domain/shared/repositories/page";

export interface OrderQuery extends AccountScopedQuery {
  status?: OrderStatus;
  /** Nome ou e-mail do comprador, como digitado na busca da tela de vendas. */
  search?: string;
}

export interface OrdersRepository {
  /**
   * Sem escopo de conta: a tela do comprador (RF-PUB-05/06) conhece o pedido
   * pelo id opaco e não tem sessão. O id é a credencial, como o `public_slug`.
   */
  findById(orderId: string): Promise<Order | null>;
  /**
   * O oposto de `findById`: é a listagem do painel e **sempre** filtra por
   * conta, como as demais listagens — pedido de outra conta não existe para
   * quem consulta.
   */
  findManyByAccount(query: OrderQuery): Promise<Page<Order>>;
  create(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
  /** Pedidos vencidos ainda em `awaiting_payment` — o job de expiração (RF-PAG-03). */
  findExpirable(now: Date, limit: number): Promise<Order[]>;
  /** Histórico que aponta para a oferta — barra a deleção dela. */
  countByOfferId(accountId: string, offerId: string): Promise<number>;
}
