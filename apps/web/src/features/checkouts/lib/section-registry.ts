import { createLocalId } from "@/features/checkouts/lib/create-id";
import {
  readBoolean,
  readInteger,
  readItemId,
  readList,
  readOption,
  readString,
  toPropsRecord,
} from "@/features/checkouts/lib/schema-normalizers";
import type {
  BenefitItem,
  CheckoutSection,
  CheckoutSectionPropsMap,
  CheckoutSectionType,
  FaqItem,
  FooterLinkItem,
  TestimonialItem,
  TextAlignment,
} from "@/features/checkouts/types/checkout-schema";

/* — Descritores de propriedade —
 *
 * O painel de propriedades do editor é gerado a partir desta lista: ele não
 * conhece nenhuma seção específica. Adicionar uma seção nova é adicionar uma
 * entrada aqui; nenhuma tela precisa mudar. É também o contrato que uma
 * geração por IA teria de respeitar no futuro.
 */

export interface PropertyOption {
  value: string;
  label: string;
}

interface PropertyFieldBase {
  key: string;
  label: string;
  hint?: string;
}

export interface TextPropertyField extends PropertyFieldBase {
  kind: "text" | "textarea" | "image";
  placeholder?: string;
  maxLength?: number;
}

export interface NumberPropertyField extends PropertyFieldBase {
  kind: "number";
  min: number;
  max: number;
  suffix?: string;
}

export interface SwitchPropertyField extends PropertyFieldBase {
  kind: "switch";
}

export interface SelectPropertyField extends PropertyFieldBase {
  kind: "select";
  options: PropertyOption[];
}

export type LeafPropertyField =
  | TextPropertyField
  | NumberPropertyField
  | SwitchPropertyField
  | SelectPropertyField;

export interface ListPropertyField extends PropertyFieldBase {
  kind: "list";
  /** Campo do item usado como título na lista dobrável. */
  titleKey: string;
  /** Nome de um item só, no singular: usado na árvore de camadas. */
  itemLabel: string;
  addLabel: string;
  maxItems: number;
  itemFields: LeafPropertyField[];
  createItem: () => Record<string, unknown>;
}

export type PropertyField = LeafPropertyField | ListPropertyField;

export interface SectionDefinition<TType extends CheckoutSectionType = CheckoutSectionType> {
  type: TType;
  label: string;
  description: string;
  /** A página pública não funciona sem estas — não podem ser removidas. */
  isRequired: boolean;
  allowMultiple: boolean;
  createProps: () => CheckoutSectionPropsMap[TType];
  normalizeProps: (raw: Record<string, unknown>) => CheckoutSectionPropsMap[TType];
  fields: PropertyField[];
}

const ALIGNMENT_OPTIONS: PropertyOption[] = [
  { value: "left", label: "À esquerda" },
  { value: "center", label: "Centralizado" },
];

const ALIGNMENTS: TextAlignment[] = ["left", "center"];

function benefit(title: string, description: string): BenefitItem {
  return { id: createLocalId("benefit"), title, description };
}

function testimonial(name: string, role: string, quote: string): TestimonialItem {
  return { id: createLocalId("testimonial"), name, role, quote, rating: 5 };
}

function faq(question: string, answer: string): FaqItem {
  return { id: createLocalId("faq"), question, answer };
}

function footerLink(label: string, url: string): FooterLinkItem {
  return { id: createLocalId("link"), label, url };
}

const hero: SectionDefinition<"hero"> = {
  type: "hero",
  label: "Hero",
  description: "Banner de topo com título e chamada.",
  isRequired: false,
  allowMultiple: false,
  createProps: () => ({
    eyebrow: "",
    title: "Garanta seu acesso agora",
    subtitle: "Pagamento via PIX com liberação imediata.",
    imageUrl: "",
    alignment: "center",
    showBanner: true,
  }),
  normalizeProps: (raw) => ({
    eyebrow: readString(raw, "eyebrow", ""),
    title: readString(raw, "title", "Garanta seu acesso agora"),
    subtitle: readString(raw, "subtitle", ""),
    imageUrl: readString(raw, "imageUrl", ""),
    alignment: readOption(raw, "alignment", ALIGNMENTS, "center"),
    showBanner: readBoolean(raw, "showBanner", true),
  }),
  fields: [
    {
      kind: "text",
      key: "eyebrow",
      label: "Etiqueta",
      maxLength: 40,
      placeholder: "Vagas abertas",
    },
    { kind: "text", key: "title", label: "Título", maxLength: 90 },
    { kind: "textarea", key: "subtitle", label: "Subtítulo", maxLength: 180 },
    {
      kind: "switch",
      key: "showBanner",
      label: "Exibir banner",
      hint: "Sem imagem própria, usa o banner cadastrado no checkout.",
    },
    { kind: "image", key: "imageUrl", label: "Imagem do hero", placeholder: "https://..." },
    { kind: "select", key: "alignment", label: "Alinhamento", options: ALIGNMENT_OPTIONS },
  ],
};

