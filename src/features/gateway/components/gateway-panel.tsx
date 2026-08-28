import { type FormEvent, useEffect, useState } from "react";

import { useGateway } from "@/features/gateway/hooks/use-gateway";
import type { GatewayEnvironment, GatewayFieldErrors } from "@/features/gateway/types/gateway";
import { formatDateTime } from "@/shared/lib/format-date";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { AlertTriangleIcon, InfoIcon, PlugIcon } from "@/shared/ui/icons";
import { SelectField } from "@/shared/ui/select-field";
import { Skeleton } from "@/shared/ui/skeleton";
import { TextField } from "@/shared/ui/text-field";

const ENVIRONMENT_OPTIONS = [
  { value: "sandbox", label: "Sandbox (homologação)" },
  { value: "production", label: "Produção" },
];

interface FormValues {
  environment: GatewayEnvironment;
  clientId: string;
  clientSecret: string;
  pixKey: string;
}

const EMPTY_VALUES: FormValues = {
  environment: "sandbox",
  clientId: "",
  clientSecret: "",
  pixKey: "",
};

export function GatewayPanel() {
  const {
    gateway,
    isConnected,
    isLoadingGateway,
    hasGatewayError,
    saveGateway,
    isSavingGateway,
    didSaveGateway,
    saveGatewayErrorMessage,
    disconnectGateway,
    isDisconnectingGateway,
    disconnectGatewayErrorMessage,
  } = useGateway();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<GatewayFieldErrors>({});
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);

  useEffect(() => {
    setValues((current) => ({
      ...current,
      environment: gateway?.environment ?? "sandbox",
      pixKey: gateway?.pixKey ?? "",
    }));
  }, [gateway]);

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
      provider: "efibank",
      environment: values.environment,
      clientId: values.clientId.trim(),
      clientSecret: values.clientSecret.trim(),
      pixKey: values.pixKey.trim(),
    }).catch(() => undefined);

    setValues((current) => ({ ...current, clientId: "", clientSecret: "" }));
  }

  return (
    <Card>
      <CardHeader
        title="EfiBank · PIX"
        description="Conecte uma vez: todos os checkouts da conta herdam este gateway."
        action={
          isLoadingGateway ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <Badge tone={isConnected ? "success" : "neutral"}>
              {isConnected ? "Conectado" : "Não conectado"}
            </Badge>
          )
        }
      />

      <CardBody className="space-y-5">
        {hasGatewayError && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-amber-800 text-xs leading-relaxed">
            <InfoIcon className="mt-px size-4 shrink-0" />
            Não foi possível consultar o estado do gateway. O formulário abaixo continua disponível
            para conectar.
          </p>
        )}

        {gateway?.status === "error" && gateway.lastError && (
          <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-red-700 text-xs leading-relaxed">
            <AlertTriangleIcon className="mt-px size-4 shrink-0" />
            {gateway.lastError}
          </p>
        )}

        {isConnected && gateway?.connectedAt && (
          <p className="text-neutral-500 text-xs">
            Conectado em {formatDateTime(gateway.connectedAt)} · ambiente{" "}
            {gateway.environment === "production" ? "produção" : "sandbox"}.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <SelectField
            label="Ambiente"
            options={ENVIRONMENT_OPTIONS}
            value={values.environment}
            onChange={(event) => setField("environment", event.target.value)}
          />

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

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="sm" isLoading={isSavingGateway}>
              <PlugIcon className="size-4" />
              {isConnected ? "Substituir credenciais" : "Conectar gateway"}
            </Button>

            {isConnected && (
              <Button variant="secondary" size="sm" onClick={() => setIsDisconnectOpen(true)}>
                Desconectar
              </Button>
            )}

            {didSaveGateway && !saveGatewayErrorMessage && (
              <span className="animate-fade-in text-emerald-600 text-xs">Credenciais salvas.</span>
            )}
          </div>
        </form>
      </CardBody>

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
            .finally(() => setIsDisconnectOpen(false))
        }
      >
        <p className="text-neutral-600 text-sm leading-relaxed">
          Suas vendas param até você conectar de novo. Pedidos pendentes seguem para confirmação ou
          expiração normalmente, e nada do histórico é apagado.
        </p>
      </ConfirmDialog>
    </Card>
  );
}
