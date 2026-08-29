export const GATEWAY_PROVIDERS = ["efibank"] as const;

export type GatewayProvider = (typeof GATEWAY_PROVIDERS)[number];