const product: SectionDefinition<"product"> = {
  type: "product",
  label: "Produto",
  description: "Nome, preço e descrição da oferta selecionada.",
  isRequired: false,
  allowMultiple: false,
  createProps: () => ({
    title: "",
    description: "",
    imageUrl: "",
    badgeLabel: "",
    showPrice: true,
  }),
  normalizeProps: (raw) => ({
    title: readString(raw, "title", ""),
    description: readString(raw, "description", ""),
    imageUrl: readString(raw, "imageUrl", ""),
    badgeLabel: readString(raw, "badgeLabel", ""),
    showPrice: readBoolean(raw, "showPrice", true),
  }),
  fields: [
    {
      kind: "text",
      key: "title",
      label: "Título",
      maxLength: 90,
      hint: "Vazio usa o nome da oferta cadastrada.",
    },
    {
      kind: "textarea",
      key: "description",
      label: "Descrição",
      maxLength: 240,
      hint: "Vazio usa a descrição do produto.",
    },
    { kind: "image", key: "imageUrl", label: "Imagem", placeholder: "https://..." },
    { kind: "text", key: "badgeLabel", label: "Selo", maxLength: 30, placeholder: "Mais vendido" },
    { kind: "switch", key: "showPrice", label: "Exibir preço" },
  ],
};

const benefits: SectionDefinition<"benefits"> = {
  type: "benefits",
  label: "Benefícios",
  description: "Lista do que o comprador leva.",
  isRequired: false,
  allowMultiple: true,
  createProps: () => ({
    title: "O que você recebe",
    subtitle: "",
    items: [
      benefit("Acesso imediato", "Liberação automática assim que o PIX é confirmado."),
      benefit("Conteúdo vitalício", "Sem mensalidade e sem prazo de expiração."),
      benefit("Suporte direto", "Time disponível para dúvidas durante todo o percurso."),
    ],
  }),
  normalizeProps: (raw) => ({
    title: readString(raw, "title", "O que você recebe"),
    subtitle: readString(raw, "subtitle", ""),
    items: readList<BenefitItem>(
      raw,
      "items",
      (item) => ({
        id: readItemId(item, "benefit"),
        title: readString(item, "title", "Benefício"),
        description: readString(item, "description", ""),
      }),
      [],
      12,
    ),
  }),
  fields: [
    { kind: "text", key: "title", label: "Título", maxLength: 90 },
    { kind: "text", key: "subtitle", label: "Subtítulo", maxLength: 140 },
    {
      kind: "list",
      key: "items",
      label: "Benefícios",
      titleKey: "title",
      itemLabel: "Benefício",
      addLabel: "Adicionar benefício",
      maxItems: 12,
      createItem: () => toPropsRecord(benefit("Novo benefício", "")),
      itemFields: [
        { kind: "text", key: "title", label: "Título", maxLength: 80 },
        { kind: "textarea", key: "description", label: "Descrição", maxLength: 180 },
      ],
    },
  ],
};

