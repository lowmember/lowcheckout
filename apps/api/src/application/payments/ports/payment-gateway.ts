import type { GatewayCredentials } from "@/domain/gateways/value-objects/gateway-credentials";
import type { GatewayEnvironment } from "@/domain/gateways/value-objects/gateway-environment";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";

/** Estado de uma cobrança do ponto de vista do provedor. */
export type PixChargeStatus = "pending" | "paid" | "expired" | "failed" | "refunded";

export interface PixChargePayer {
  name: string;
  /** CPF, só dígitos. */
  document: string;
}

export interface CreatePixChargeRequest {
  /** Nosso identificador do pedido, enviado como referência ao provedor. */
  orderId: string;
  amountInCents: number;
  expiresInSeconds: number;
  description: string;
  payer: PixChargePayer;
  /** Chave PIX de recebimento da conta; vem da conexão. */
  pixKey: string;
}

export interface PixCharge {
  externalChargeId: string;
  status: PixChargeStatus;
  /** Copia-e-cola (BR Code). */
  qrCodePayload: string | null;
  qrCodeImageUrl: string | null;
  expiresAt: Date;
  paidAt: Date | null;
  /** Resposta bruta do provedor, guardada em `payments.raw_payload` para auditoria. */
  rawPayload: Record<string, unknown>;
}

export interface GatewayContext {
  environment: GatewayEnvironment;
  credentials: GatewayCredentials;
}

/**
 * Porta do provedor de pagamento. A aplicação não sabe se do outro lado há
 * EfiBank, outro adquirente ou um dublê — só que dá para cobrar por PIX e
 * consultar a cobrança depois.
 */
export interface PaymentGateway {
  readonly provider: GatewayProvider;
  /** RF-GTW-05: falha com `GatewayCredentialsRejectedError` ou `GatewayUnavailableError`. */
  verifyCredentials(context: GatewayContext): Promise<void>;
  createPixCharge(context: GatewayContext, request: CreatePixChargeRequest): Promise<PixCharge>;
  getCharge(context: GatewayContext, externalChargeId: string): Promise<PixCharge>;
}
