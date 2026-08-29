import { RefreshToken } from "@/domain/sessions/entities/refresh-token.entity";
import type { NewRefreshTokenRow, RefreshTokenRow } from "@/infra/persistence/drizzle/schema";

export function toRefreshToken(row: RefreshTokenRow): RefreshToken {
  return RefreshToken.restore({
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
  });
}

export function toRefreshTokenRow(refreshToken: RefreshToken): NewRefreshTokenRow {
  const snapshot = refreshToken.toSnapshot();

  return {
    id: snapshot.id,
    userId: snapshot.userId,
    tokenHash: snapshot.tokenHash,
    expiresAt: snapshot.expiresAt,
    revokedAt: snapshot.revokedAt,
    createdAt: snapshot.createdAt,
  };
}
