import type { RefreshToken } from "@/domain/sessions/entities/refresh-token.entity";

export interface RefreshTokensRepository {
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  create(refreshToken: RefreshToken): Promise<void>;
  update(refreshToken: RefreshToken): Promise<void>;
  /** Logout de todas as sessões: usado ao desativar ou excluir a conta. */
  revokeAllForUser(userId: string, now: Date): Promise<void>;
}