const socialProof: SectionDefinition<"social-proof"> = {
  type: "social-proof",
  label: "Prova social",
  description: "Depoimentos de quem já comprou.",
  isRequired: false,
  allowMultiple: true,
  createProps: () => ({
    title: "Quem já comprou",
    subtitle: "",
    items: [
      testimonial(
        "Marina Duarte",
        "Designer",
        "Consegui aplicar no primeiro projeto e o retorno veio na mesma semana.",
      ),
      testimonial(
        "Rafael Lima",
        "Empreendedor",
        "Material direto ao ponto, sem enrolação. Valeu cada centavo.",
      ),
    ],
  }),
  normalizeProps: (raw) => ({
    title: readString(raw, "title", "Quem já comprou"),
    subtitle: readString(raw, "subtitle", ""),
    items: readList<TestimonialItem>(
      raw,
      "items",
      (item) => ({
        id: readItemId(item, "testimonial"),
        name: readString(item, "name", "Cliente"),
        role: readString(item, "role", ""),
        quote: readString(item, "quote", ""),
        rating: readInteger(item, "rating", 5, 0, 5),
      }),
      [],
      12,
    ),
  }),
  fields: [
    { kind: "text", key: "title", label: "Título", maxLength: 90 },
    { kind: "text", key: "subtitle", label: "Subtítulo", maxLength: 140 },
    {
      kind: "list",
      key: "items",
      label: "Depoimentos",
      titleKey: "name",
      itemLabel: "Depoimento",
      addLabel: "Adicionar depoimento",
      maxItems: 12,
      createItem: () => toPropsRecord(testimonial("Novo cliente", "", "")),
      itemFields: [
        { kind: "text", key: "name", label: "Nome", maxLength: 60 },
        { kind: "text", key: "role", label: "Descrição", maxLength: 60 },
        { kind: "textarea", key: "quote", label: "Depoimento", maxLength: 260 },
        { kind: "number", key: "rating", label: "Estrelas", min: 0, max: 5 },
      ],
    },
  ],
};

const guarantee: SectionDefinition<"guarantee"> = {
  type: "guarantee",
  label: "Garantia",
  description: "Reduz o risco percebido antes do pagamento.",
  isRequired: false,
  allowMultiple: false,
  createProps: () => ({
    title: "Garantia incondicional",
    description: "Se não for para você, devolvemos 100% do valor. Sem perguntas.",
    days: 7,
  }),
  normalizeProps: (raw) => ({
    title: readString(raw, "title", "Garantia incondicional"),
    description: readString(raw, "description", ""),
    days: readInteger(raw, "days", 7, 0, 365),
  }),
  fields: [
    { kind: "text", key: "title", label: "Título", maxLength: 90 },
    { kind: "textarea", key: "description", label: "Descrição", maxLength: 240 },
    { kind: "number", key: "days", label: "Prazo", min: 0, max: 365, suffix: "dias" },
  ],
};

const faqSection: SectionDefinition<"faq"> = {
  type: "faq",
  label: "FAQ",
  description: "Perguntas frequentes que travam a compra.",
  isRequired: false,
  allowMultiple: true,
  createProps: () => ({
    title: "Perguntas frequentes",
    items: [
      faq("Como recebo o acesso?", "O link chega no seu e-mail assim que o PIX é confirmado."),
      faq("Posso pagar com cartão?", "No momento o pagamento é exclusivamente via PIX."),
      faq("Por quanto tempo tenho acesso?", "O acesso é vitalício, sem renovação."),
    ],
  }),
  normalizeProps: (raw) => ({
    title: readString(raw, "title", "Perguntas frequentes"),
    items: readList<FaqItem>(
      raw,
      "items",
      (item) => ({
        id: readItemId(item, "faq"),
        question: readString(item, "question", "Pergunta"),
        answer: readString(item, "answer", ""),
      }),
      [],
      20,
    ),
  }),
  fields: [
    { kind: "text", key: "title", label: "Título", maxLength: 90 },
    {
      kind: "list",
      key: "items",
      label: "Perguntas",
      titleKey: "question",
      itemLabel: "Pergunta",
      addLabel: "Adicionar pergunta",
      maxItems: 20,
      createItem: () => toPropsRecord(faq("Nova pergunta", "")),
      itemFields: [
        { kind: "text", key: "question", label: "Pergunta", maxLength: 140 },
        { kind: "textarea", key: "answer", label: "Resposta", maxLength: 400 },
      ],
    },
  ],
};

