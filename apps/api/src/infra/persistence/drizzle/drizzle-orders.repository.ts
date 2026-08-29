import { and, asc, count, desc, eq, ilike, lte, or, type SQL } from "drizzle-orm";

import type { OrderEvent } from "@/domain/orders/entities/order-event.entity";
import type { Order } from "@/domain/orders/entities/order.entity";
import type { OrderEventsRepository } from "@/domain/orders/repositories/order-events.repository";
import type {
  OrderQuery,
  OrdersRepository,
} from "@/domain/orders/repositories/orders.repository";
import type { Page } from "@/domain/shared/repositories/page";
import type { Database } from "@/infra/persistence/drizzle/database";
import { toOrder, toOrderEventRow, toOrderRow } from "@/infra/persistence/drizzle/mappers/order.mapper";
import { orderEvents, orders } from "@/infra/persistence/drizzle/schema";

export class DrizzleOrdersRepository implements OrdersRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findById(orderId: string): Promise<Order | null> {
    const [row] = await this.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    return row ? toOrder(row) : null;
  }

  async findManyByAccount(query: OrderQuery): Promise<Page<Order>> {
    const where = this.buildFilters(query);

    const [rows, [totals]] = await Promise.all([
      this.db
        .select()
        .from(orders)
        .where(where)
        .orderBy(desc(orders.createdAt))
        .limit(query.perPage)
        .offset((query.page - 1) * query.perPage),
      this.db.select({ value: count() }).from(orders).where(where),
    ]);

    return { items: rows.map(toOrder), total: totals?.value ?? 0 };
  }

  async create(order: Order): Promise<void> {
    await this.db.insert(orders).values(toOrderRow(order));
  }

  async update(order: Order): Promise<void> {
    const row = toOrderRow(order);

    await this.db.update(orders).set(row).where(eq(orders.id, row.id));
  }

  /** Usa o índice `orders_status_expires_at_idx`, que existe exatamente para isto. */
  async findExpirable(now: Date, limit: number): Promise<Order[]> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.status, "awaiting_payment"), lte(orders.expiresAt, now)))
      .orderBy(asc(orders.expiresAt))
      .limit(limit);

    return rows.map(toOrder);
  }

  /** Todo filtro começa pela conta: pedido de outra conta não existe aqui. */
  private buildFilters(query: OrderQuery): SQL | undefined {
    const filters: SQL[] = [eq(orders.accountId, query.accountId)];

    if (query.status) {
      filters.push(eq(orders.status, query.status));
    }

    if (query.search) {
      // Busca pelos snapshots do comprador, que são o que a tela mostra.
      const search = `%${query.search}%`;
      const matches = or(ilike(orders.buyerName, search), ilike(orders.buyerEmail, search));

      if (matches) {
        filters.push(matches);
      }
    }

    return and(...filters);
  }
}

export class DrizzleOrderEventsRepository implements OrderEventsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async create(event: OrderEvent): Promise<void> {
    await this.db.insert(orderEvents).values(toOrderEventRow(event));
  }
}
