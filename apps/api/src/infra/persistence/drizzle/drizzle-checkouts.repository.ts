import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import type { Checkout } from "@/domain/checkouts/entities/checkout.entity";
import type {
  CheckoutQuery,
  CheckoutsRepository,
} from "@/domain/checkouts/repositories/checkouts.repository";
import type { Page } from "@/domain/shared/repositories/page";
import type { Database } from "@/infra/persistence/drizzle/database";
import { toCheckout, toCheckoutRow } from "@/infra/persistence/drizzle/mappers/checkout.mapper";
import { checkouts } from "@/infra/persistence/drizzle/schema";

export class DrizzleCheckoutsRepository implements CheckoutsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findMany(query: CheckoutQuery): Promise<Page<Checkout>> {
    const where = this.buildFilters(query);

    const [rows, [totals]] = await Promise.all([
      this.db
        .select()
        .from(checkouts)
        .where(where)
        .orderBy(desc(checkouts.createdAt))
        .limit(query.perPage)
        .offset((query.page - 1) * query.perPage),
      this.db.select({ value: count() }).from(checkouts).where(where),
    ]);

    return { items: rows.map(toCheckout), total: totals?.value ?? 0 };
  }

  async findById(accountId: string, checkoutId: string): Promise<Checkout | null> {
    const [row] = await this.db
      .select()
      .from(checkouts)
      .where(and(eq(checkouts.accountId, accountId), eq(checkouts.id, checkoutId)))
      .limit(1);

    return row ? toCheckout(row) : null;
  }

  async create(checkout: Checkout): Promise<void> {
    await this.db.insert(checkouts).values(toCheckoutRow(checkout));
  }

  async update(checkout: Checkout): Promise<void> {
    const row = toCheckoutRow(checkout);

    await this.db
      .update(checkouts)
      .set(row)
      .where(and(eq(checkouts.accountId, row.accountId), eq(checkouts.id, row.id)));
  }

  async delete(accountId: string, checkoutId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(checkouts)
      .where(and(eq(checkouts.accountId, accountId), eq(checkouts.id, checkoutId)))
      .returning({ id: checkouts.id });

    return deleted.length > 0;
  }

  /** Todo filtro começa pela conta: checkout de outra conta não existe para quem consulta. */
  private buildFilters(query: CheckoutQuery): SQL | undefined {
    const filters: SQL[] = [eq(checkouts.accountId, query.accountId)];

    if (query.status) {
      filters.push(eq(checkouts.status, query.status));
    }

    if (query.productId) {
      filters.push(eq(checkouts.productId, query.productId));
    }

    if (query.search) {
      const search = `%${query.search}%`;
      const matches = or(
        ilike(checkouts.internalTitle, search),
        ilike(checkouts.displayName, search),
      );

      if (matches) {
        filters.push(matches);
      }
    }

    return and(...filters);
  }
}
