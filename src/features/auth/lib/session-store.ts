import type { Session } from "@/features/auth/types/session";
import { setAccessToken, setAccountId } from "@/shared/api/auth-storage";

const SESSION_KEY = "lowcheckout.session";

let listeners = new Set<() => void>();

function readFromStorage(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const candidate = parsed as Partial<Session>;
    if (typeof candidate.accountId !== "string" || !candidate.user) return null;

    return candidate as Session;
  } catch {
    return null;
  }
}

let currentSession: Session | null = readFromStorage();

function syncHttpCredentials(session: Session | null) {
  setAccountId(session?.accountId ?? null);
  setAccessToken(session?.accessToken ?? null);
}

syncHttpCredentials(currentSession);

export function getSession() {
  return currentSession;
}

export function hasSession() {
  return currentSession !== null;
}

export function subscribeToSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners = new Set([...listeners].filter((item) => item !== listener));
  };
}

export function setSession(session: Session | null) {
  currentSession = session;

  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // storage indisponível: a sessão vale só para esta aba.
  }

  syncHttpCredentials(session);
  for (const listener of listeners) listener();
}

export function patchSession(patch: Partial<Session>) {
  if (!currentSession) return;
  setSession({ ...currentSession, ...patch });
}
