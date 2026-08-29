/** O que o LowCheckout precisa do perfil Google. Nome e foto são opcionais (RF-AUTH-01). */
export interface GoogleIdentity {
  googleSub: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  avatarUrl?: string | null;
}

/**
 * Porta de verificação do id token do Google. Quem sabe validar assinatura,
 * `iss` e `aud` é a infra; a aplicação só quer a identidade — ou um erro.
 */
export interface GoogleIdentityVerifier {
  verify(idToken: string): Promise<GoogleIdentity>;
}
