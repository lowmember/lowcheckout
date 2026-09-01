import { type FormEvent, useEffect, useState } from "react";

import { useCheckoutContactEmail } from "@/features/checkouts/hooks/use-checkout-contact-email";
import type { Checkout } from "@/features/checkouts/types/checkout";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { CheckCircleIcon, MailIcon } from "@/shared/ui/icons";
import { TextField } from "@/shared/ui/text-field";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CheckoutContactEmailCardProps {
  checkout: Checkout;
}

/**
 * E-mail de contato do checkout (RF-CHK-11). Ele mora aqui, e não na conta,
 * porque cada checkout costuma ser uma campanha com um responsável — e só
 * aparece para o comprador depois de confirmado por código.
 */
export function CheckoutContactEmailCard({ checkout }: CheckoutContactEmailCardProps) {
  const {
    requestCode,
    isRequestingCode,
    requestCodeErrorMessage,
    confirmCode,
    isConfirmingCode,
    confirmCodeErrorMessage,
    resetConfirmCode,
  } = useCheckoutContactEmail({ checkoutId: checkout.id });

  const [email, setEmail] = useState(checkout.contactEmail ?? "");
  const [emailError, setEmailError] = useState<string>();
  const [code, setCode] = useState("");

  useEffect(() => {
    setEmail(checkout.contactEmail ?? "");
  }, [checkout.contactEmail]);

  const isAwaitingConfirmation = Boolean(checkout.pendingContactEmail);

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = email.trim();

    if (!EMAIL_PATTERN.test(trimmed)) {
      setEmailError("E-mail inválido.");
      return;
    }

    setEmailError(undefined);
    setCode("");
    resetConfirmCode();
    await requestCode(trimmed).catch(() => undefined);
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await confirmCode(code.trim()).catch(() => undefined);
    setCode("");
  }

  return (
    <Card>
      <CardHeader
        title="E-mail de contato"
        description="Exibido ao comprador na página pública deste checkout."
        action={
          checkout.contactEmail ? (
            <Badge tone="success">
              <CheckCircleIcon className="size-3.5" />
              Confirmado
            </Badge>
          ) : (
            <Badge tone="neutral">Não definido</Badge>
          )
        }
      />

      <CardBody className="space-y-4">
        <form onSubmit={handleRequest} noValidate className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <TextField
              label="Endereço"
              type="email"
              value={email}
              error={emailError}
              autoComplete="email"
              placeholder="suporte@seunegocio.com"
              hint={
                checkout.contactEmail
                  ? "Trocar o endereço exige uma nova confirmação por código."
                  : "Enviamos um código para confirmar que o endereço é seu."
              }
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <Button type="submit" size="sm" className="mb-6" isLoading={isRequestingCode}>
            <MailIcon className="size-4" />
            {isAwaitingConfirmation ? "Reenviar código" : "Enviar código"}
          </Button>
        </form>

        {requestCodeErrorMessage && (
          <p role="alert" className="animate-fade-in text-red-600 text-sm">
            {requestCodeErrorMessage}
          </p>
        )}

        {isAwaitingConfirmation && (
          <form
            onSubmit={handleConfirm}
            noValidate
            className="animate-fade-in space-y-3 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3.5"
          >
            <p className="text-neutral-600 text-sm leading-relaxed">
              Enviamos um código de 6 dígitos para{" "}
              <strong className="text-neutral-900">{checkout.pendingContactEmail}</strong>. Ele vale
              por 15 minutos.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                aria-label="Código de confirmação"
                className="h-10 w-32 rounded-lg border border-neutral-200 bg-white px-3.5 text-center font-medium text-neutral-900 text-sm tracking-[0.3em] outline-none transition-colors focus:border-neutral-900"
              />
              <Button
                type="submit"
                size="sm"
                disabled={code.length !== 6}
                isLoading={isConfirmingCode}
              >
                Confirmar
              </Button>
            </div>

            {confirmCodeErrorMessage && (
              <p role="alert" className="animate-fade-in text-red-600 text-sm">
                {confirmCodeErrorMessage}
              </p>
            )}
          </form>
        )}
      </CardBody>
    </Card>
  );
}
