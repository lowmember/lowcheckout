import { type FormEvent, useState } from "react";

import type { AccountDocumentType, EstimatedRevenue, SellsWhat } from "@/features/account";
import { AccountTypeToggle } from "@/features/signup/components/account-type-toggle";
import { useSignup } from "@/features/signup/hooks/use-signup";
import { validateSignup } from "@/features/signup/lib/validate-signup";
import type { SignupFieldErrors, SignupFormValues } from "@/features/signup/types/signup";
import { maskCnpj, maskCpf, maskPhone, onlyDigits } from "@/shared/lib/masks";
import { Button } from "@/shared/ui/button";
import { ArrowRightIcon, SpinnerIcon } from "@/shared/ui/icons";
import { SelectField } from "@/shared/ui/select-field";
import { TextField } from "@/shared/ui/text-field";

const DOCUMENT_LABELS: Record<AccountDocumentType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
};

const DOCUMENT_PLACEHOLDERS: Record<AccountDocumentType, string> = {
  cpf: "000.000.000-00",
  cnpj: "00.000.000/0000-00",
};

const SELLS_WHAT_LABELS: Record<SellsWhat, string> = {
  infoproduct: "Infoproduto",
  physical: "Produto físico",
  service: "Serviço",
  mentoring: "Mentoria ou consultoria",
  subscription: "Assinatura",
  other: "Outro",
};

const ESTIMATED_REVENUE_LABELS: Record<EstimatedRevenue, string> = {
  up_to_10k: "Até R$ 10.000",
  from_10k_to_50k: "R$ 10.000 a R$ 50.000",
  from_50k_to_100k: "R$ 50.000 a R$ 100.000",
  above_100k: "Acima de R$ 100.000",
};

const SELLS_WHAT_OPTIONS = Object.entries(SELLS_WHAT_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ESTIMATED_REVENUE_OPTIONS = Object.entries(ESTIMATED_REVENUE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const INITIAL_VALUES: SignupFormValues = {
  businessName: "",
  documentType: "cpf",
  document: "",
  phone: "",
  sellsWhat: "infoproduct",
  estimatedRevenue: "up_to_10k",
};

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [values, setValues] = useState<SignupFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<SignupFieldErrors>({});
  const { signup, isSigningUp, hasSignupError, signupErrorMessage } = useSignup({
    onSuccess: () => onSuccess?.(),
  });

  function setField<TField extends keyof SignupFormValues>(
    field: TField,
    value: SignupFormValues[TField],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleDocumentTypeChange(documentType: AccountDocumentType) {
    setValues((current) => ({ ...current, documentType, document: "" }));
    setErrors((current) => ({ ...current, document: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateSignup(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    signup({
      ...values,
      businessName: values.businessName.trim(),
      document: onlyDigits(values.document),
      phone: onlyDigits(values.phone),
    });
  }

  const maskDocument = values.documentType === "cpf" ? maskCpf : maskCnpj;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        <TextField
          label="Nome do negócio"
          placeholder="Como sua marca aparece para o comprador"
          value={values.businessName}
          error={errors.businessName}
          autoComplete="organization"
          maxLength={160}
          onChange={(event) => setField("businessName", event.target.value)}
        />

        <AccountTypeToggle value={values.documentType} onChange={handleDocumentTypeChange} />

        <TextField
          label={DOCUMENT_LABELS[values.documentType]}
          placeholder={DOCUMENT_PLACEHOLDERS[values.documentType]}
          value={values.document}
          error={errors.document}
          inputMode="numeric"
          autoComplete="off"
          hint="Depois do cadastro, o documento não pode mais ser alterado por aqui."
          onChange={(event) => setField("document", maskDocument(event.target.value))}
        />

        <TextField
          label="Telefone"
          placeholder="(00) 00000-0000"
          value={values.phone}
          error={errors.phone}
          inputMode="tel"
          autoComplete="tel"
          onChange={(event) => setField("phone", maskPhone(event.target.value))}
        />

        <SelectField
          label="O que você vende?"
          options={SELLS_WHAT_OPTIONS}
          value={values.sellsWhat}
          onChange={(event) => setField("sellsWhat", event.target.value as SellsWhat)}
        />

        <SelectField
          label="Faturamento estimado"
          options={ESTIMATED_REVENUE_OPTIONS}
          value={values.estimatedRevenue}
          onChange={(event) => setField("estimatedRevenue", event.target.value as EstimatedRevenue)}
        />
      </div>

      {hasSignupError && (
        <p role="alert" className="mt-4 animate-fade-in text-red-600 text-sm">
          {signupErrorMessage}
        </p>
      )}

      <Button type="submit" isLoading={isSigningUp} className="mt-8 w-full justify-between">
        {isSigningUp ? "Criando sua conta..." : "Criar minha conta"}
        {isSigningUp ? (
          <SpinnerIcon className="size-4" />
        ) : (
          <ArrowRightIcon className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1 group-active:translate-x-1.5" />
        )}
      </Button>
    </form>
  );
}
