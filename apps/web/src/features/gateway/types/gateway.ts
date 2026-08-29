export type GatewayProvider = "efibank";
export type GatewayStatus = "connected" | "disconnected" | "error";
export type GatewayEnvironment = "sandbox" | "production";

/**
 * Gateway é global da conta: conecta uma vez, todo checkout herda (RF-GTW-03).
 *
 * Sem conexão, `GET /gateway` responde **200 com `data: null`** — não 404. Não
 * ter conectado ainda é um estado normal da tela, não um erro.
 */
export interface GatewayConnection {
  id: string;
  provider: GatewayProvider;
  environment: GatewayEnvironment;
  status: GatewayStatus;
  /** Credenciais nunca voltam em texto claro (RF-GTW-01). */
  pixKey: string | null;
  lastError: string | null;
  connectedAt: string | null;
  lastCheckedAt: string | null;
}

/** `PUT /gateway` — conectar ou trocar credenciais (RF-GTW-01/04). */
export interface SaveGatewayInput {
  provider: GatewayProvider;
  environment: GatewayEnvironment;
  clientId: string;
  clientSecret: string;
  pixKey: string;
}

export type GatewayFieldErrors = Partial<Record<keyof SaveGatewayInput, string>>;
