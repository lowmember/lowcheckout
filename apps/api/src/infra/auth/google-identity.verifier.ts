import { createRemoteJWKSet, jwtVerify } from "jose";

import type {
  GoogleIdentity,
  GoogleIdentityVerifier,
} from "@/application/auth/ports/google-identity-verifier";
import { GoogleIdentityRejectedError } from "@/domain/sessions/errors/google-identity-rejected.error";

/** Chaves públicas do Google; o `jose` faz cache e rotação sozinho. */
const GOOGLE_JWKS_URL = new URL("https://www.googleapis.com/oauth2/v3/certs");
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

/**
 * Verifica o id token do Google contra o JWKS oficial: assinatura, `iss`, `aud`
 * (o nosso `GOOGLE_CLIENT_ID`) e validade. Nada de "decodificar e confiar".
 */
export class JoseGoogleIdentityVerifier implements GoogleIdentityVerifier {
  private readonly clientId: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.jwks = createRemoteJWKSet(GOOGLE_JWKS_URL);
  }

  async verify(idToken: string): Promise<GoogleIdentity> {
    let claims: Record<string, unknown>;

    try {
      const { payload } = await jwtVerify(idToken, this.jwks, {
        issuer: GOOGLE_ISSUERS,
        audience: this.clientId,
      });

      claims = payload;
    } catch {
      throw new GoogleIdentityRejectedError();
    }

    const googleSub = readString(claims.sub);
    const email = readString(claims.email);

    if (!googleSub || !email) {
      throw new GoogleIdentityRejectedError();
    }

    return {
      googleSub,
      email,
      // O Google manda booleano; algumas bibliotecas repassam a string.
      emailVerified: claims.email_verified === true || claims.email_verified === "true",
      name: readString(claims.name),
      avatarUrl: readString(claims.picture),
    };
  }
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}
