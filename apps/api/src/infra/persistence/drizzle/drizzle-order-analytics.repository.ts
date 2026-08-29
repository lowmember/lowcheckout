import { and, count, eq, gte, lte, sql, sum } from "drizzle-orm";

import type {
  AnalyticsQuery,
  CheckoutRevenueRankingItem,
  OrderAnalyticsRepository,
  OrdersOverview,
  SalesSeriesPoint,
} from "@/domain/analytics/repositories/order-analytics.repository";
import {
  ANALYTICS_TIME_ZONE,
  type AnalyticsGranularity,
} from "@/domain/analytics/value-objects/analytics-period";
import type { Database } from "@/infra/persistence/drizzle/database";
import { checkouts, orders } from "@/infra/persistence/drizzle/schema";

/** `YYYY-MM-DDTHH:mm:ss` já convertido para o fuso do analytics. */
const BUCKET_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS';

/**
 * Read model do analytics: agrega direto em `orders`, apoiado nos índices
 * `orders_account_id_paid_at_idx` e `orders_account_id_status_created_at_idx`.
 * Enquanto o volume for baixo isto basta; `checkout_daily_metrics` é a saída
 * Pós-MVP quando o `count(*)` parar de responder.
 */
export class DrizzleOrderAnalyticsRepository implements OrderAnalyticsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Pago entra pela **data de aprovação** (S19); pendente e expirado não têm
   * aprovação e entram pela data de criação.
   */
  async overview({ accountId, period }: AnalyticsQuery): Promise<OrdersOverview> {
    const [paid, pending, expired] = await Promise.all([
      this.db
        .select({ total: sum(orders.amountInCents), value: count() })
        .from(orders)
        .where(
          and(
            eq(orders.accountId, accountId),
            eq(orders.status, "paid"),
            gte(orders.paidAt, period.startsAt),
            lte(orders.paidAt, period.endsAt),
          ),
        ),
      this.aggregateByCreatedAt(accountId, "awaiting_payment", period.startsAt, period.endsAt),
      this.aggregateByCreatedAt(accountId, "expired", period.startsAt, period.endsAt),
    ]);

    const paidRow = paid[0];

    return {
      revenueInCents: Number(paidRow?.total ?? 0),
      pendingRevenueInCents: pending.totalInCents,
      paidCount: paidRow?.value ?? 0,
      pendingCount: pending.count,
      expiredCount: expired.count,
    };
  }

  /**
   * `generate_series` monta todos os baldes do período e o `left join` traz o
   * que houve — assim o gráfico recebe os intervalos vazios explicitamente, em
   * vez de o frontend ter que adivinhar buracos.
   */
  async salesSeries(
    { accountId, period }: AnalyticsQuery,
    granularity: AnalyticsGranularity,
  ): Promise<SalesSeriesPoint[]> {
    const step = granularity === "hour" ? "1 hour" : "1 day";

    const result = await this.db.execute(sql`
      with buckets as (
        select generate_series(
          date_trunc(${granularity}, ${period.startsAt.toISOString()}::timestamptz at time zone ${ANALYTICS_TIME_ZONE}),
          date_trunc(${granularity}, ${period.endsAt.toISOString()}::timestamptz at time zone ${ANALYTICS_TIME_ZONE}),
          ${step}::interval
        ) as bucket
      )
      select
        to_char(b.bucket, ${BUCKET_FORMAT}) as bucket,
        coalesce(sum(o.amount_in_cents), 0)::bigint as revenue_in_cents,
        count(o.id)::bigint as orders_count
      from buckets b
      left join orders o
        on o.account_id = ${accountId}
       and o.status = 'paid'
       and o.paid_at is not null
       and o.paid_at >= ${period.startsAt.toISOString()}::timestamptz
       and o.paid_at <= ${period.endsAt.toISOString()}::timestamptz
       and date_trunc(${granularity}, o.paid_at at time zone ${ANALYTICS_TIME_ZONE}) = b.bucket
      group by b.bucket
      order by b.bucket
    `);

    return toRows(result).map((row) => ({
      bucket: String(row.bucket ?? ""),
      revenueInCents: Number(row.revenue_in_cents ?? 0),
      ordersCount: Number(row.orders_count ?? 0),
    }));
  }

  async topCheckouts(
    { accountId, period }: AnalyticsQuery,
    limit: number,
  ): Promise<CheckoutRevenueRankingItem[]> {
    const revenue = sum(orders.amountInCents).mapWith(Number);

    const rows = await this.db
      .select({
        checkoutId: orders.checkoutId,
        internalTitle: checkouts.internalTitle,
        displayName: checkouts.displayName,
        revenueInCents: revenue,
        ordersCount: count(),
      })
      .from(orders)
      .innerJoin(checkouts, eq(checkouts.id, orders.checkoutId))
      .where(
        and(
          eq(orders.accountId, accountId),
          eq(orders.status, "paid"),
          gte(orders.paidAt, period.startsAt),
          lte(orders.paidAt, period.endsAt),
        ),
      )
      .groupBy(orders.checkoutId, checkouts.internalTitle, checkouts.displayName)
      .orderBy(sql`sum(${orders.amountInCents}) desc`)
      .limit(limit);

    return rows.map((row) => ({
      checkoutId: row.checkoutId,
      internalTitle: row.internalTitle,
      displayName: row.displayName,
      revenueInCents: Number(row.revenueInCents ?? 0),
      ordersCount: row.ordersCount,
    }));
  }

  /**
   * Pendente e expirado não têm data de aprovação, então o recorte é pela data
   * de criação. Contagem e soma saem da mesma varredura.
   */
  private async aggregateByCreatedAt(
    accountId: string,
    status: "awaiting_payment" | "expired",
    from: Date,
    to: Date,
  ): Promise<{ count: number; totalInCents: number }> {
    const [row] = await this.db
      .select({ value: count(), total: sum(orders.amountInCents) })
      .from(orders)
      .where(
        and(
          eq(orders.accountId, accountId),
          eq(orders.status, status),
          gte(orders.createdAt, from),
          lte(orders.createdAt, to),
        ),
      );

    return { count: row?.value ?? 0, totalInCents: Number(row?.total ?? 0) };
  }
}

/** O driver devolve as linhas cruas; o formato exato varia com a versão. */
function toRows(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) {
    return result as Record<string, unknown>[];
  }

  const rows = (result as { rows?: unknown }).rows;

  return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
}
