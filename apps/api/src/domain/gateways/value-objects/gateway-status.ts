export const GATEWAY_STATUSES = ["connected", "disconnected", "error"] as const;

export type GatewayStatus = (typeof GATEWAY_STATUSES)[number];
