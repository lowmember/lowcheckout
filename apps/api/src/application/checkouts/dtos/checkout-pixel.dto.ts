import type { PixelProvider } from "@/domain/checkouts/value-objects/pixel-provider";

/**
 * O `accessToken` **nunca** sai daqui: a API só informa se existe um
 * configurado. Devolver a credencial de terceiro numa resposta desfaria o
 * motivo de guardá-la cifrada.
 */
export interface CheckoutPixelDto {
  id: string;
  checkoutId: string;
  provider: PixelProvider;
  externalId: string;
  hasAccessToken: boolean;
  config: Record<string, unknown>;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
