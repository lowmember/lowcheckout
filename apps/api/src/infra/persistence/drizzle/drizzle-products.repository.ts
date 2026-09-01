import { and, count, desc, eq, ilike, type SQL } from "drizzle-orm";

import type { Product } from "@/domain/products/entities/product.entity";
import type {
  ProductQuery,
  ProductsRepository,
} from "@/domain/products/repositories/products.repository";
import type { Page } from "@/domain/shared/repositories/page";
import type { Database } from "@/infra/persistence/drizzle/database";
import { toProduct, toProductRow } from "@/infra/persistence/drizzle/mappers/product.mapper";
import { products } from "@/infra/persistence/drizzle/schema";

export class DrizzleProductsRepository implements ProductsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findMany(query: ProductQuery): Promise<Page<Product>> {
    const where = this.buildFilters(query);

    const [rows, [totals]] = await Promise.all([
      this.db
        .select()
        .from(products)
        .where(where)
        .orderBy(desc(products.createdAt))
        .limit(query.perPage)
        .offset((query.page - 1) * query.perPage),
      this.db.select({ value: count() }).from(products).where(where),
    ]);

    return { items: rows.map(toProduct), total: totals?.value ?? 0 };
  }

  async findById(accountId: string, productId: string): Promise<Product | null> {
    const [row] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.accountId, accountId), eq(products.id, productId)))
      .limit(1);

    return row ? toProduct(row) : null;
  }

  async create(product: Product): Promise<void> {
    await this.db.insert(products).values(toProductRow(product));
  }

  async update(product: Product): Promise<void> {
    const row = toProductRow(product);

    await this.db
      .update(products)
      .set(row)
      .where(and(eq(products.accountId, row.accountId), eq(products.id, row.id)));
  }

  async delete(accountId: string, productId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(products)
      .where(and(eq(products.accountId, accountId), eq(products.id, productId)))
      .returning({ id: products.id });

    return deleted.length > 0;
  }

  /** Todo filtro começa pela conta: produto de outra conta não existe para quem consulta. */
  private buildFilters(query: ProductQuery): SQL | undefined {
    const filters: SQL[] = [eq(products.accountId, query.accountId)];

    if (query.status) {
      filters.push(eq(products.status, query.status));
    }

    if (query.search) {
      filters.push(ilike(products.name, `%${query.search}%`));
    }

    return and(...filters);
  }
}
