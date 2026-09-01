import type { Offer } from "@/domain/offers/entities/offer.entity";
import type { OfferStatus } from "@/domain/offers/value-objects/offer-status";
import type { AccountScopedQuery, Page } from "@/domain/shared/repositories/page";

export interface OfferQuery extends AccountScopedQuery {
  productId: string;
  status?: OfferStatus;
}

/**
 * Porta de persistência de ofertas. Além do CRUD, publica as duas contagens que
 * sustentam regras de outros agregados: a quantidade de ofertas por produto
 * (RF-PROD-02) e as que dependem do fallback do produto (invariante (c)).
 */
export interface OffersRepository {
  findMany(query: OfferQuery): Promise<Page<Offer>>;
  findById(accountId: string, offerId: string): Promise<Offer | null>;
  create(offer: Offer): Promise<void>;
  update(offer: Offer): Promise<void>;
  delete(accountId: string, offerId: string): Promise<boolean>;
  /** Carga em lote das ofertas vinculadas a um checkout, indexada por id. */
  findByIds(accountId: string, offerIds: readonly string[]): Promise<Map<string, Offer>>;
  countByProductIds(accountId: string, productIds: readonly string[]): Promise<Map<string, number>>;
  countActiveRelyingOnProductFallback(
    accountId: string,
    productId: string,
    ignoredOfferId?: string,
  ): Promise<number>;
}
