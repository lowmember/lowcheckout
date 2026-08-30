import type { Account } from "./accounts";
import type { User } from "./users";

/**
 * Resposta de `POST /auth/google`, `POST /auth/refresh` e `POST /auth/dev-session`.
 * O `refreshToken` aparece em claro **só aqui**: o banco guarda o SHA-256 dele.
 */
export interface AuthSession {
  tokenType: "Bearer";
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: User;
  /** A conta vem inteira — não só o id. */
  account: Account;
  /** Atalho para o guard de rota decidir o redirecionamento (RF-ONB-01). */
  onboardingPending: boolean;
}

/** Resposta de `GET /me`. */
export interface Me {
  user: User;
  account: Account;
  onboardingPending: boolean;
}
