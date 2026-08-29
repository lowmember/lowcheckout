import { createHash } from "node:crypto";

import type {
  CreatePixChargeRequest,
  GatewayContext,
  PaymentGateway,
  PixCharge,
} from "@/application/payments/ports/payment-gateway";
import type { Clock } from "@/application/shared/ports/clock";
import { GatewayCredentialsRejectedError } from "@/domain/gateways/errors/gateway-credentials-rejected.error";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";

/**
 * Dublê do provedor, usado fora de produção. Não é um mock de teste: ele é o
 * que faz o fluxo público inteiro (formulário → PIX → tela de obrigado)
 * funcionar em desenvolvimento sem conta no EfiBank.
 *
 * Comportamento deliberado: gera um BR Code sintético determinístico a partir do
 * pedido, e a cobrança **nunca** vira `paid` sozinha — a confirmação chega pelo
 * webhook, exatamente como em produção, para que o caminho testado seja o real.
 */
export class FakePaymentGateway implements PaymentGateway {
  readonly provider: GatewayProvider = "efibank";

  private readonly clock: Clock;

  constructor(clock: Clock) {
    this.clock = clock;
  }

  verifyCredentials(context: GatewayContext): Promise<void> {
    // Basta ter forma de credencial: aceitar qualquer coisa esconderia bugs de
    // formulário que apareceriam só em produção.
    if (context.credentials.clientId.length < 3 || context.credentials.clientSecret.length < 3) {
      return Promise.reject(
        new GatewayCredentialsRejectedError("client id e client secret muito curtos"),
      );
    }

    return Promise.resolve();
  }

  createPixCharge(_context: GatewayContext, request: CreatePixChargeRequest): Promise<PixCharge> {
    const now = this.clock.now();
    const externalChargeId = `fake-${createHash("sha256").update(request.orderId).digest("hex").slice(0, 24)}`;
    const expiresAt = new Date(now.getTime() + request.expiresInSeconds * 1000);

    return Promise.resolve({
      externalChargeId,
      status: "pending",
      qrCodePayload: buildFakeBrCode(externalChargeId, request.amountInCents, request.pixKey),
      qrCodeImageUrl: null,
      expiresAt,
      paidAt: null,
      rawPayload: {
        simulated: true,
        orderId: request.orderId,
        amountInCents: request.amountInCents,
        expiresAt: expiresAt.toISOString(),
      },
    });
  }

  getCharge(_context: GatewayContext, externalChargeId: string): Promise<PixCharge> {
    const now = this.clock.now();

    return Promise.resolve({
      externalChargeId,
      status: "pending",
      qrCodePayload: null,
      qrCodeImageUrl: null,
      expiresAt: now,
      paidAt: null,
      rawPayload: { simulated: true },
    });
  }
}

/** Formato inspirado no BR Code, o suficiente para a UI exercitar o copia-e-cola. */
function buildFakeBrCode(chargeId: string, amountInCents: number, pixKey: string): string {
  const amount = (amountInCents / 100).toFixed(2);

  return `00020126FAKE${pixKey}520400005303986540${amount.length}${amount}5802BR6009SAO PAULO62${chargeId}6304FAKE`;
}
