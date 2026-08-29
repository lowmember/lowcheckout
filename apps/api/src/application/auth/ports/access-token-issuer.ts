import type { Principal } from "@/application/auth/dtos/principal";

export interface IssuedAccessToken {
  token: string;
  expiresInSeconds: number;
}

/**
 * Porta do access token da própria API (RF-AUTH-03). A aplicação emite e a
 * borda HTTP verifica; o formato (JWT, PASETO, o que for) é decisão da infra.
 */
export interface AccessTokenIssuer {
  issue(principal: Principal): Promise<IssuedAccessToken>;
  /** `null` quando o token é inválido, expirado ou de outro emissor. */
  verify(token: string): Promise<Principal | null>;
}
