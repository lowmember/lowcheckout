import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { LoginCard, requireGuest } from "@/features/auth";
import { AuthHeader } from "@/shared/ui/auth-header";
import { UserIcon } from "@/shared/ui/icons";

export const Route = createFileRoute("/_auth/entrar")({
  beforeLoad: () => {
    requireGuest();
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <AuthHeader
        icon={<UserIcon className="size-5" />}
        title="Entre na sua conta"
        description="O acesso ao LowCheckout é feito pela sua conta Google. Não existe senha."
      />

      <LoginCard
        onSuccess={(hasCompletedOnboarding) =>
          navigate({ to: hasCompletedOnboarding ? "/" : "/cadastro" })
        }
      />
    </div>
  );
}
