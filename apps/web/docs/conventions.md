# Convenções de código

## Nomes de arquivo

Sempre `kebab-case.ts(x)`.

| Tipo | Padrão | Exemplo |
| --- | --- | --- |
| Componente | `kebab-case.tsx`, export nomeado em PascalCase | `checkout-status-badge.tsx` → `CheckoutStatusBadge` |
| Hook | `use-<coisa>.ts` | `use-create-checkout.ts` → `useCreateCheckout` |
| HTTP do domínio | `<slice>.api.ts` | `checkouts.api.ts` |
| Queries do domínio | `<slice>.queries.ts` | `checkouts.queries.ts` |
| Tipos do domínio | `types/<entidade>.ts` | `types/checkout.ts` |
| Rota | file-based, `$param` para dinâmica | `routes/checkouts/$checkoutId.tsx` |

## Exports

Export nomeado em todo lugar. A única exceção é `export const Route` exigido pelo TanStack Router nos arquivos de rota. Sem `export default`.

## TypeScript

- `strict` ligado. `any` é erro de lint (`noExplicitAny`); use `unknown` + narrowing quando precisar.
- `interface` para objetos/props, `type` para unions e utilitários: `type CheckoutStatus = "draft" | "active" | ...`.
- `verbatimModuleSyntax` está ligado: import de tipo **precisa** de `import type { X }`. O Biome corrige via `useImportType`.
- Props de componente: `interface <Componente>Props` declarada logo acima do componente.

```tsx
interface CheckoutStatusBadgeProps {
  status: CheckoutStatus;
}

export function CheckoutStatusBadge({ status }: CheckoutStatusBadgeProps) { ... }
```

- Mapas de rótulo/estilo por union: `const STATUS_LABELS: Record<CheckoutStatus, string>` em SCREAMING_SNAKE_CASE, no topo do arquivo. `Record` garante erro de compilação quando um novo status entra.

## Hooks de domínio

Hooks devolvem um objeto com nomes explícitos, não o objeto cru do React Query. Isso evita `isLoading` ambíguo quando a tela usa dois hooks.

```ts
return {
  checkouts: data?.data ?? [],
  isLoadingCheckouts: isLoading,
  hasCheckoutsError: isError,
};
```

## Ordem dos imports

O Biome organiza automaticamente em blocos separados por linha em branco (`pnpm lint:fix`). Nunca reordene na mão:

```ts
import path from "node:path";                      // 1. builtins Node/Bun

import { useQuery } from "@tanstack/react-query";  // 2. pacotes externos

import { httpClient } from "@/shared/api";         // 3. alias interno @/

import { formatPrice } from "./format-price";      // 4. caminhos relativos

import "@/styles/global.css";                      // 5. estilos
```

## Estilo / UI

- Tailwind 4 via classes utilitárias; sem CSS-in-JS e sem arquivo `.css` por componente.
- Classes condicionais sempre por `cn()` (`@/shared/lib/cn`), que resolve conflito de utilitários via `tailwind-merge`.
- Textos de interface em **pt-BR**; identificadores e comentários de código em português são aceitos, mas nomes de API/domínio seguem o backend (`priceInCents`, `slug`).
- Valores monetários: `Intl.NumberFormat("pt-BR", { style: "currency", currency })` sobre `priceInCents / 100`. Nunca formate manualmente.

## Formatação (imposta pelo Biome)

Aspas duplas, ponto e vírgula, vírgula final, indentação de 2 espaços, largura de linha 100. Não discuta com o formatter: rode `pnpm lint:fix`.
