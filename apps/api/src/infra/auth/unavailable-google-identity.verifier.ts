import type {
  GoogleIdentity,
  GoogleIdentityVerifier,
} from "@/application/auth/ports/google-identity-verifier";
import { GoogleSignInUnavailableError } from "@/domain/sessions/errors/google-sign-in-unavailable.error";

/**
 * Substituto do verificador real quando falta `GOOGLE_CLIENT_ID`. Existe para
 * que a ausência de configuração vire uma resposta HTTP honesta (503) em vez de
 * derrubar o Lambda antes de o controller chegar a rodar.
 */
export class UnavailableGoogleIdentityVerifier implements GoogleIdentityVerifier {
  verify(): Promise<GoogleIdentity> {
    return Promise.reject(new GoogleSignInUnavailableError());
  }
}
