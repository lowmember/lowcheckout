import { and, eq, isNull } from "drizzle-orm";

import type { RefreshToken } from "@/domain/sessions/entities/refresh-token.entity";
import type { RefreshTokensRepository } from "@/domain/sessions/repositories/refresh-tokens.repository";
import type { Database } from "@/infra/persistence/drizzle/database";
import {
  toRefreshToken,
  toRefreshTokenRow,
} from "@/infra/persistence/drizzle/mappers/refresh-token.mapper";
import { refreshTokens } from "@/infra/persistence/drizzle/schema";

export class DrizzleRefreshTokensRepository implements RefreshTokensRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    return row ? toRefreshToken(row) : null;
  }

  async create(refreshToken: RefreshToken): Promise<void> {
    await this.db.insert(refreshTokens).values(toRefreshTokenRow(refreshToken));
  }

  async update(refreshToken: RefreshToken): Promise<void> {
    const row = toRefreshTokenRow(refreshToken);

    await this.db.update(refreshTokens).set(row).where(eq(refreshTokens.id, row.id));
  }

  /** Um `update` em massa: derrubar N sessões não justifica N round-trips. */
  async revokeAllForUser(userId: string, now: Date): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: now })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  }
}
