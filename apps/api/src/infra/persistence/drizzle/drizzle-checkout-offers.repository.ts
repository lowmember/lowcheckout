import { and, count, eq, max } from "drizzle-orm";

import type { CheckoutOffer } from "@/domain/checkouts/entities/checkout-offer.entity";
import type { CheckoutOffersRepository } from "@/domain/checkouts/repositories/checkout-offers.repository";
import type { Database } from "@/infra/persistence/drizzle/database";
import {
  toCheckoutOffer,
  toCheckoutOfferRow,
} from "@/infra/persistence/drizzle/mappers/checkout-offer.mapper";
import { checkoutOffers } from "@/infra/persistence/drizzle/schema";

export class DrizzleCheckoutOffersRepository implements CheckoutOffersRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findByCheckout(accountId: string, checkoutId: string): Promise<CheckoutOffer[]> {
    const rows = await this.db
      .select()
      .from(checkoutOffers)
      .where(
        and(
          eq(checkoutOffers.accountId, accountId),
          eq(checkoutOffers.checkoutId, checkoutId),
        ),
      )
      .orderBy(checkoutOffers.position);

    return rows.map(toCheckoutOffer);
  }

  async findByCheckoutAndOffer(
    accountId: string,
    checkoutId: string,
    offerId: string,
  ): Promise<CheckoutOffer | null> {
    const [row] = await this.db
      .select()
      .from(checkoutOffers)
      .where(
        and(
          eq(checkoutOffers.accountId, accountId),
          eq(checkoutOffers.checkoutId, checkoutId),
          eq(checkoutOffers.offerId, offerId),
        ),
      )
      .limit(1);

    return row ? toCheckoutOffer(row) : null;
  }

  /** Sem escopo de conta de propósito: o slug é único globalmente. */
  async existsByPublicSlug(publicSlug: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: checkoutOffers.id })
      .from(checkoutOffers)
      .where(eq(checkoutOffers.publicSlug, publicSlug))
      .limit(1);

    return row !== undefined;
  }

  async nextPosition(accountId: string, checkoutId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: max(checkoutOffers.position) })
      .from(checkoutOffers)
      .where(
        and(
          eq(checkoutOffers.accountId, accountId),
          eq(checkoutOffers.checkoutId, checkoutId),
        ),
      );

    return row?.value === null || row?.value === undefined ? 0 : row.value + 1;
  }

  async countByOfferId(accountId: string, offerId: string): Promise<number> {
    const [totals] = await this.db
      .select({ value: count() })
      .from(checkoutOffers)
      .where(and(eq(checkoutOffers.accountId, accountId), eq(checkoutOffers.offerId, offerId)));

    return totals?.value ?? 0;
  }

  async create(checkoutOffer: CheckoutOffer): Promise<void> {
    await this.db.insert(checkoutOffers).values(toCheckoutOfferRow(checkoutOffer));
  }

  async delete(accountId: string, checkoutId: string, offerId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(checkoutOffers)
      .where(
        and(
          eq(checkoutOffers.accountId, accountId),
          eq(checkoutOffers.checkoutId, checkoutId),
          eq(checkoutOffers.offerId, offerId),
        ),
      )
      .returning({ id: checkoutOffers.id });

    return deleted.length > 0;
  }
}
