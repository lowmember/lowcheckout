export const GATEWAY_PROVIDERS = ["efibank"] as const;
export type GatewayProvider = (typeof GATEWAY_PROVIDERS)[number];

export const GATEWAY_ENVIRONMENTS = ["sandbox", "production"] as const;
export type GatewayEnvironment = (typeof GATEWAY_ENVIRONMENTS)[number];

export const GATEWAY_STATUSES = ["connected", "disconnected", "error"] as const;
export type GatewayStatus = (typeof GATEWAY_STATUSES)[number];

/**
 * Gateway é global da conta: conecta uma vez, todo checkout herda (RF-GTW-03).
 *
 * Sem conexão, `GET /gateway` responde **200 com `data: null`** — não 404. Não
 * ter conectado ainda é um estado normal da tela, não um erro.
 *
 * Não existe campo de credencial aqui, nem mascarado (RF-GTW-01).
 */
export interface GatewayConnection {
  id: string;
  provider: GatewayProvider;
  environment: GatewayEnvironment;
  status: GatewayStatus;
  pixKey: string | null;
  lastError: string | null;
  connectedAt: string | null;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
