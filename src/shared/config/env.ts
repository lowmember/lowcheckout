function required(name: keyof ImportMetaEnv, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function optional(value: string | undefined, fallback: string) {
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  apiUrl: required("VITE_API_URL", import.meta.env.VITE_API_URL),
  /** Base das URLs públicas de checkout (RF-CHK-05). */
  publicCheckoutUrl: optional(
    import.meta.env.VITE_PUBLIC_CHECKOUT_URL,
    typeof window === "undefined" ? "http://localhost:5173" : window.location.origin,
  ),
  isDev: import.meta.env.DEV,
} as const;
