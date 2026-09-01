import type { GatewayProvider } from "@/features/gateway/types/gateway";

export interface GatewayCatalogEntry {
  provider: GatewayProvider;
  name: string;
  description: string;
  /** Meios de pagamento que este gateway habilita nos checkouts. */
  methods: string[];
}

/**
 * Gateways disponíveis para integração. O EfiBank é apenas o primeiro da lista —
 * nada fora deste catálogo (e da tela de configuração dele) deve mencioná-lo.
 */
export const GATEWAY_CATALOG: GatewayCatalogEntry[] = [
  {
    provider: "efibank",
    name: "EfiBank",
    description: "Cobrança PIX com confirmação automática por webhook.",
    methods: ["PIX"],
  },
];
