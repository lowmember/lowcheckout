import { sql } from "drizzle-orm";

import type { HealthCheck } from "@/presentation/http/controllers/health.controller";
import type { Database } from "@/infra/persistence/drizzle/database";

export class DatabaseHealthCheck implements HealthCheck {
  readonly name = "database";

  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async check(): Promise<boolean> {
    await this.db.execute(sql`select 1`);

    return true;
  }
}
