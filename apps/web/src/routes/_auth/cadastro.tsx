import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { requireSession, useSession } from "@/features/auth";
import { SignupForm } from "@/features/signup";
import { AuthHeader } from "@/shared/ui/auth-header";
import { ListDetailsIcon } from "@/shared/ui/icons";

export const Route = createFileRoute("/_auth/cadastro")({
  beforeLoad: () => {
    requireSession();
  },
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { completeOnboarding } = useSession();

  return (
    <div className="space-y-8">
      <AuthHeader
        icon={<ListDetailsIcon className="size-5" />}
        title="Complete seu cadastro!"
        description="Precisamos de mais algumas informações antes de você começar."
      />

      <SignupForm
        onSuccess={() => {
          completeOnboarding();
          navigate({ to: "/" });
        }}
      />
    </div>
  );
}
