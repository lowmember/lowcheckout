# @lowcheckout/contracts

Contrato HTTP entre `apps/api` e `apps/web`. É a **única** definição de cada
campo que atravessa a rede: mudar um schema aqui quebra o build dos dois lados,
que era exatamente o que não acontecia quando cada app mantinha sua cópia.

## Dois pontos de entrada, de propósito

```ts
import type { Offer, Product } from "@lowcheckout/contracts";          // tipos + enums
import { createOfferSchema } from "@lowcheckout/contracts/schemas";     // zod
```

A raiz **não importa zod** — nem nada. Isso existe por duas razões:

1. A regra 1 da API (`apps/api/CLAUDE.md`) proíbe biblioteca de terceiros fora
   de `infra/`. Com a raiz limpa, `application/` pode consumir os tipos sem
   arrastar zod para dentro das camadas internas.
2. O `web` roda no navegador e não depende de zod. Se a raiz importasse, o
   bundle do painel engordaria sem necessidade.

Só `apps/api/src/infra/validation/zod` importa de `/schemas`.

## Fonte da verdade

Quando o front e a API divergiam, **a API venceu** — ela é o que roda em
produção. O que o front esperava a mais está anotado com `TODO(contrato)` no
próprio `apps/web`, para não sumir na migração.

## Sem etapa de build

O pacote é distribuído como código-fonte TypeScript: o `exports` aponta para
`src/`. Os dois consumidores usam `moduleResolution: "bundler"` e bundlam
(esbuild no Lambda, vite no navegador), então uma etapa de `tsc` só adicionaria
latência e um `dist/` para invalidar.
