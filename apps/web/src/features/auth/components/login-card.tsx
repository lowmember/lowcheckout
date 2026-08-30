import { useState } from "react";

import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { useSession } from "@/features/auth/hooks/use-session";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface LoginCardProps {
  /** Recebe se a conta já concluiu o onboarding, para a rota decidir o destino. */
  onSuccess: (hasCompletedOnboarding: boolean) => void;
}

export function LoginCard({ onSuccess }: LoginCardProps) {
  const { signIn } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCredential(idToken: string) {
    setIsSigningIn(true);
    setErrorMessage(null);

    try {
      const session = await signIn(idToken);
      onSuccess(session.onboardingCompletedAt !== null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível entrar. Tente novamente."));
      setIsSigningIn(false);
    }
  }

  return (
    <div className="space-y-6">
      <GoogleSignInButton
        isDisabled={isSigningIn}
        onCredential={(idToken) => void handleCredential(idToken)}
      />

      {errorMessage && (
        <p role="alert" className="animate-fade-in text-center text-red-600 text-sm">
          {errorMessage}
        </p>
      )}

      <p className="text-center text-neutral-500 text-xs leading-relaxed">
        Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade do LowCheckout.
      </p>
    </div>
  );
}
