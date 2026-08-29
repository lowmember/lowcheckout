import type {
  CreatePixChargeRequest,
  GatewayContext,
  PaymentGateway,
  PixCharge,
  PixChargeStatus,
} from "@/application/payments/ports/payment-gateway";
import type { Clock } from "@/application/shared/ports/clock";
import { GatewayCredentialsRejectedError } from "@/domain/gateways/errors/gateway-credentials-rejected.error";
import { GatewayUnavailableError } from "@/domain/gateways/errors/gateway-unavailable.error";
import type { GatewayEnvironment } from "@/domain/gateways/value-objects/gateway-environment";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";
import { sendEfiBankRequest } from "@/infra/payments/efibank-http.client";

const BASE_URLS: Record<GatewayEnvironment, string> = {
  production: "https://pix.api.efipay.com.br",
  sandbox: "https://pix-h.api.efipay.com.br",
};

const TIMEOUT_MS = 15_000;

/**
 * Adapter do EfiBank (PIX). Fluxo: OAuth client-credentials sobre mTLS, depois
 * `POST /v2/cob` para a cobrança imediata e `GET /v2/loc/{id}/qrcode` para o
 * copia-e-cola.
 *
 * ⚠️ **Não verificado contra o provedor real.** Não há conta nem certificado
 * `.p12` disponíveis neste ambiente, então o mapeamento de campos e os códigos
 * de erro abaixo seguem a documentação pública e **precisam ser conferidos
 * contra uma conta sandbox antes de ir a produção**. O caminho do certificado
 * está implementado (o `.p12` chega em base64 nas credenciais e vai para o
 * `Agent` mTLS), mas nunca foi exercitado com material real.
 */
export class EfiBankPaymentGateway implements PaymentGateway {
  readonly provider: GatewayProvider = "efibank";

  private readonly clock: Clock;

  constructor(clock: Clock) {
    this.clock = clock;
  }

  async verifyCredentials(context: GatewayContext): Promise<void> {
    // Pedir o token já exercita credencial e certificado de uma vez (RF-GTW-05).
    await this.authenticate(context);
  }

  async createPixCharge(
    context: GatewayContext,
    request: CreatePixChargeRequest,
  ): Promise<PixCharge> {
    const accessToken = await this.authenticate(context);

    const created = await sendEfiBankRequest({
      baseUrl: BASE_URLS[context.environment],
      method: "POST",
      path: "/v2/cob",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {
        calendario: { expiracao: request.expiresInSeconds },
        devedor: { cpf: request.payer.document, nome: request.payer.name },
        valor: { original: toDecimalAmount(request.amountInCents) },
        chave: request.pixKey,
        solicitacaoPagador: request.description.slice(0, 140),
      },
      pfx: toPfx(context),
      passphrase: context.credentials.certificatePassphrase,
      timeoutMs: TIMEOUT_MS,
    });

    if (created.statusCode >= 400) {
      throw new GatewayUnavailableError(describe(created.body));
    }

    return this.toPixCharge(created.body, request.expiresInSeconds);
  }

  async getCharge(context: GatewayContext, externalChargeId: string): Promise<PixCharge> {
    const accessToken = await this.authenticate(context);

    const found = await sendEfiBankRequest({
      baseUrl: BASE_URLS[context.environment],
      method: "GET",
      path: `/v2/cob/${encodeURIComponent(externalChargeId)}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      pfx: toPfx(context),
      passphrase: context.credentials.certificatePassphrase,
      timeoutMs: TIMEOUT_MS,
    });

    if (found.statusCode >= 400) {
      throw new GatewayUnavailableError(describe(found.body));
    }

    return this.toPixCharge(found.body, 0);
  }

  /** OAuth client-credentials com Basic auth, sobre a conexão mTLS. */
  private async authenticate(context: GatewayContext): Promise<string> {
    const basic = Buffer.from(
      `${context.credentials.clientId}:${context.credentials.clientSecret}`,
    ).toString("base64");

    const response = await sendEfiBankRequest({
      baseUrl: BASE_URLS[context.environment],
      method: "POST",
      path: "/oauth/token",
      headers: { Authorization: `Basic ${basic}` },
      body: { grant_type: "client_credentials" },
      pfx: toPfx(context),
      passphrase: context.credentials.certificatePassphrase,
      timeoutMs: TIMEOUT_MS,
    });

    if (response.statusCode === 401 || response.statusCode === 403) {
      throw new GatewayCredentialsRejectedError(describe(response.body));
    }

    if (response.statusCode >= 400) {
      throw new GatewayUnavailableError(describe(response.body));
    }

    const accessToken = readString(response.body, "access_token");

    if (!accessToken) {
      throw new GatewayUnavailableError("resposta de autenticação sem access_token");
    }

    return accessToken;
  }

  private toPixCharge(body: unknown, fallbackExpiresInSeconds: number): PixCharge {
    const payload = isRecord(body) ? body : {};
    const externalChargeId = readString(payload, "txid");

    if (!externalChargeId) {
      throw new GatewayUnavailableError("resposta da cobrança sem txid");
    }

    const calendar = isRecord(payload.calendario) ? payload.calendario : {};
    const createdAt = readString(calendar, "criacao");
    const expiresInSeconds =
      typeof calendar.expiracao === "number" ? calendar.expiracao : fallbackExpiresInSeconds;
    const base = createdAt ? new Date(createdAt) : this.clock.now();

    return {
      externalChargeId,
      status: toChargeStatus(readString(payload, "status")),
      qrCodePayload: readString(payload, "pixCopiaECola"),
      qrCodeImageUrl: readString(payload, "imagemQrcode"),
      expiresAt: new Date(base.getTime() + expiresInSeconds * 1000),
      paidAt: readPaidAt(payload),
      rawPayload: payload,
    };
  }
}

function toPfx(context: GatewayContext): Buffer | null {
  const certificate = context.credentials.certificateBase64;

  return certificate === null ? null : Buffer.from(certificate, "base64");
}

/** O EfiBank trabalha com valor decimal em string ("99.90"), não em centavos. */
function toDecimalAmount(amountInCents: number): string {
  return (amountInCents / 100).toFixed(2);
}

function toChargeStatus(status: string | null): PixChargeStatus {
  switch (status) {
    case "CONCLUIDA":
      return "paid";
    case "REMOVIDA_PELO_USUARIO_RECEBEDOR":
    case "REMOVIDA_PELO_PSP":
      return "expired";
    case "ATIVA":
      return "pending";
    default:
      return "pending";
  }
}

function readPaidAt(payload: Record<string, unknown>): Date | null {
  const pix = Array.isArray(payload.pix) ? payload.pix : [];
  const first = pix.find(isRecord);
  const horario = first ? readString(first, "horario") : null;

  return horario ? new Date(horario) : null;
}

function readString(source: unknown, key: string): string | null {
  if (!isRecord(source)) {
    return null;
  }

  const value = source[key];

  return typeof value === "string" && value !== "" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function describe(body: unknown): string | undefined {
  if (!isRecord(body)) {
    return undefined;
  }

  return (
    readString(body, "mensagem") ??
    readString(body, "error_description") ??
    readString(body, "detail") ??
    undefined
  );
}
