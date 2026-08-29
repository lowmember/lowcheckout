import { and, eq, inArray } from "drizzle-orm";

import type { CheckoutPixel } from "@/domain/checkouts/entities/checkout-pixel.entity";
import type { CheckoutPixelsRepository } from "@/domain/checkouts/repositories/checkout-pixels.repository";
import type { PixelProvider } from "@/domain/checkouts/value-objects/pixel-provider";
import type { Database } from "@/infra/persistence/drizzle/database";
import {
  toCheckoutPixel,
  toCheckoutPixelRow,
} from "@/infra/persistence/drizzle/mappers/checkout-pixel.mapper";
import { checkoutPixels } from "@/infra/persistence/drizzle/schema";

export class DrizzleCheckoutPixelsRepository implements CheckoutPixelsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findByCheckout(accountId: string, checkoutId: string): Promise<CheckoutPixel[]> {
    const rows = await this.db
      .select()
      .from(checkoutPixels)
      .where(
        and(eq(checkoutPixels.accountId, accountId), eq(checkoutPixels.checkoutId, checkoutId)),
      )
      .orderBy(checkoutPixels.provider);

    return rows.map(toCheckoutPixel);
  }

  async create(pixel: CheckoutPixel): Promise<void> {
    await this.db.insert(checkoutPixels).values(toCheckoutPixelRow(pixel));
  }

  async update(pixel: CheckoutPixel): Promise<void> {
    const row = toCheckoutPixelRow(pixel);

    await this.db
      .update(checkoutPixels)
      .set(row)
      .where(and(eq(checkoutPixels.accountId, row.accountId), eq(checkoutPixels.id, row.id)));
  }

  async deleteByProviders(
    accountId: string,
    checkoutId: string,
    providers: readonly PixelProvider[],
  ): Promise<void> {
    if (providers.length === 0) {
      return;
    }

    await this.db
      .delete(checkoutPixels)
      .where(
        and(
          eq(checkoutPixels.accountId, accountId),
          eq(checkoutPixels.checkoutId, checkoutId),
          inArray(checkoutPixels.provider, [...providers]),
        ),
      );
  }
}
