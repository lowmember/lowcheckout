import { type FormEvent, useState } from "react";

import { AccountTypeToggle } from "@/features/signup/components/account-type-toggle";
import { useSignup } from "@/features/signup/hooks/use-signup";
import { maskCnpj, maskCpf, maskPhone, onlyDigits } from "@/features/signup/lib/masks";
import { validateSignup } from "@/features/signup/lib/validate-signup";
import type {
  AccountType,
  ProductType,
  RevenueRange,
  SignupFieldErrors,
  SignupFormValues,
} from "@/features/signup/types/signup";
import { Button } from "@/shared/ui/button";
import { ArrowRightIcon, SpinnerIcon } from "@/shared/ui/icons";
import { SelectField } from "@/shared/ui/select-field";
import { TextField } from "@/shared/ui/text-field";

const DOCUMENT_LABELS: Record<AccountType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
};

const DOCUMENT_PLACEHOLDERS: Record<AccountType, string> = {
  cpf: "000.000.000-00",
  cnpj: "00.000.000/0000-00",
};

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  infoproduct: "Infoproduto",
  physical: "Produto físico",
  service: "Serviço",
  mentoring: "Mentoria ou consultoria",
  subscription: "Assinatura",
  other: "Outro",
};

const REVENUE_RANGE_LABELS: Record<RevenueRange, string> = {
  up_to_1k: "Até R$ 1.000",
  from_1k_to_5k: "R$ 1.000 a R$ 5.000",
  from_5k_to_20k: "R$ 5.000 a R$ 20.000",
  from_20k_to_50k: "R$ 20.000 a R$ 50.000",
  from_50k_to_100k: "R$ 50.000 a R$ 100.000",
  above_100k: "Acima de R$ 100.000",
};

const PRODUCT_TYPE_OPTIONS = Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const REVENUE_RANGE_OPTIONS = Object.entries(REVENUE_RANGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const INITIAL_VALUES: SignupFormValues = {
  accountType: "cpf",
  document: "",
  phone: "",
  productType: "infoproduct",
  revenueRange: "from_1k_to_5k",
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

  function handleAccountTypeChange(accountType: AccountType) {
    setValues((current) => ({ ...current, accountType, document: "" }));
    setErrors((current) => ({ ...current, document: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateSignup(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    signup({
      ...values,
      document: onlyDigits(values.document),
      phone: onlyDigits(values.phone),
    });
  }

  const maskDocument = values.accountType === "cpf" ? maskCpf : maskCnpj;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        <AccountTypeToggle value={values.accountType} onChange={handleAccountTypeChange} />

        <TextField
          label={DOCUMENT_LABELS[values.accountType]}
          placeholder={DOCUMENT_PLACEHOLDERS[values.accountType]}
          value={values.document}
          error={errors.document}
          inputMode="numeric"
          autoComplete="off"
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
          options={PRODUCT_TYPE_OPTIONS}
          value={values.productType}
          onChange={(event) => setField("productType", event.target.value as ProductType)}
        />

        <SelectField
          label="Faturamento estimado"
          options={REVENUE_RANGE_OPTIONS}
          value={values.revenueRange}
          onChange={(event) => setField("revenueRange", event.target.value as RevenueRange)}
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
