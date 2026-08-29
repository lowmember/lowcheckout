import { jwtVerify, SignJWT } from "jose";

import type { Principal } from "@/application/auth/dtos/principal";
import type {
  AccessTokenIssuer,
  IssuedAccessToken,
} from "@/application/auth/ports/access-token-issuer";

export interface JwtAccessTokenOptions {
  secret: string;
  issuer: string;
  audience: string;
  ttlSeconds: number;
}

const ALGORITHM = "HS256";
const ACCOUNT_CLAIM = "account_id";

/**
 * Access token da API: JWT HS256 curto, com o usuário no `sub` e a conta numa
 * claim própria. Simétrico de propósito — quem assina e quem verifica é a
 * mesma stack, então uma chave assimétrica só acrescentaria operação.
 */
export class JwtAccessTokenIssuer implements AccessTokenIssuer {
  private readonly secret: Uint8Array;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly ttlSeconds: number;

  constructor(options: JwtAccessTokenOptions) {
    this.secret = new TextEncoder().encode(options.secret);
    this.issuer = options.issuer;
    this.audience = options.audience;
    this.ttlSeconds = options.ttlSeconds;
  }

  async issue(principal: Principal): Promise<IssuedAccessToken> {
    const token = await new SignJWT({ [ACCOUNT_CLAIM]: principal.accountId })
      .setProtectedHeader({ alg: ALGORITHM })
      .setSubject(principal.userId)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(`${this.ttlSeconds}s`)
      .sign(this.secret);

    return { token, expiresInSeconds: this.ttlSeconds };
  }

  async verify(token: string): Promise<Principal | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: [ALGORITHM],
        issuer: this.issuer,
        audience: this.audience,
      });

      const userId = payload.sub;
      const accountId = payload[ACCOUNT_CLAIM];

      if (typeof userId !== "string" || typeof accountId !== "string") {
        return null;
      }

      return { accountId, userId };
    } catch {
      return null;
    }
  }
}
