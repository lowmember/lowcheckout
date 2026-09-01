# LowCheckout

Monorepo do Low Checkout — checkout as a service. pnpm workspaces + Turborepo.

## Estrutura

```
apps/api                  Serverless Framework v4 → AWS Lambda (uma função por rota) + Postgres/Neon
apps/web                  Painel do lojista — Vite + React + TanStack Router  → Vercel
apps/checkout             Página do comprador — Vite + React, sem roteador     → Vercel
apps/landing              Landing de aquisição — Vite + Tailwind, sem framework → Vercel
packages/contracts        Tipos e schemas do contrato HTTP, compartilhados por api e fronts
packages/checkout-renderer Renderizador do checkout, compartilhado por web e checkout
```

Configuração compartilhada vive na raiz: `biome.json` (cada app estende com `"extends": "//"`),
`lefthook.yml`, `commitlint.config.js`, `.nvmrc`.

### Os dois front-ends do checkout

`apps/web` é o painel autenticado; `apps/checkout` é a página pública, num domínio
próprio (`lowchk.click/{slug}`). São apps separados porque o comprador não pode
baixar o bundle do painel — a página pública é a superfície que converte, em rede
móvel — e porque a URL divulgada em anúncio não deve carregar o domínio do painel.

O que os dois compartilham é o **renderizador**: `packages/checkout-renderer` é a
única implementação das seções, do tema e das telas de PIX e obrigado. O preview
do builder e a página do comprador são literalmente o mesmo componente, e é essa
dependência — não uma convenção — que impede os dois de divergirem.

## Comandos

Todos rodam da raiz e atravessam os apps:

```bash
pnpm install     # instala o workspace inteiro, lockfile único
pnpm dev         # sobe api (3333), web (5173), checkout (5273) e landing (4173) juntos
pnpm build       # builda o que mudou, respeitando o grafo de dependências
pnpm lint        # biome em todos os apps e pacotes
pnpm typecheck   # tsc em api, web, checkout e nos pacotes
```

Para um app só, use `--filter`:

```bash
pnpm turbo dev --filter=lowcheckout-checkout
pnpm turbo build --filter=lowcheckout-landing
```

O `dev` da API depende do Postgres local:

```bash
pnpm --filter lowcheckout-api db:up      # docker compose
pnpm --filter lowcheckout-api db:migrate
```

## URL pública de um checkout

Cada vínculo checkout↔oferta ganha uma URL própria (RF-CHK-05), servida na raiz
do domínio do checkout:

```
https://lowchk.click/a7k3mp2q
```

O slug é um código curto de 8 símbolos, gerado aleatoriamente e único
globalmente (`unique(public_slug)` no banco). É curto porque é o endereço que o
lojista divulga, e opaco porque enumerar checkouts alheios não pode ser questão
de incrementar um número — o alfabeto omite `0`, `1`, `i`, `l` e `o`, que se
confundem quando alguém digita a URL de um print.

## Deploy

| App | Destino | Como |
| --- | --- | --- |
| `landing` | Vercel (root dir `apps/landing`, output `dist`) | push na `main` |
| `web` | Vercel (root dir `apps/web`, output `dist`) | push na `main` |
| `checkout` | Vercel (root dir `apps/checkout`, output `dist`) | push na `main` |
| `api` | AWS via Serverless | `pnpm deploy:api` / `pnpm deploy:api:prod` |

> **Não use `pnpm deploy`**: é um comando embutido do pnpm em workspaces e não executa o
> script do `apps/api`. Use `pnpm deploy:api`, que passa pelo turbo.

Nos projetos da Vercel, configure o *Ignored Build Step* como `npx turbo-ignore` — assim um
commit que só toca a landing não redeploya o painel.

O projeto do `checkout` precisa do domínio `lowchk.click` apontado para ele e do
fallback de SPA, que já vem no `apps/checkout/vercel.json`: sem ele, todo
`lowchk.click/{slug}` responde 404.

**`CORS_ORIGINS` da API precisa listar os dois front-ends** (`apps/web` e
`apps/checkout`). Em desenvolvimento os dois passam pelo proxy do Vite e nada
disso é exercitado; em produção, a origem que faltar na lista é bloqueada pelo
navegador — e, no caso do checkout, isso derruba todas as páginas públicas.
