import { env } from "@/shared/config/env";

/**
 * URL pública de um vínculo checkout+oferta (RF-CHK-05).
 *
 * O slug fica na **raiz** do domínio do checkout (`lowchk.click/a7k3mp2q`), e
 * não sob um prefixo: é o endereço que o lojista divulga em anúncio e bio, onde
 * cada caractere a mais é atrito. Quem serve essa URL é o `apps/checkout` — o
 * painel só sabe montá-la.
 */
export function buildPublicCheckoutUrl(publicSlug: string) {
  return `${env.publicCheckoutUrl.replace(/\/$/, "")}/${publicSlug}`;
}
