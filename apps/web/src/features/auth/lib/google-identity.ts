/**
 * Carregador do Google Identity Services (GIS).
 *
 * O GIS não vem por npm: é um script hospedado pelo Google, que precisa ser o
 * mesmo em toda a aba (chamar `initialize` duas vezes reconfigura o singleton).
 * Por isso a promessa é memoizada — quem pedir enquanto o script baixa recebe a
 * mesma, e um erro de rede zera o cache para permitir nova tentativa.
 */
const GOOGLE_IDENTITY_SRC = "https://accounts.google.com/gsi/client";

export interface GoogleCredentialResponse {
  /** O id token (JWT) que a API valida em `POST /auth/google`. */
  credential: string;
}

interface GoogleButtonOptions {
  type: "standard";
  theme: "outline" | "filled_blue" | "filled_black";
  size: "large" | "medium" | "small";
  text: "signin_with" | "continue_with";
  shape: "rectangular" | "pill";
  logo_alignment: "left" | "center";
  locale: string;
  /** Em pixels; o GIS aceita no máximo 400. */
  width: number;
}

interface GoogleInitializeConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

export interface GoogleAccountsId {
  initialize(config: GoogleInitializeConfig): void;
  renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let loader: Promise<GoogleAccountsId> | null = null;

export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (loader) return loader;

  loader = new Promise<GoogleAccountsId>((resolve, reject) => {
    const alreadyLoaded = window.google?.accounts.id;

    if (alreadyLoaded) {
      resolve(alreadyLoaded);
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SRC;
    script.async = true;
    script.defer = true;

    script.addEventListener("load", () => {
      const accountsId = window.google?.accounts.id;

      if (accountsId) resolve(accountsId);
      else reject(new Error("O Google Identity Services carregou sem expor `accounts.id`."));
    });

    script.addEventListener("error", () => {
      loader = null;
      script.remove();
      reject(new Error("Não foi possível carregar o login do Google. Verifique sua conexão."));
    });

    document.head.appendChild(script);
  });

  return loader;
}

/**
 * Desliga o login automático da próxima visita. Sem isto, o GIS reautentica o
 * usuário que acabou de sair — o logout do painel pareceria não ter funcionado.
 */
export function disableGoogleAutoSelect() {
  window.google?.accounts.id.disableAutoSelect();
}
