import { useState } from "react";

import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { CopyButton } from "@/shared/ui/copy-button";
import { Dialog } from "@/shared/ui/dialog";
import { AlertTriangleIcon, MailIcon } from "@/shared/ui/icons";

/** Deleção de conta não é self-service no escopo atual: passa pelo suporte. */
const SUPPORT_EMAIL = "produtor@lowmember.com";
const SUPPORT_SUBJECT = "Solicitação de exclusão de conta";

function buildSupportBody(businessName: string) {
  return [
    "Olá, time LowCheckout.",
    "",
    `Quero solicitar a exclusão definitiva da conta${businessName ? ` de "${businessName}"` : ""}.`,
    "Estou ciente de que produtos, ofertas, checkouts e credenciais de gateway deixam de existir",
    "e que as URLs públicas param de responder.",
    "",
    "Obrigado!",
  ].join("\n");
}

interface AccountDangerZoneProps {
  /** Nome do negócio, usado só para pré-preencher o modelo de e-mail. */
  businessName?: string;
}

export function AccountDangerZone({ businessName = "" }: AccountDangerZoneProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const body = buildSupportBody(businessName);
  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    SUPPORT_SUBJECT,
  )}&body=${encodeURIComponent(body)}`;

  return (
    <Card className="border-red-200">
      <CardHeader
        title="Danger zone"
        description="Ações que interrompem suas vendas. A exclusão é feita pelo nosso time."
      />

      <CardBody>
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
          <Button variant="danger" size="sm" onClick={() => setIsDialogOpen(true)}>
            Deletar
          </Button>
        </div>
      </CardBody>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Solicite a exclusão ao suporte"
        description="A exclusão de conta é feita pelo nosso time, não pelo painel."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsDialogOpen(false)}>
              Fechar
            </Button>
            <Button size="sm" onClick={() => window.open(mailtoUrl, "_self")}>
              <MailIcon className="size-4" />
              Abrir no e-mail
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3.5 py-3">
            <div className="min-w-0">
              <p className="font-medium text-neutral-700 text-xs">E-mail de suporte</p>
              <p className="mt-0.5 break-all font-medium text-neutral-900 text-sm">
                {SUPPORT_EMAIL}
              </p>
            </div>
            <CopyButton value={SUPPORT_EMAIL} label="Copiar e-mail" />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-medium text-neutral-700 text-xs">Modelo de envio</p>
              <CopyButton value={`${SUPPORT_SUBJECT}\n\n${body}`} label="Copiar modelo" />
            </div>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-3 font-sans text-neutral-600 text-xs leading-relaxed">
              {`Assunto: ${SUPPORT_SUBJECT}\n\n${body}`}
            </pre>
          </div>

          <p className="text-neutral-500 text-xs leading-relaxed">
            Respondemos confirmando a exclusão. Enquanto isso, nada é apagado.
          </p>
        </div>
      </Dialog>
    </Card>
  );
}
