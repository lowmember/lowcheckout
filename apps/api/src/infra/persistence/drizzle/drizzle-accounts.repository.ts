import { and, eq, isNull } from "drizzle-orm";

import type { Account } from "@/domain/accounts/entities/account.entity";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";
import type { Database } from "@/infra/persistence/drizzle/database";
import { toAccount, toAccountRow } from "@/infra/persistence/drizzle/mappers/account.mapper";
import { accounts } from "@/infra/persistence/drizzle/schema";

export class DrizzleAccountsRepository implements AccountsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findById(accountId: string): Promise<Account | null> {
    const [row] = await this.db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1);

    return row ? toAccount(row) : null;
  }

  /** Espelha o `unique(document) where deleted_at is null`: conta excluída libera o documento. */
  async findByDocument(document: string): Promise<Account | null> {
    const [row] = await this.db
      .select()
      .from(accounts)
      .where(and(eq(accounts.document, document), isNull(accounts.deletedAt)))
      .limit(1);

    return row ? toAccount(row) : null;
  }

  async create(account: Account): Promise<void> {
    await this.db.insert(accounts).values(toAccountRow(account));
  }

  async update(account: Account): Promise<void> {
    const row = toAccountRow(account);

    await this.db.update(accounts).set(row).where(eq(accounts.id, row.id));
  }
}
