/** Campos obrigatórios do comprador no MVP (RF-PAG-01). */
export interface BuyerFormValues {
  name: string;
  email: string;
  document: string;
}

export type BuyerFieldErrors = Partial<Record<keyof BuyerFormValues, string>>;

/**
 * Ponte entre o renderer e quem controla o formulário. A página pública passa
 * um controller real; o preview do editor não passa nada e o renderer desenha
 * exatamente os mesmos campos, só que inertes.
 */
export interface CheckoutFormController {
  values: BuyerFormValues;
  errors: BuyerFieldErrors;
  isSubmitting: boolean;
  submitErrorMessage: string | null;
  setField: (field: keyof BuyerFormValues, value: string) => void;
  onSubmit: () => void;
}
