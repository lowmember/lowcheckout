import { env } from "@/shared/config/env";

/** URL pública de um vínculo checkout+oferta (RF-CHK-05). */
export function buildPublicCheckoutUrl(publicSlug: string) {
  return `${env.publicCheckoutUrl.replace(/\/$/, "")}/c/${publicSlug}`;
}
