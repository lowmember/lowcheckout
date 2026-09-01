import { type FormEvent, useEffect, useState } from "react";

import { useGateway } from "@/features/gateway/hooks/use-gateway";
import type { GatewayCatalogEntry } from "@/features/gateway/lib/gateway-catalog";
import type { GatewayFieldErrors } from "@/features/gateway/types/gateway";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Dialog } from "@/shared/ui/dialog";
import { AlertTriangleIcon, PlugIcon } from "@/shared/ui/icons";
import { TextField } from "@/shared/ui/text-field";

interface FormValues {
  clientId: string;
  clientSecret: string;
  pixKey: string;
}

const EMPTY_VALUES: FormValues = { clientId: "", clientSecret: "", pixKey: "" };

interface GatewayConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gateway: GatewayCatalogEntry;
}

/** Configuração do gateway: credenciais e chave PIX, sem escolha de ambiente. */
export function GatewayConnectionDialog({
  isOpen,
  onClose,
  gateway,
}: GatewayConnectionDialogProps) {
  const {
    gateway: connection,
    isConnected,
    saveGateway,
    isSavingGateway,
    saveGatewayErrorMessage,
    disconnectGateway,
    isDisconnectingGateway,
    disconnectGatewayErrorMessage,
  } = useGateway();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<GatewayFieldErrors>({});
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setValues({ ...EMPTY_VALUES, pixKey: connection?.pixKey ?? "" });
    setErrors({});
  }, [isOpen, connection]);

  function setField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors: GatewayFieldErrors = {};
    if (!values.clientId.trim()) validationErrors.clientId = "Informe o Client ID.";
    if (!values.clientSecret.trim()) validationErrors.clientSecret = "Informe o Client Secret.";
    if (!values.pixKey.trim()) validationErrors.pixKey = "Informe a chave PIX de recebimento.";

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await saveGateway({
      provider: gateway.provider,
      // Toda conta opera em produção: homologação é ambiente nosso, não do produtor.
      environment: "production",
      clientId: values.clientId.trim(),
      clientSecret: values.clientSecret.trim(),
      pixKey: values.pixKey.trim(),
    })
      .then(onClose)
      .catch(() => undefined);
  }

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={`Configurar ${gateway.name}`}
        description="Conecte uma vez: todos os checkouts da conta herdam este gateway."
        footer={
          <>
            {isConnected && (
              <Button
                variant="secondary"
                size="sm"
                className="mr-auto"
                onClick={() => setIsDisconnectOpen(true)}
              >
                Desconectar
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="gateway-form" size="sm" isLoading={isSavingGateway}>
              <PlugIcon className="size-4" />
              {isConnected ? "Substituir credenciais" : "Conectar"}
            </Button>
          </>
        }
      >
        <form id="gateway-form" onSubmit={handleSubmit} noValidate className="space-y-5">
          {connection?.status === "error" && connection.lastError && (
            <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-red-700 text-xs leading-relaxed">
              <AlertTriangleIcon className="mt-px size-4 shrink-0" />
              {connection.lastError}
            </p>
          )}

          <TextField
            label="Client ID"
            value={values.clientId}
            error={errors.clientId}
            autoComplete="off"
            spellCheck={false}
            placeholder={isConnected ? "•••••••• (informe para substituir)" : "Client_Id_..."}
            onChange={(event) => setField("clientId", event.target.value)}
          />

          <TextField
            label="Client Secret"
            type="password"
            value={values.clientSecret}
            error={errors.clientSecret}
            autoComplete="off"
            placeholder={isConnected ? "•••••••• (informe para substituir)" : "Client_Secret_..."}
            hint="As credenciais nunca são exibidas de volta depois de salvas."
            onChange={(event) => setField("clientSecret", event.target.value)}
          />

          <TextField
            label="Chave PIX de recebimento"
            value={values.pixKey}
            error={errors.pixKey}
            spellCheck={false}
            onChange={(event) => setField("pixKey", event.target.value)}
          />

          {(saveGatewayErrorMessage ?? disconnectGatewayErrorMessage) && (
            <p role="alert" className="animate-fade-in text-red-600 text-sm">
              {saveGatewayErrorMessage ?? disconnectGatewayErrorMessage}
            </p>
          )}
        </form>
      </Dialog>

      <ConfirmDialog
        isOpen={isDisconnectOpen}
        title="Desconectar o gateway?"
        description="Suas páginas públicas param de gerar PIX imediatamente."
        confirmLabel="Desconectar"
        isDestructive
        isConfirming={isDisconnectingGateway}
        onCancel={() => setIsDisconnectOpen(false)}
        onConfirm={() =>
          void disconnectGateway()
            .catch(() => undefined)
            .finally(() => {
              setIsDisconnectOpen(false);
              onClose();
            })
        }
      >
        <p className="text-neutral-600 text-sm leading-relaxed">
          Suas vendas param até você conectar de novo. Pedidos pendentes seguem para confirmação ou
          expiração normalmente, e nada do histórico é apagado.
        </p>
      </ConfirmDialog>
    </>
  );
}
