import type {
  WebhookPayloadReader,
  WebhookPaymentNotification,
} from "@/application/payments/ports/webhook-payload-reader";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";

/**
 * O webhook PIX do EfiBank entrega `{ pix: [{ endToEndId, txid, valor, horario }] }`.
 * Não há campo de "id do evento", então o `endToEndId` — único por transação PIX
 * no SPI — é usado como chave de idempotência.
 *
 * ⚠️ Formato conferido apenas contra a documentação pública; **não verificado**
 * com uma conta real (ver `efibank-payment.gateway.ts`).
 */
export class EfiBankWebhookPayloadReader implements WebhookPayloadReader {
  readonly provider: GatewayProvider = "efibank";

  read(payload: Record<string, unknown>): WebhookPaymentNotification | null {
    const entries = Array.isArray(payload.pix) ? payload.pix : [];
    const first = entries.find(isRecord);

    if (!first) {
      return null;
    }

    const externalChargeId = readString(first, "txid");

    if (!externalChargeId) {
      return null;
    }

    const horario = readString(first, "horario");
    const externalEventId =
      readString(first, "endToEndId") ?? `${externalChargeId}:${horario ?? "sem-horario"}`;

    return {
      externalEventId,
      externalChargeId,
      // A notificação de PIX do EfiBank só existe quando o dinheiro entrou.
      paid: true,
      paidAt: horario ? new Date(horario) : null,
    };
  }
}

/**
 * Formato do dublê (`FakePaymentGateway`), para exercitar o webhook em
 * desenvolvimento: `{ chargeId, eventId?, paid?, paidAt? }`.
 */
export class FakeWebhookPayloadReader implements WebhookPayloadReader {
  readonly provider: GatewayProvider = "efibank";

  read(payload: Record<string, unknown>): WebhookPaymentNotification | null {
    const externalChargeId = readString(payload, "chargeId");

    if (!externalChargeId) {
      return null;
    }

    const paidAt = readString(payload, "paidAt");

    return {
      externalEventId: readString(payload, "eventId") ?? `${externalChargeId}:fake`,
      externalChargeId,
      paid: payload.paid !== false,
      paidAt: paidAt ? new Date(paidAt) : null,
    };
  }
}

function readString(source: Record<string, unknown>, key: string): string | null {
  const value = source[key];

  return typeof value === "string" && value !== "" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
