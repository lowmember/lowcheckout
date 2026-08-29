export const PIXEL_PROVIDERS = ["facebook", "utmify"] as const;

export type PixelProvider = (typeof PIXEL_PROVIDERS)[number];
