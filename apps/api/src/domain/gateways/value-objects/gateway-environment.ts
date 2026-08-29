export const GATEWAY_ENVIRONMENTS = ["sandbox", "production"] as const;

export type GatewayEnvironment = (typeof GATEWAY_ENVIRONMENTS)[number];
