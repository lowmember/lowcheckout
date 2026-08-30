/**
 * Ponto de renovação da sessão, para o interceptor do `httpClient`.
 *
 * Renovar exige saber trocar o refresh token por um par novo e gravar a sessão
 * — as duas coisas moram em `features/auth`, que `shared/` não pode importar
 * (a direção é `routes → features → shared`). Então o slice **registra** aqui a
 * função que sabe fazer isso, e o composition root (`app/`) é quem liga os dois
 * lados. Sem registro, o interceptor simplesmente não tenta renovar.
 */

/** Devolve o novo access token, ou `null` se a sessão não pôde ser renovada. */
export type SessionRefresher = () => Promise<string | null>;

let refresher: SessionRefresher | null = null;

/** Chamadas concorrentes compartilham a mesma renovação: o refresh token é
 * rotacionado pela API, e duas trocas em paralelo invalidariam uma à outra. */
let inFlight: Promise<string | null> | null = null;

export function registerSessionRefresher(sessionRefresher: SessionRefresher) {
  refresher = sessionRefresher;
}

export function refreshCurrentSession(): Promise<string | null> {
  if (!refresher) {
    return Promise.resolve(null);
  }

  if (!inFlight) {
    inFlight = refresher().finally(() => {
      inFlight = null;
    });
  }

  return inFlight;
}
