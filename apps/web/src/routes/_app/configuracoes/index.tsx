import { createFileRoute } from "@tanstack/react-router";

import { AccountDangerZone, AccountSettingsForm, accountQueries, useMe } from "@/features/account";
import { useSession } from "@/features/auth";
import { PageHeader } from "@/shared/ui/page-header";

export const Route = createFileRoute("/_app/configuracoes/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(accountQueries.me()).catch(() => null),
  component: SettingsPage,
});

function SettingsPage() {
  const { session, updateSessionUser } = useSession();
  const { account } = useMe();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Dados da conta e ações sensíveis. O gateway fica em Gateways."
      />

      <div className="max-w-2xl space-y-5">
        <AccountSettingsForm
          fallbackName={session?.user.name ?? ""}
          fallbackEmail={session?.user.email ?? ""}
          onSaved={updateSessionUser}
        />

        <AccountDangerZone businessName={account?.businessName ?? ""} />
      </div>
    </div>
  );
}
