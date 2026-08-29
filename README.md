# LowCheckout

Monorepo do Low Checkout — checkout as a service. pnpm workspaces + Turborepo.

## Estrutura

```
apps/api        Serverless Framework v4 → AWS Lambda (uma função por rota) + Postgres/Neon
apps/web        Painel do lojista — Vite + React + TanStack Router  → Vercel
apps/landing    Landing de aquisição — Vite + Tailwind, sem framework → Vercel
```

Configuração compartilhada vive na raiz: `biome.json` (cada app estende com `"extends": "//"`),
`lefthook.yml`, `commitlint.config.js`, `.nvmrc`.

## Comandos

Todos rodam da raiz e atravessam os três apps:

```bash
pnpm install     # instala o workspace inteiro, lockfile único
pnpm dev         # sobe api (3333), web (5173) e landing (4173) juntos
pnpm build       # builda o que mudou, respeitando o grafo de dependências
pnpm lint        # biome em todos os apps
pnpm typecheck   # tsc em api e web
```

Para um app só, use `--filter`:

```bash
pnpm turbo dev --filter=lowcheckout-web
pnpm turbo build --filter=lowcheckout-landing
```

O `dev` da API depende do Postgres local:

```bash
pnpm --filter lowcheckout-api db:up      # docker compose
pnpm --filter lowcheckout-api db:migrate
```

## Deploy

| App | Destino | Como |
| --- | --- | --- |
| `landing` | Vercel (root dir `apps/landing`, output `dist`) | push na `main` |
| `web` | Vercel (root dir `apps/web`, output `dist`) | push na `main` |
| `api` | AWS via Serverless | `pnpm deploy:api` / `pnpm deploy:api:prod` |

> **Não use `pnpm deploy`**: é um comando embutido do pnpm em workspaces e não executa o
> script do `apps/api`. Use `pnpm deploy:api`, que passa pelo turbo.

Nos projetos da Vercel, configure o *Ignored Build Step* como `npx turbo-ignore` — assim um
commit que só toca a landing não redeploya o painel.

## Pendências da migração

- **CORS da API está fixado em `http://localhost:5173`** (`apps/api/serverless.ts`). Precisa virar
  env-driven antes do primeiro deploy, ou o painel na Vercel é bloqueado pelo navegador.
- **`packages/contracts` ainda não existe.** Os tipos do front (ex.: `apps/web/src/features/offers/types/offer.ts`)
  ainda duplicam à mão os schemas zod da API (`apps/api/src/infra/validation/zod/schemas/`).
- **TypeScript divergente**: `api` usa 7.0.x e `web` usa 6.0.x. Convive bem hoje porque não
  compartilham código; precisa convergir quando o `contracts` entrar.
