# Arquitetura — feature slices

## Camadas

| Camada | Papel | Pode importar de |
| --- | --- | --- |
| `src/app/` | Composition root: instancia `queryClient`, `router` e providers. | `routes`, `features`, `shared` |
| `src/routes/` | Rotas file-based. Fina: só compõe componentes de feature e define `loader`. | `features`, `shared` |
| `src/features/` | Um diretório por domínio. Concentra regra de negócio, UI de domínio e acesso a dados. | `shared`, barrel de outra feature |
| `src/shared/` | Infra reutilizável e agnóstica de domínio (httpClient, env, `cn`, UI genérica). | nada interno |

Regra prática: `routes → features → shared`. Se você precisou importar "para trás", o arquivo está na camada errada.

## Anatomia de um slice

```
src/features/checkouts/
├── api/
│   ├── checkouts.api.ts      # funções puras de HTTP (sem React)
│   └── checkouts.queries.ts  # checkoutKeys + checkoutQueries (queryOptions)
├── components/               # UI que só faz sentido nesse domínio
├── hooks/                    # use-checkouts.ts, use-create-checkout.ts…
├── types/checkout.ts         # contratos do domínio
└── index.ts                  # API pública do slice
```

O `index.ts` é o contrato com o resto do app: exporte apenas o que outras camadas devem consumir. Tudo que não está lá é privado do slice.

```ts
// ✅ de uma rota ou de outra feature
import { CheckoutList, checkoutQueries } from "@/features/checkouts";

// ❌ atravessa a fronteira do slice
import { CheckoutList } from "@/features/checkouts/components/checkout-list";
```

Dentro do próprio slice, importe pelo caminho completo (`@/features/checkouts/hooks/use-checkouts`), não pelo barrel — o barrel importando a si mesmo cria ciclo.

## Onde colocar cada coisa

| O quê | Onde |
| --- | --- |
| Chamada HTTP de um domínio | `features/<slice>/api/<slice>.api.ts` |
| Query key / `queryOptions` | `features/<slice>/api/<slice>.queries.ts` |
| Hook que usa React Query | `features/<slice>/hooks/` |
| Componente com regra do domínio | `features/<slice>/components/` |
| Botão, input, layout genérico | `shared/ui/` |
| Formatador, helper puro | `shared/lib/` |
| Instância axios, tipos de envelope | `shared/api/` |
| Leitura de variável de ambiente | `shared/config/env.ts` |
| Página / layout / param de URL | `routes/` |

## Quando promover para `shared/`

Só quando **duas ou mais** features precisam da mesma coisa e ela não carrega regra de negócio. Um helper usado por um único slice fica dentro dele — mover cedo demais espalha acoplamento.

## Anti-padrões

- Feature importando arquivo interno de outra feature (use o barrel; se não dá, promova para `shared/`).
- Rota com regra de negócio ou `httpClient` direto — rota compõe, feature resolve.
- Diretório `utils/` genérico virando depósito: nomeie por função (`shared/lib/format-price.ts`).
- `shared/` importando de `features/` — inversão de dependência, sempre errado.
