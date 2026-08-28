export type CheckoutStatus = "draft" | "active" | "paused" | "archived";

export interface Checkout {
  id: string;
  name: string;
  slug: string;
  status: CheckoutStatus;
  priceInCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListCheckoutsParams {
  page?: number;
  perPage?: number;
  status?: CheckoutStatus;
  search?: string;
}

export interface CreateCheckoutInput {
  name: string;
  priceInCents: number;
  currency: string;
}

export interface UpdateCheckoutInput extends Partial<CreateCheckoutInput> {
  status?: CheckoutStatus;
}
