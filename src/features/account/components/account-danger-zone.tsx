import { useState } from "react";

import { useAccountDangerZone } from "@/features/account/hooks/use-account-danger-zone";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { CONTROL_CLASSNAME } from "@/shared/ui/field";
import { AlertTriangleIcon } from "@/shared/ui/icons";

const DELETE_CONFIRMATION = "DELETAR";

interface AccountDangerZoneProps {
  onAccountClosed: () => void;
}

export function AccountDangerZone({ onAccountClosed }: AccountDangerZoneProps) {
  const [openDialog, setOpenDialog] = useState<"deactivate" | "delete" | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const {
    deactivate,
    isDeactivating,
    deactivateErrorMessage,
    remove,
    isRemoving,
    removeErrorMessage,
  } = useAccountDangerZone({ onDone: onAccountClosed });

  function closeDialog() {
    setOpenDialog(null);
    setConfirmationText("");
  }

  return (
    <Card className="border-red-200">
      <CardHeader
        title="Danger zone"
        description="Ações que interrompem suas vendas. Todas pedem confirmação."
      />

      <CardBody className="space-y-3">
        {(deactivateErrorMessage ?? removeErrorMessage) && (
          <p role="alert" className="animate-fade-in text-red-600 text-sm">
            {deactivateErrorMessage ?? removeErrorMessage}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 px-4 py-3.5">
          <div className="min-w-0">
            <p className="font-medium text-neutral-900 text-sm">Desativar conta</p>
            <p className="mt-0.5 text-neutral-500 text-xs leading-relaxed">
              Suas páginas públicas param de aceitar novas compras. Nenhum dado é apagado e você
              pode voltar depois.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setOpenDialog("deactivate")}>
            Desativar
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50/50 px-4 py-3.5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-medium text-red-700 text-sm">
              <AlertTriangleIcon className="size-4" />
              Deletar conta
            </p>
            <p className="mt-0.5 text-neutral-600 text-xs leading-relaxed">
              Produtos, ofertas, checkouts e credenciais de gateway deixam de existir. Irreversível.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setOpenDialog("delete")}>
            Deletar
          </Button>
        </div>
      </CardBody>

      <ConfirmDialog
        isOpen={openDialog === "deactivate"}
        title="Desativar sua conta?"
        description="Enquanto estiver desativada, nenhuma página pública sua aceitará novas compras."
        confirmLabel="Desativar conta"
        isConfirming={isDeactivating}
        onConfirm={() => void deactivate().finally(closeDialog)}
        onCancel={closeDialog}
      >
        <p className="text-neutral-600 text-sm leading-relaxed">
          Pedidos pendentes seguem seu curso normal de confirmação ou expiração. Seus dados
          continuam salvos.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={openDialog === "delete"}
        title="Deletar sua conta definitivamente?"
        description="Esta ação não pode ser desfeita pela interface."
        confirmLabel="Deletar para sempre"
        isDestructive
        isConfirming={isRemoving}
        isConfirmDisabled={confirmationText !== DELETE_CONFIRMATION}
        onConfirm={() => void remove().finally(closeDialog)}
        onCancel={closeDialog}
      >
        <div className="space-y-3">
          <p className="text-neutral-600 text-sm leading-relaxed">
            Todas as URLs públicas param de responder e as credenciais do gateway são removidas.
            Para confirmar, digite{" "}
            <strong className="text-neutral-900">{DELETE_CONFIRMATION}</strong> abaixo.
          </p>
          <input
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
            placeholder={DELETE_CONFIRMATION}
            aria-label={`Digite ${DELETE_CONFIRMATION} para confirmar`}
            className={CONTROL_CLASSNAME}
          />
          {confirmationText !== DELETE_CONFIRMATION && (
            <p className="text-neutral-500 text-xs">
              O botão de confirmação só age depois que o texto conferir.
            </p>
          )}
        </div>
      </ConfirmDialog>
    </Card>
  );
}
