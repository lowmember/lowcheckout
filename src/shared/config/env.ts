function required(name: keyof ImportMetaEnv, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  apiUrl: required("VITE_API_URL", import.meta.env.VITE_API_URL),
  isDev: import.meta.env.DEV,
} as const;
