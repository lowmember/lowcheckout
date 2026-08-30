/**
 * Guarda as credenciais que o `httpClient` injeta em toda requisição.
 *
 * Fica em `shared/` (e não em `features/auth/`) porque o interceptor precisa lê-las
 * sem inverter a direção de dependência. Quem escreve aqui é o slice `features/auth`.
 */
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ACCOUNT_ID_KEY = "account_id";

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage indisponível (modo privado): a sessão simplesmente não persiste.
  }
}

export function getAccessToken() {
  return read(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  write(ACCESS_TOKEN_KEY, token);
}

/**
 * O refresh token não vai em nenhuma requisição automaticamente: ele é o corpo
 * de `POST /auth/refresh` e só sai daqui quando o access token expira.
 */
export function getRefreshToken() {
  return read(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null) {
  write(REFRESH_TOKEN_KEY, token);
}

export function getAccountId() {
  return read(ACCOUNT_ID_KEY);
}

export function setAccountId(accountId: string | null) {
  write(ACCOUNT_ID_KEY, accountId);
}

export function clearAuthStorage() {
  setAccessToken(null);
  setRefreshToken(null);
  setAccountId(null);
}
