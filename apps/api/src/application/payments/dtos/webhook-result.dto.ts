/** Resposta do webhook. Sempre 200 quando o evento foi aceito — inclusive o duplicado. */
export interface WebhookResultDto {
  received: true;
  /** `duplicate` = reentrega já processada; `unknown_charge` = cobrança não é nossa. */
  outcome: "processed" | "duplicate" | "unknown_charge" | "ignored";
}
