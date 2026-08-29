import { adaptLambdaRoute } from "@/infra/http/lambda/lambda-route.adapter";

export const handler = adaptLambdaRoute("listCheckoutPixels");
