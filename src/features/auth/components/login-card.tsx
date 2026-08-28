import { useState } from "react";

import { useSession } from "@/features/auth/hooks/use-session";
import { getApiErrorMessage } from "@/shared/api/get-error-message";
import { Button } from "@/shared/ui/button";
import { GoogleIcon } from "@/shared/ui/icons";

interface LoginCardProps {
  /** Recebe se a conta já concluiu o onboarding, para a rota decidir o destino. */
  onSuccess: (hasCompletedOnboarding: boolean) => void;
}

export function LoginCard({ onSuccess }: LoginCardProps) {
  const { signIn } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignIn() {
    setIsSigningIn(true);
    setErrorMessage(null);

    try {
      const session = await signIn();
      onSuccess(session.onboardingCompletedAt !== null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível entrar. Tente novamente."));
      setIsSigningIn(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button
        variant="secondary"
        className="w-full gap-3"
        isLoading={isSigningIn}
        onClick={() => void handleSignIn()}
      >
        <GoogleIcon className="size-[18px]" />
        Entrar com Google
      </Button>

      {errorMessage && (
        <p role="alert" className="animate-fade-in text-center text-red-600 text-sm">
          {errorMessage}
        </p>
      )}

      <p className="text-center text-neutral-500 text-xs leading-relaxed">
        Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade do LowCheckout.
      </p>

      <div className="flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-3">
        <span className="mt-0.5 inline-flex size-1.5 shrink-0 rounded-full bg-amber-400" />
        <p className="text-neutral-500 text-xs leading-relaxed">
          <span className="font-medium text-neutral-700">Sessão de desenvolvimento.</span> Enquanto
          o login Google não entra, este botão provisiona a conta de desenvolvimento na API. A rota
          que faz isso não existe em produção.
        </p>
      </div>
    </div>
  );
}
