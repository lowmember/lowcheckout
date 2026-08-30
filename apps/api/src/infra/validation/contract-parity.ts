/**
 * Trava de paridade entre os value objects do domínio e o contrato HTTP.
 *
 * O domínio não importa `@lowcheckout/contracts` de propósito: a regra 1 do
 * CLAUDE.md diz que ele não importa nada de fora dele. O preço disso é que os
 * literais existem em dois lugares — este arquivo é o que impede que isso vire
 * divergência. Ele mora na infra, a única camada que pode enxergar os dois
 * lados, e é 100% tipos: não gera uma linha de runtime.
 *
 * Se alguém adicionar um status no domínio e esquecer do contrato (ou o
 * contrário), o `pnpm typecheck` falha aqui, nomeando o par que divergiu.
 */

import type * as Contract from "@lowcheckout/contracts";

import type { AccountDocumentType } from "@/domain/accounts/value-objects/account-document-type";
import type { AccountRevenueRange } from "@/domain/accounts/value-objects/account-revenue-range";
import type { AccountStatus } from "@/domain/accounts/value-objects/account-status";
import type { AnalyticsGranularity } from "@/domain/analytics/value-objects/analytics-period";
import type { CheckoutCustomizationProps } from "@/domain/checkouts/value-objects/checkout-customization";
import type { CheckoutStatus } from "@/domain/checkouts/value-objects/checkout-status";
import type { CustomizationSource } from "@/domain/checkouts/value-objects/customization-source";
import type { PixelProvider } from "@/domain/checkouts/value-objects/pixel-provider";
import type { GatewayEnvironment } from "@/domain/gateways/value-objects/gateway-environment";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";
import type { GatewayStatus } from "@/domain/gateways/value-objects/gateway-status";
import type { OfferStatus } from "@/domain/offers/value-objects/offer-status";
import type { OrderStatus } from "@/domain/orders/value-objects/order-status";
import type { ProductStatus } from "@/domain/products/value-objects/product-status";

/**
 * `Identical` resolve para `false` quando os tipos divergem em qualquer
 * direção, e `Assert` só aceita `true` — é a combinação que transforma a
 * divergência em erro de compilação em vez de um `never` silencioso.
 *
 * Os colchetes desligam a distribuição sobre uniões: sem eles, `"a" | "b"`
 * seria comparado membro a membro e a checagem passaria por engano.
 */
type Identical<TLeft, TRight> = [TLeft] extends [TRight]
  ? [TRight] extends [TLeft]
    ? true
    : false
  : false;

type Assert<TParity extends true> = TParity;

export type AccountDocumentTypeParity = Assert<
  Identical<AccountDocumentType, Contract.AccountDocumentType>
>;
export type AccountRevenueRangeParity = Assert<
  Identical<AccountRevenueRange, Contract.AccountRevenueRange>
>;
export type AccountStatusParity = Assert<Identical<AccountStatus, Contract.AccountStatus>>;
export type AnalyticsGranularityParity = Assert<
  Identical<AnalyticsGranularity, Contract.AnalyticsGranularity>
>;
export type CheckoutCustomizationParity = Assert<
  Identical<CheckoutCustomizationProps, Contract.CheckoutCustomization>
>;
export type CheckoutStatusParity = Assert<Identical<CheckoutStatus, Contract.CheckoutStatus>>;
export type CustomizationSourceParity = Assert<
  Identical<CustomizationSource, Contract.CustomizationSource>
>;
export type GatewayEnvironmentParity = Assert<
  Identical<GatewayEnvironment, Contract.GatewayEnvironment>
>;
export type GatewayProviderParity = Assert<Identical<GatewayProvider, Contract.GatewayProvider>>;
export type GatewayStatusParity = Assert<Identical<GatewayStatus, Contract.GatewayStatus>>;
export type OfferStatusParity = Assert<Identical<OfferStatus, Contract.OfferStatus>>;
export type OrderStatusParity = Assert<Identical<OrderStatus, Contract.OrderStatus>>;
export type PixelProviderParity = Assert<Identical<PixelProvider, Contract.PixelProvider>>;
export type ProductStatusParity = Assert<Identical<ProductStatus, Contract.ProductStatus>>;
