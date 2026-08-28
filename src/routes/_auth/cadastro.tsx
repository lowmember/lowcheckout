import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { SignupForm } from "@/features/signup";
import { AuthHeader } from "@/shared/ui/auth-header";
import { ListDetailsIcon } from "@/shared/ui/icons";

export const Route = createFileRoute("/_auth/cadastro")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <AuthHeader
        icon={<ListDetailsIcon className="size-5" />}
        title="Complete seu cadastro!"
        description="Precisamos de mais algumas informações antes de você começar."
      />

      <SignupForm onSuccess={() => navigate({ to: "/checkouts" })} />
    </div>
  );
}
