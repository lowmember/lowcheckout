import type { Checkout } from "@/domain/checkouts/entities/checkout.entity";
import type { CheckoutStatus } from "@/domain/checkouts/value-objects/checkout-status";
import type { AccountScopedQuery, Page } from "@/domain/shared/repositories/page";

export interface CheckoutQuery extends AccountScopedQuery {
  status?: CheckoutStatus;
  productId?: string;
  search?: string;
}

/**
 * Porta de persistência de checkouts. O domínio declara o contrato;
 * a infraestrutura escolhe a tecnologia (Drizzle/Postgres, memória, etc.).
 */
export interface CheckoutsRepository {
  findMany(query: CheckoutQuery): Promise<Page<Checkout>>;
  findById(accountId: string, checkoutId: string): Promise<Checkout | null>;
  create(checkout: Checkout): Promise<void>;
  update(checkout: Checkout): Promise<void>;
  delete(accountId: string, checkoutId: string): Promise<boolean>;
  /** Sustenta a regra de deleção de produto: quantos checkouts ainda o referenciam. */
  countByProductIds(accountId: string, productIds: readonly string[]): Promise<Map<string, number>>;
}
