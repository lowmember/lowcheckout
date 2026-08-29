import { z } from "zod";

import { GATEWAY_ENVIRONMENTS } from "@/domain/gateways/value-objects/gateway-environment";
import { GATEWAY_PROVIDERS } from "@/domain/gateways/value-objects/gateway-provider";

export const connectGatewaySchema = z.object({
  provider: z.enum(GATEWAY_PROVIDERS).default("efibank"),
  environment: z.enum(GATEWAY_ENVIRONMENTS).default("sandbox"),
  clientId: z.string().trim().min(1),
  clientSecret: z.string().trim().min(1),
  /** Arquivo `.p12` do EfiBank em base64 — é o material mTLS. */
  certificateBase64: z.base64().nullable().optional(),
  certificatePassphrase: z.string().nullable().optional(),
  pixKey: z.string().trim().min(1).max(160).nullable().optional(),
});
