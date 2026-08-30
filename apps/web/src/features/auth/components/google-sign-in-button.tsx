import { useEffect, useRef, useState } from "react";

import { loadGoogleIdentity } from "@/features/auth/lib/google-identity";
import { env } from "@/shared/config/env";

/** Limite do próprio GIS: acima disto ele ignora a largura e usa o padrão. */
const MAX_BUTTON_WIDTH = 400;
const MIN_BUTTON_WIDTH = 200;

interface GoogleSignInButtonProps {
  /** Recebe o id token do Google, pronto para ir a `POST /auth/google`. */
  onCredential: (idToken: string) => void;
  /** Bloqueia novos cliques enquanto a sessão está sendo criada. */
  isDisabled?: boolean;
}

/**
 * Botão oficial do Google, renderizado pelo próprio GIS dentro deste container.
 *
 * Não dá para disparar o popup de id token a partir de um botão nosso: o GIS só
 * o abre a partir do botão que ele mesmo desenha. Daí o container vazio — a
 * aparência aqui é do Google, de propósito.
 */
export function GoogleSignInButton({ onCredential, isDisabled = false }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // O callback vai para o GIS uma vez só, no `initialize`; a ref mantém a
  // versão atual sem precisar reinicializar o singleton a cada render.
  useEffect(() => {
    onCredentialRef.current = onCredential;
  });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    if (!env.googleClientId) {
      setLoadError("Login do Google indisponível: VITE_GOOGLE_CLIENT_ID não foi configurado.");
      return;
    }

    let isActive = true;

    loadGoogleIdentity()
      .then((accountsId) => {
        if (!isActive) return;

        accountsId.initialize({
          client_id: env.googleClientId,
          callback: (response) => onCredentialRef.current(response.credential),
          cancel_on_tap_outside: true,
        });

        accountsId.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          locale: "pt-BR",
          width: resolveButtonWidth(container),
        });

        setIsReady(true);
      })
      .catch((error: unknown) => {
        if (!isActive) return;

        setLoadError(
          error instanceof Error ? error.message : "Não foi possível carregar o login do Google.",
        );
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (loadError) {
    return (
      <p role="alert" className="text-center text-red-600 text-sm">
        {loadError}
      </p>
    );
  }

  return (
    <div className="flex min-h-[44px] justify-center">
      {!isReady && (
        <div className="h-11 w-full animate-pulse rounded-md bg-neutral-100" aria-hidden="true" />
      )}
      <div
        ref={containerRef}
        className={isDisabled ? "pointer-events-none opacity-60" : undefined}
      />
    </div>
  );
}

function resolveButtonWidth(container: HTMLElement) {
  const available = container.parentElement?.offsetWidth ?? container.offsetWidth;

  return Math.round(Math.min(MAX_BUTTON_WIDTH, Math.max(MIN_BUTTON_WIDTH, available)));
}
