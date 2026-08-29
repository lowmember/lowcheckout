import { z } from "zod";

export const authenticateWithGoogleSchema = z.object({
  idToken: z.string().trim().min(1, "Informe o id token do Google"),
});

export const refreshSessionSchema = z.object({
  refreshToken: z.string().trim().min(1, "Informe o refresh token"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().trim().min(1, "Informe o refresh token"),
});

/** Corpo opcional: `POST /auth/dev-session` funciona com `{}` ou sem corpo. */
export const createDevSessionSchema = z.object({
  completeOnboarding: z.boolean().optional(),
});
