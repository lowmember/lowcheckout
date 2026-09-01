function required(name: keyof ImportMetaEnv, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

/**
 * Este app não tem sessão, conta nem OAuth: a única coisa que ele precisa saber
 * do ambiente é onde a API mora. Tudo o mais chega pela URL do checkout.
 */
export const env = {
  apiUrl: required("VITE_API_URL", import.meta.env.VITE_API_URL),
  isDev: import.meta.env.DEV,
} as const;
