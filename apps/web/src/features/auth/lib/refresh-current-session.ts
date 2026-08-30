import { refreshSession } from "@/features/auth/api/auth.api";
import { toSession } from "@/features/auth/lib/session";
import { getSession, setSession } from "@/features/auth/lib/session-store";
import type { SessionRefresher } from "@/shared/api/session-refresh";

/**
 * Troca o refresh token guardado por uma sessão nova (RF-AUTH-03).
 *
 * É o que o interceptor do `httpClient` chama ao receber 401. A API rotaciona o
 * refresh token, então a sessão inteira é substituída — guardar só o access
 * token novo deixaria para trás um refresh token já revogado. Falhou a
 * renovação, a sessão é derrubada: quem estiver numa rota do painel cai no
 * guarda de `/entrar` no próximo passo de navegação.
 */
export const refreshCurrentSession: SessionRefresher = async () => {
  const refreshToken = getSession()?.refreshToken;

  if (!refreshToken) {
    return null;
  }

  try {
    const session = toSession(await refreshSession(refreshToken));
    setSession(session);

    return session.accessToken;
  } catch {
    setSession(null);
    return null;
  }
};
