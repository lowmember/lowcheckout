import {
  makeCompleteOnboardingController,
  makeDeactivateAccountController,
  makeDeleteAccountController,
  makeUpdateAccountController,
} from "@/infra/di/factories/account-controllers.factory";
import {
  makeGetAnalyticsOverviewController,
  makeGetSalesSeriesController,
  makeGetTopCheckoutsController,
} from "@/infra/di/factories/analytics-controllers.factory";
import {
  makeAuthenticateWithGoogleController,
  makeCreateDevSessionController,
  makeGetMeController,
  makeLogoutController,
  makeRefreshSessionController,
} from "@/infra/di/factories/auth-controllers.factory";
import {
  makeConfirmCheckoutContactEmailController,
  makeCreateCheckoutController,
  makeDeleteCheckoutController,
  makeGetCheckoutController,
  makeLinkOfferToCheckoutController,
  makeListCheckoutOffersController,
  makeListCheckoutPixelsController,
  makeListCheckoutsController,
  makeReplaceCheckoutPixelsController,
  makeRequestCheckoutContactEmailVerificationController,
  makeUnlinkOfferFromCheckoutController,
  makeUpdateCheckoutController,
  makeUpdateCheckoutCustomizationController,
} from "@/infra/di/factories/checkout-controllers.factory";
import {
  makeConnectGatewayController,
  makeDisconnectGatewayController,
  makeGetGatewayConnectionController,
} from "@/infra/di/factories/gateway-controllers.factory";
import { makeHealthController } from "@/infra/di/factories/health-controller.factory";
import {
  makeListNotificationsController,
  makeMarkAllNotificationsAsReadController,
  makeMarkNotificationAsReadController,
} from "@/infra/di/factories/notification-controllers.factory";
import {
  makeCreateOfferController,
  makeDeleteOfferController,
  makeGetOfferController,
  makeListOffersController,
  makeUpdateOfferController,
} from "@/infra/di/factories/offer-controllers.factory";
import { makeListOrdersController } from "@/infra/di/factories/order-controllers.factory";
import {
  makeCreateProductController,
  makeDeleteProductController,
  makeGetProductController,
  makeListProductsController,
  makeUpdateProductController,
} from "@/infra/di/factories/product-controllers.factory";
import {
  makeCreatePublicOrderController,
  makeGetPublicCheckoutController,
  makeGetPublicOrderController,
  makeGetPublicOrderStatusController,
  makeProcessPaymentWebhookController,
} from "@/infra/di/factories/public-controllers.factory";
import { makeCreateImageUploadController } from "@/infra/di/factories/upload-controllers.factory";
import type { HttpRouteRegistry } from "@/presentation/http/protocols/http-route";
import { httpRoutes, type RouteName } from "@/presentation/http/routes/http-routes";
import { InMemoryHttpRouteRegistry } from "@/presentation/http/routes/in-memory-route-registry";

/**
 * Liga cada rota declarada pela apresentação ao seu controller. É aqui — e só
 * aqui — que a superfície HTTP encontra as implementações concretas.
 */
const controllerFactories = {
  health: makeHealthController,

  authenticateWithGoogle: makeAuthenticateWithGoogleController,
  refreshSession: makeRefreshSessionController,
  logout: makeLogoutController,
  createDevSession: makeCreateDevSessionController,

  getMe: makeGetMeController,
  completeOnboarding: makeCompleteOnboardingController,
  updateAccount: makeUpdateAccountController,
  deactivateAccount: makeDeactivateAccountController,
  deleteAccount: makeDeleteAccountController,

  listProducts: makeListProductsController,
  getProduct: makeGetProductController,
  createProduct: makeCreateProductController,
  updateProduct: makeUpdateProductController,
  deleteProduct: makeDeleteProductController,

  createImageUpload: makeCreateImageUploadController,

  listOffers: makeListOffersController,
  createOffer: makeCreateOfferController,
  getOffer: makeGetOfferController,
  updateOffer: makeUpdateOfferController,
  deleteOffer: makeDeleteOfferController,

  listCheckouts: makeListCheckoutsController,
  getCheckout: makeGetCheckoutController,
  createCheckout: makeCreateCheckoutController,
  updateCheckout: makeUpdateCheckoutController,
  deleteCheckout: makeDeleteCheckoutController,

  linkOfferToCheckout: makeLinkOfferToCheckoutController,
  unlinkOfferFromCheckout: makeUnlinkOfferFromCheckoutController,
  listCheckoutOffers: makeListCheckoutOffersController,

  updateCheckoutCustomization: makeUpdateCheckoutCustomizationController,

  requestCheckoutContactEmailVerification: makeRequestCheckoutContactEmailVerificationController,
  confirmCheckoutContactEmail: makeConfirmCheckoutContactEmailController,

  listCheckoutPixels: makeListCheckoutPixelsController,
  replaceCheckoutPixels: makeReplaceCheckoutPixelsController,

  getGatewayConnection: makeGetGatewayConnectionController,
  connectGateway: makeConnectGatewayController,
  disconnectGateway: makeDisconnectGatewayController,

  getPublicCheckout: makeGetPublicCheckoutController,
  createPublicOrder: makeCreatePublicOrderController,
  getPublicOrder: makeGetPublicOrderController,
  getPublicOrderStatus: makeGetPublicOrderStatusController,
  processPaymentWebhook: makeProcessPaymentWebhookController,

  listOrders: makeListOrdersController,

  listNotifications: makeListNotificationsController,
  markNotificationAsRead: makeMarkNotificationAsReadController,
  markAllNotificationsAsRead: makeMarkAllNotificationsAsReadController,

  getAnalyticsOverview: makeGetAnalyticsOverviewController,
  getSalesSeries: makeGetSalesSeriesController,
  getTopCheckouts: makeGetTopCheckoutsController,
} as const satisfies Record<
  RouteName,
  () => import("@/presentation/http/protocols/http").Controller
>;

let registry: HttpRouteRegistry | undefined;

export function getHttpRouteRegistry(): HttpRouteRegistry {
  if (registry) {
    return registry;
  }

  const created = new InMemoryHttpRouteRegistry();

  for (const name of Object.keys(httpRoutes) as RouteName[]) {
    created.register({ ...httpRoutes[name], resolveController: controllerFactories[name] });
  }

  registry = created;

  return registry;
}
