import { and, eq } from "drizzle-orm";

import type { Buyer } from "@/domain/buyers/entities/buyer.entity";
import type { BuyersRepository } from "@/domain/buyers/repositories/buyers.repository";
import type { Database } from "@/infra/persistence/drizzle/database";
import { toBuyer, toBuyerRow } from "@/infra/persistence/drizzle/mappers/buyer.mapper";
import { buyers } from "@/infra/persistence/drizzle/schema";

export class DrizzleBuyersRepository implements BuyersRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findByAccountAndEmail(accountId: string, email: string): Promise<Buyer | null> {
    const [row] = await this.db
      .select()
      .from(buyers)
      .where(and(eq(buyers.accountId, accountId), eq(buyers.email, email.trim().toLowerCase())))
      .limit(1);

    return row ? toBuyer(row) : null;
  }

  async create(buyer: Buyer): Promise<void> {
    await this.db.insert(buyers).values(toBuyerRow(buyer));
  }

  async update(buyer: Buyer): Promise<void> {
    const row = toBuyerRow(buyer);

    await this.db.update(buyers).set(row).where(eq(buyers.id, row.id));
  }
}
