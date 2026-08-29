import { type FormEvent, useEffect, useState } from "react";

import { useMe } from "@/features/account/hooks/use-me";
import { useUpdateAccount } from "@/features/account/hooks/use-update-account";
import { formatDocument, maskPhone, onlyDigits } from "@/shared/lib/masks";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { CONTROL_CLASSNAME, Field } from "@/shared/ui/field";
import { InfoIcon, SpinnerIcon } from "@/shared/ui/icons";
import { TextField } from "@/shared/ui/text-field";

interface FormValues {
  userName: string;
  businessName: string;
  contactEmail: string;
  phone: string;
}

const EMPTY_VALUES: FormValues = {
  userName: "",
  businessName: "",
  contactEmail: "",
  phone: "",
};

interface AccountSettingsFormProps {
  /** Nome e e-mail da sessão, usados enquanto `GET /me` não responde. */
  fallbackName: string;
  fallbackEmail: string;
  onSaved?: (userName: string) => void;
}

export function AccountSettingsForm({
  fallbackName,
  fallbackEmail,
  onSaved,
}: AccountSettingsFormProps) {
  const { account, accountUser, isLoadingMe, hasMeError } = useMe();
  const {
    updateAccount,
    isUpdatingAccount,
    hasUpdateAccountError,
    didUpdateAccount,
    updateAccountErrorMessage,
  } = useUpdateAccount();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [emailError, setEmailError] = useState<string>();

  useEffect(() => {
    setValues({
      userName: accountUser?.name ?? fallbackName,
      businessName: account?.businessName ?? "",
      contactEmail: account?.contactEmail ?? accountUser?.email ?? fallbackEmail,
      phone: account?.phone ? maskPhone(account.phone) : "",
    });
  }, [account, accountUser, fallbackName, fallbackEmail]);

  function setField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = values.contactEmail.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("E-mail inválido.");
      return;
    }

    setEmailError(undefined);

    await updateAccount({
      userName: values.userName.trim(),
      businessName: values.businessName.trim(),
      contactEmail: email,
      phone: onlyDigits(values.phone),
    }).catch(() => undefined);

    onSaved?.(values.userName.trim());
  }

  return (
    <Card>
      <CardHeader
        title="Dados da conta"
        description="Nome e e-mail de contato são editáveis. O documento não."
      />

      <CardBody>
        {isLoadingMe ? (
          <p className="flex items-center gap-2 py-6 text-neutral-500 text-sm">
            <SpinnerIcon className="size-4" />
            Carregando dados da conta...
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {hasMeError && (
              <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-amber-800 text-xs leading-relaxed">
                <InfoIcon className="mt-px size-4 shrink-0" />
                <span>
                  Não foi possível carregar <code>GET /me</code>. Os campos abaixo estão preenchidos
                  com os dados da sessão local.
                </span>
              </p>
            )}

            <TextField
              label="Seu nome"
              value={values.userName}
              autoComplete="name"
              onChange={(event) => setField("userName", event.target.value)}
            />

            <TextField
              label="Nome do negócio"
              value={values.businessName}
              autoComplete="organization"
              onChange={(event) => setField("businessName", event.target.value)}
            />

            <TextField
              label="E-mail de contato"
              type="email"
              value={values.contactEmail}
              error={emailError}
              autoComplete="email"
              hint="Não é o e-mail de login: o acesso continua pelo Google."
              onChange={(event) => setField("contactEmail", event.target.value)}
            />

            <TextField
              label="Telefone"
              value={values.phone}
              inputMode="tel"
              autoComplete="tel"
              onChange={(event) => setField("phone", maskPhone(event.target.value))}
            />

            <Field
              id="account-document"
              label={account?.documentType === "cnpj" ? "CNPJ" : "CPF"}
              hint="Bloqueado para edição. Para alterar, fale com o time do LowCheckout."
            >
              <input
                id="account-document"
                readOnly
                disabled
                value={
                  account?.document && account.documentType
                    ? formatDocument(account.document, account.documentType)
                    : "—"
                }
                className={CONTROL_CLASSNAME}
              />
            </Field>

            {hasUpdateAccountError && (
              <p role="alert" className="animate-fade-in text-red-600 text-sm">
                {updateAccountErrorMessage}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" size="sm" isLoading={isUpdatingAccount}>
                Salvar alterações
              </Button>
              {didUpdateAccount && !hasUpdateAccountError && (
                <span className="animate-fade-in text-emerald-600 text-xs">Alterações salvas.</span>
              )}
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
