import { and, eq } from "drizzle-orm";

import type {
  PublicCheckoutRepository,
  PublicCheckoutView,
} from "@/domain/checkouts/repositories/public-checkout.repository";
import type { Database } from "@/infra/persistence/drizzle/database";
import { toAccount } from "@/infra/persistence/drizzle/mappers/account.mapper";
import { toCheckoutOffer } from "@/infra/persistence/drizzle/mappers/checkout-offer.mapper";
import { toCheckoutPixel } from "@/infra/persistence/drizzle/mappers/checkout-pixel.mapper";
import { toCheckout } from "@/infra/persistence/drizzle/mappers/checkout.mapper";
import { toOffer } from "@/infra/persistence/drizzle/mappers/offer.mapper";
import { toProduct } from "@/infra/persistence/drizzle/mappers/product.mapper";
import {
  accounts,
  checkoutOffers,
  checkoutPixels,
  checkouts,
  offers,
  products,
} from "@/infra/persistence/drizzle/schema";

/**
 * Caminho mais quente do sistema: um join resolve vínculo, checkout, oferta,
 * produto e conta pelo `unique(public_slug)`; uma segunda consulta traz os
 * pixels do checkout. Dois round-trips, não seis.
 */
export class DrizzlePublicCheckoutRepository implements PublicCheckoutRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findByPublicSlug(publicSlug: string): Promise<PublicCheckoutView | null> {
    const [row] = await this.db
      .select({
        checkoutOffer: checkoutOffers,
        checkout: checkouts,
        offer: offers,
        product: products,
        account: accounts,
      })
      .from(checkoutOffers)
      .innerJoin(checkouts, eq(checkouts.id, checkoutOffers.checkoutId))
      .innerJoin(offers, eq(offers.id, checkoutOffers.offerId))
      .innerJoin(products, eq(products.id, checkoutOffers.productId))
      .innerJoin(accounts, eq(accounts.id, checkoutOffers.accountId))
      .where(eq(checkoutOffers.publicSlug, publicSlug))
      .limit(1);

    if (!row) {
      return null;
    }

    const pixelRows = await this.db
      .select()
      .from(checkoutPixels)
      .where(
        and(
          eq(checkoutPixels.checkoutId, row.checkout.id),
          eq(checkoutPixels.isEnabled, true),
        ),
      );

    return {
      account: toAccount(row.account),
      checkout: toCheckout(row.checkout),
      checkoutOffer: toCheckoutOffer(row.checkoutOffer),
      offer: toOffer(row.offer),
      product: toProduct(row.product),
      pixels: pixelRows.map(toCheckoutPixel),
    };
  }
}
