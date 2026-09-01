import type { RouteDefinition } from "@/presentation/http/protocols/http-route";

/**
 * Superfície HTTP da aplicação — fonte única de método e caminho.
 * O `serverless.ts` deriva as funções daqui; nada de rota escrita duas vezes.
 */
export const httpRoutes = {
  health: { name: "health", method: "GET", path: "/health" },

  // Públicas: criam ou encerram a sessão, então não podem exigir `principal`.
  authenticateWithGoogle: {
    name: "authenticateWithGoogle",
    method: "POST",
    path: "/auth/google",
  },
  refreshSession: { name: "refreshSession", method: "POST", path: "/auth/refresh" },
  logout: { name: "logout", method: "POST", path: "/auth/logout" },
  // TODO(RF-AUTH-01): atalho de desenvolvimento; responde 404 em produção.
  createDevSession: { name: "createDevSession", method: "POST", path: "/auth/dev-session" },

  getMe: { name: "getMe", method: "GET", path: "/me" },
  completeOnboarding: {
    name: "completeOnboarding",
    method: "PATCH",
    path: "/accounts/me/onboarding",
  },
  updateAccount: { name: "updateAccount", method: "PATCH", path: "/accounts/me" },
  deactivateAccount: {
    name: "deactivateAccount",
    method: "POST",
    path: "/accounts/me/deactivate",
  },
  deleteAccount: { name: "deleteAccount", method: "DELETE", path: "/accounts/me" },

  listProducts: { name: "listProducts", method: "GET", path: "/products" },
  getProduct: { name: "getProduct", method: "GET", path: "/products/{productId}" },
  createProduct: { name: "createProduct", method: "POST", path: "/products" },
  updateProduct: { name: "updateProduct", method: "PATCH", path: "/products/{productId}" },
  deleteProduct: { name: "deleteProduct", method: "DELETE", path: "/products/{productId}" },

  // Envio de imagem de produto, oferta e seções do checkout: a API só assina a
  // URL; o arquivo vai do navegador direto para o bucket.
  createImageUpload: { name: "createImageUpload", method: "POST", path: "/uploads/images" },

  listOffers: { name: "listOffers", method: "GET", path: "/products/{productId}/offers" },
  createOffer: { name: "createOffer", method: "POST", path: "/products/{productId}/offers" },
  getOffer: { name: "getOffer", method: "GET", path: "/offers/{offerId}" },
  updateOffer: { name: "updateOffer", method: "PATCH", path: "/offers/{offerId}" },
  deleteOffer: { name: "deleteOffer", method: "DELETE", path: "/offers/{offerId}" },

  listCheckouts: { name: "listCheckouts", method: "GET", path: "/checkouts" },
  getCheckout: { name: "getCheckout", method: "GET", path: "/checkouts/{checkoutId}" },
  createCheckout: { name: "createCheckout", method: "POST", path: "/checkouts" },
  updateCheckout: { name: "updateCheckout", method: "PATCH", path: "/checkouts/{checkoutId}" },
  deleteCheckout: { name: "deleteCheckout", method: "DELETE", path: "/checkouts/{checkoutId}" },

  linkOfferToCheckout: {
    name: "linkOfferToCheckout",
    method: "POST",
    path: "/checkouts/{checkoutId}/offers",
  },
  unlinkOfferFromCheckout: {
    name: "unlinkOfferFromCheckout",
    method: "DELETE",
    path: "/checkouts/{checkoutId}/offers/{offerId}",
  },
  listCheckoutOffers: {
    name: "listCheckoutOffers",
    method: "GET",
    path: "/checkouts/{checkoutId}/offers",
  },

  updateCheckoutCustomization: {
    name: "updateCheckoutCustomization",
    method: "PUT",
    path: "/checkouts/{checkoutId}/customization",
  },

  // E-mail de contato do checkout: pedir o código e confirmá-lo (RF-CHK-11).
  requestCheckoutContactEmailVerification: {
    name: "requestCheckoutContactEmailVerification",
    method: "POST",
    path: "/checkouts/{checkoutId}/contact-email/verification",
  },
  confirmCheckoutContactEmail: {
    name: "confirmCheckoutContactEmail",
    method: "POST",
    path: "/checkouts/{checkoutId}/contact-email/confirmation",
  },

  listCheckoutPixels: {
    name: "listCheckoutPixels",
    method: "GET",
    path: "/checkouts/{checkoutId}/pixels",
  },
  replaceCheckoutPixels: {
    name: "replaceCheckoutPixels",
    method: "PUT",
    path: "/checkouts/{checkoutId}/pixels",
  },

  // Gateway é global da conta (RF-GTW-03): um recurso só, sem id no caminho.
  getGatewayConnection: { name: "getGatewayConnection", method: "GET", path: "/gateway" },
  connectGateway: { name: "connectGateway", method: "PUT", path: "/gateway" },
  disconnectGateway: { name: "disconnectGateway", method: "DELETE", path: "/gateway" },

  // Módulo PUB e webhook: as únicas rotas sem sessão. Os controllers não chamam
  // `requirePrincipal` de propósito — o comprador e o gateway não têm conta.
  getPublicCheckout: {
    name: "getPublicCheckout",
    method: "GET",
    path: "/public/checkouts/{publicSlug}",
  },
  createPublicOrder: {
    name: "createPublicOrder",
    method: "POST",
    path: "/public/checkouts/{publicSlug}/orders",
  },
  getPublicOrder: { name: "getPublicOrder", method: "GET", path: "/public/orders/{orderId}" },
  getPublicOrderStatus: {
    name: "getPublicOrderStatus",
    method: "GET",
    path: "/public/orders/{orderId}/status",
  },
  processPaymentWebhook: {
    name: "processPaymentWebhook",
    method: "POST",
    path: "/webhooks/{provider}",
  },

  listOrders: { name: "listOrders", method: "GET", path: "/orders" },

  // Um seletor de período só controla a home inteira (RF-ANL-01): as três rotas
  // recebem o mesmo `from`/`to`.
  getAnalyticsOverview: {
    name: "getAnalyticsOverview",
    method: "GET",
    path: "/analytics/overview",
  },
  getSalesSeries: { name: "getSalesSeries", method: "GET", path: "/analytics/sales-series" },
  getTopCheckouts: { name: "getTopCheckouts", method: "GET", path: "/analytics/top-checkouts" },
} as const satisfies Record<string, RouteDefinition>;

export type RouteName = keyof typeof httpRoutes;

export const routeDefinitions: readonly RouteDefinition[] = Object.values(httpRoutes);
