import { refreshCurrentSession } from "@/features/auth";
import { registerSessionRefresher } from "@/shared/api/session-refresh";

/**
 * Liga a renovação de sessão do slice `features/auth` ao interceptor que vive
 * em `shared/api`. O composition root é o único lugar que pode conhecer os dois
 * lados sem inverter a direção de dependência.
 */
export function wireSessionRefresh() {
  registerSessionRefresher(refreshCurrentSession);
}
