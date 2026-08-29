# LowCheckout Landing

Landing page de aquisição do Low Checkout. HTML estático + Tailwind 4, sem framework — o Vite
compila o CSS e copia os assets para `dist/`, que é o que vai para a Vercel.

Faz parte do monorepo: os comandos abaixo rodam de dentro de `apps/landing`, mas o
`pnpm dev` / `pnpm build` da raiz já sobem esta app junto com as outras via Turborepo.

## Comandos

```bash
pnpm dev        # vite dev server na porta 4173, com HMR do CSS
pnpm build      # gera dist/ (CSS bundlado com hash + assets)  → critério de "pronto"
pnpm preview    # serve o dist/ para conferir o build final
pnpm lint       # biome check .
pnpm lint:fix   # biome check --write .
```

`dist/` é **gerado** e está no `.gitignore` da raiz.

## Estrutura

```
index.html          a página inteira (seções comentadas: hero, recursos, checkout, taxas, ajuda)
src/input.css       entrada do Tailwind: @theme com as cores da marca + camadas base/components
public/assets/      logo (preta e branca), favicon e hero.jpg — servidos em /assets/*
vite.config.ts      plugin do Tailwind + porta do dev server
dist/               gerado pelo build, não versionado
```

## Pontos de manutenção

| Quero... | Onde |
| --- | --- |
| trocar a foto do hero | substitua `public/assets/hero.jpg` (é o único ponto que a referencia, via `--hero-image` no `src/input.css`) |
| ajustar o tratamento da foto | `src/input.css` → `.hero-photo` (grayscale/brightness) e o gradiente no `index.html` |
| ajustar cores da marca | `src/input.css` → bloco `@theme` (`--color-brand-*`, `--color-ink-*`) |
| apontar os CTAs para o app | `index.html` → busque por `app.lowcheckout.com` |
| trocar o link do "Falar com o time" | `index.html` → `wa.me/5500000000000` (placeholder) |
| fechar o preço | `index.html` → seção `#taxas`, marcada com `TODO(produto)` |

## Pendências conhecidas

- **Preço**: o modelo de monetização ainda está em aberto no blueprint. A seção de taxas foi escrita
  sem número fechado ("Taxa zero no lançamento" / "Sob medida") justamente para não publicar um valor
  que ainda não existe. Quando o preço for definido, o `TODO(produto)` marca o lugar.
- **`public/assets/og-image.png`**: referenciado nas meta tags do Open Graph, ainda não existe.
- Links de `/termos` e `/privacidade` são placeholders.
