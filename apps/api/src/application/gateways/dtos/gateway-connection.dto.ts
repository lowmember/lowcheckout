import type { GatewayEnvironment } from "@/domain/gateways/value-objects/gateway-environment";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";
import type { GatewayStatus } from "@/domain/gateways/value-objects/gateway-status";

/**
 * Contrato de saída. Não existe campo de credencial aqui, nem mascarado:
 * RF-GTW-01 diz que credencial não volta em texto claro depois de salva, e a
 * forma mais simples de cumprir isso é nunca a colocar no DTO.
 */
export interface GatewayConnectionDto {
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
