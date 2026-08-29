import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AccountDangerZone, AccountSettingsForm, accountQueries } from "@/features/account";
import { useSession } from "@/features/auth";
import { PageHeader } from "@/shared/ui/page-header";

export const Route = createFileRoute("/_app/configuracoes/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(accountQueries.me()).catch(() => null),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, signOut, updateSessionUser } = useSession();

  function handleAccountClosed() {
    signOut();
    queryClient.clear();
    navigate({ to: "/entrar" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Dados da conta e ações sensíveis. O gateway fica em Integrações."
      />

      <div className="max-w-2xl space-y-5">
        <AccountSettingsForm
          fallbackName={session?.user.name ?? ""}
          fallbackEmail={session?.user.email ?? ""}
          onSaved={updateSessionUser}
        />

        <AccountDangerZone onAccountClosed={handleAccountClosed} />
      </div>
    </div>
  );
}
