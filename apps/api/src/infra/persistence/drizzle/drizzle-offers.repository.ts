import { and, count, desc, eq, inArray, isNull, ne, type SQL } from "drizzle-orm";

import type { Offer } from "@/domain/offers/entities/offer.entity";
import type { OfferQuery, OffersRepository } from "@/domain/offers/repositories/offers.repository";
import type { Page } from "@/domain/shared/repositories/page";
import type { Database } from "@/infra/persistence/drizzle/database";
import { toOffer, toOfferRow } from "@/infra/persistence/drizzle/mappers/offer.mapper";
import { offers } from "@/infra/persistence/drizzle/schema";

export class DrizzleOffersRepository implements OffersRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findMany(query: OfferQuery): Promise<Page<Offer>> {
    const where = this.buildFilters(query);

    const [rows, [totals]] = await Promise.all([
      this.db
        .select()
        .from(offers)
        .where(where)
        .orderBy(desc(offers.createdAt))
        .limit(query.perPage)
        .offset((query.page - 1) * query.perPage),
      this.db.select({ value: count() }).from(offers).where(where),
    ]);

    return { items: rows.map(toOffer), total: totals?.value ?? 0 };
  }

  async findById(accountId: string, offerId: string): Promise<Offer | null> {
    const [row] = await this.db
      .select()
      .from(offers)
      .where(and(eq(offers.accountId, accountId), eq(offers.id, offerId)))
      .limit(1);

    return row ? toOffer(row) : null;
  }

  async create(offer: Offer): Promise<void> {
    await this.db.insert(offers).values(toOfferRow(offer));
  }

  async update(offer: Offer): Promise<void> {
    const row = toOfferRow(offer);

    await this.db
      .update(offers)
      .set(row)
      .where(and(eq(offers.accountId, row.accountId), eq(offers.id, row.id)));
  }

  async findByIds(accountId: string, offerIds: readonly string[]): Promise<Map<string, Offer>> {
    if (offerIds.length === 0) {
      return new Map();
    }

    const rows = await this.db
      .select()
      .from(offers)
      .where(and(eq(offers.accountId, accountId), inArray(offers.id, [...offerIds])));

    return new Map(rows.map((row) => [row.id, toOffer(row)]));
  }

  async countByProductIds(
    accountId: string,
    productIds: readonly string[],
  ): Promise<Map<string, number>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const rows = await this.db
      .select({ productId: offers.productId, value: count() })
      .from(offers)
      .where(and(eq(offers.accountId, accountId), inArray(offers.productId, [...productIds])))
      .groupBy(offers.productId);

    return new Map(rows.map((row) => [row.productId, row.value]));
  }

  /** Ofertas ativas que hoje resolvem o entregável pelo padrão do produto — invariante (c). */
  async countActiveRelyingOnProductFallback(
    accountId: string,
    productId: string,
    ignoredOfferId?: string,
  ): Promise<number> {
    const filters: SQL[] = [
      eq(offers.accountId, accountId),
      eq(offers.productId, productId),
      eq(offers.status, "active"),
      isNull(offers.deliveryUrl),
    ];

    if (ignoredOfferId) {
      filters.push(ne(offers.id, ignoredOfferId));
    }

    const [totals] = await this.db
      .select({ value: count() })
      .from(offers)
      .where(and(...filters));

    return totals?.value ?? 0;
  }

  private buildFilters(query: OfferQuery): SQL | undefined {
    const filters: SQL[] = [
      eq(offers.accountId, query.accountId),
      eq(offers.productId, query.productId),
    ];

    if (query.status) {
      filters.push(eq(offers.status, query.status));
    }

    return and(...filters);
  }
}
