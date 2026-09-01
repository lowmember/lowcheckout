# LowCheckout Checkout

A página que o comprador acessa. Serve o template publicado de um checkout em
`lowchk.click/{slug}` — domínio próprio, separado do painel.

React 19 + Vite 8 + TypeScript, Tailwind 4, TanStack Query. Sem roteador.

## Por que é um app separado

| | `apps/web` (painel) | `apps/checkout` (esta pasta) |
| --- | --- | --- |
| Quem acessa | o lojista, logado | o comprador, anônimo |
| Domínio | `app.lowcheckout.com` | `lowchk.click` |
| Sessão | JWT + refresh | nenhuma |
| Rotas da API | todas | só `/public/*` |

Misturar os dois custaria caro nos dois sentidos: o comprador baixaria o bundle
do painel inteiro (e a página pública é a superfície que converte, em rede
móvel), e a URL divulgada em anúncio carregaria o domínio do painel. O que os
dois compartilham — o renderizador — vive em `packages/checkout-renderer`, e é
por isso que o preview do builder e esta página não têm como divergir.

## Comandos

```bash
pnpm dev          # http://localhost:5273
pnpm lint         # biome check .        → SEMPRE rodar antes de encerrar uma task
pnpm lint:fix     # biome check --write .
pnpm typecheck    # tsc -b --noEmit
pnpm build        # tsc -b && vite build
```

`pnpm lint` e `pnpm build` são o critério de "pronto". Não existe suíte de testes ainda.

O `dev` depende da API (`pnpm --filter lowcheckout-api dev`, porta 3333): o
`/api` daqui é proxy do Vite para ela, o que elimina a preflight de CORS que o
`serverless-offline` não responde.

## Mapa do código

```
src/main.tsx             lê o slug do pathname e monta a árvore
src/app/                 providers e queryClient
src/features/checkout/   api/ hooks/ lib/ components/ + index.ts
src/shared/              config/ api/ lib/ — infra sem regra de negócio
src/styles/global.css    entrada do Tailwind (inclui @source do renderizador)
```

Mesmas regras do painel: `features → shared`, imports por `@/`, env só via
`@/shared/config/env`, HTTP só via `httpClient`, textos em pt-BR, nada de `any`.

## O fluxo

As três telas do blueprint (§6) são **estados de uma tela só**, não rotas — a URL
do checkout é a que o lojista divulga e não pode mudar no meio do pagamento:

1. **Formulário** — o `CheckoutRenderer` desenha o schema publicado e recebe o
   controller do `useCheckoutPayment`.
2. **PIX** (RF-PUB-04) — QR Code, copia-e-cola e timer, no tema do checkout.
3. **Obrigado** (RF-PUB-06) — confirmação e `deliveryUrl`, que só existe pago.

Quem decide o passo é o pedido. O `orderId` fica no `sessionStorage` por slug:
sem isso, recarregar a tela do PIX — ou voltar do app do banco, que é o que o
comprador faz — jogaria fora o QR Code.

## Armadilhas conhecidas

- **Só a configuração `published` chega aqui.** Rascunho não vaza para o
  comprador (RF-CHK-07); sem nada publicado, a página mostra o aviso e para.
- **O Tailwind não varre `node_modules`.** O `@source` em `styles/global.css`
  aponta para o renderizador; sem ele a página sobe sem nenhuma classe.
- **Hospedagem precisa de fallback para SPA.** Todo caminho serve o
  `index.html` — é o `vercel.json`. Sem isso, `lowchk.click/{slug}` dá 404.
- **A origem deste app precisa estar em `CORS_ORIGINS` da API.** Em produção ela
  não passa por proxy nenhum; fora da lista, o navegador bloqueia tudo.
- **Pixel não pode quebrar a compra** (RF-PUB-08). Todo disparo em
  `lib/pixels.ts` é `try/catch` mudo, e nenhum deles bloqueia o fluxo.