const checkoutForm: SectionDefinition<"checkout-form"> = {
  type: "checkout-form",
  label: "Formulário",
  description: "Nome, e-mail e CPF do comprador.",
  isRequired: true,
  allowMultiple: false,
  createProps: () => ({
    title: "Seus dados",
    description: "Preencha para gerar o PIX.",
    showOrderSummary: true,
  }),
  normalizeProps: (raw) => ({
    title: readString(raw, "title", "Seus dados"),
    description: readString(raw, "description", ""),
    showOrderSummary: readBoolean(raw, "showOrderSummary", true),
  }),
  fields: [
    { kind: "text", key: "title", label: "Título", maxLength: 90 },
    { kind: "text", key: "description", label: "Descrição", maxLength: 140 },
    {
      kind: "switch",
      key: "showOrderSummary",
      label: "Exibir resumo do pedido",
      hint: "Nome, e-mail e CPF são obrigatórios no MVP e não podem ser removidos.",
    },
  ],
};

const paymentCta: SectionDefinition<"payment-cta"> = {
  type: "payment-cta",
  label: "Botão de pagamento",
  description: "Ação que gera o PIX.",
  isRequired: true,
  allowMultiple: false,
  createProps: () => ({
    label: "Gerar PIX",
    helperText: "",
    showSecurityNote: true,
  }),
  normalizeProps: (raw) => ({
    label: readString(raw, "label", "Gerar PIX"),
    helperText: readString(raw, "helperText", ""),
    showSecurityNote: readBoolean(raw, "showSecurityNote", true),
  }),
  fields: [
    { kind: "text", key: "label", label: "Texto do botão", maxLength: 40 },
    { kind: "text", key: "helperText", label: "Texto de apoio", maxLength: 120 },
    { kind: "switch", key: "showSecurityNote", label: "Exibir selo de ambiente seguro" },
  ],
};

const footer: SectionDefinition<"footer"> = {
  type: "footer",
  label: "Rodapé",
  description: "Assinatura e links institucionais.",
  isRequired: false,
  allowMultiple: false,
  createProps: () => ({
    text: "",
    showSecureBadge: true,
    links: [],
  }),
  normalizeProps: (raw) => ({
    text: readString(raw, "text", ""),
    showSecureBadge: readBoolean(raw, "showSecureBadge", true),
    links: readList<FooterLinkItem>(
      raw,
      "links",
      (item) => ({
        id: readItemId(item, "link"),
        label: readString(item, "label", "Link"),
        url: readString(item, "url", ""),
      }),
      [],
      6,
    ),
  }),
  fields: [
    {
      kind: "text",
      key: "text",
      label: "Texto",
      maxLength: 160,
      hint: "Vazio usa o nome de exibição do checkout.",
    },
    { kind: "switch", key: "showSecureBadge", label: "Exibir selo de compra segura" },
    {
      kind: "list",
      key: "links",
      label: "Links",
      titleKey: "label",
      itemLabel: "Link",
      addLabel: "Adicionar link",
      maxItems: 6,
      createItem: () => toPropsRecord(footerLink("Termos de uso", "https://")),
      itemFields: [
        { kind: "text", key: "label", label: "Rótulo", maxLength: 40 },
        { kind: "text", key: "url", label: "URL", placeholder: "https://..." },
      ],
    },
  ],
};

export const SECTION_REGISTRY: { [TType in CheckoutSectionType]: SectionDefinition<TType> } = {
  hero,
  product,
  benefits,
  "social-proof": socialProof,
  guarantee,
  faq: faqSection,
  "checkout-form": checkoutForm,
  "payment-cta": paymentCta,
  footer,
};

/** Ordem em que as seções aparecem no catálogo "adicionar seção". */
export const SECTION_TYPES = Object.keys(SECTION_REGISTRY) as CheckoutSectionType[];

export function isListField(field: PropertyField): field is ListPropertyField {
  return field.kind === "list";
}

/** Listas de uma seção — os "elementos" que a árvore de camadas expõe. */
export function getListFields(type: CheckoutSectionType): ListPropertyField[] {
  return getSectionDefinition(type).fields.filter(isListField);
}

export function findListField(
  type: CheckoutSectionType,
  fieldKey: string,
): ListPropertyField | undefined {
  return getListFields(type).find((field) => field.key === fieldKey);
}

export function getSectionDefinition(type: CheckoutSectionType): SectionDefinition {
  return SECTION_REGISTRY[type] as SectionDefinition;
}

export function createSection(type: CheckoutSectionType): CheckoutSection {
  return {
    id: createLocalId(type),
    type,
    enabled: true,
    props: getSectionDefinition(type).createProps(),
  } as CheckoutSection;
}
