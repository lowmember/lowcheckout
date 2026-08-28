import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { HorizontalBar } from "@/shared/ui/charts/horizontal-bar";
import { InfoIcon } from "@/shared/ui/icons";

/**
 * Funil, conversão e abandono do PIX deste checkout (RF-ANL-06).
 *
 * Métricas de diagnóstico existem só aqui, nunca na home. Ainda não há endpoint
 * para elas — o RF é Pós-MVP —, então a área existe zerada e diz por quê.
 */
// TODO(contrato): não há endpoint de analytics por checkout no contrato atual.
interface FunnelStage {
  label: string;
  value: number;
  description: string;
}

const FUNNEL_STAGES: FunnelStage[] = [
  { label: "Visitas", value: 0, description: "Acessos à página pública deste checkout" },
  { label: "PIX gerados", value: 0, description: "Compradores que chegaram à cobrança" },
  { label: "Pagos", value: 0, description: "Pedidos confirmados pelo gateway" },
];

const RATES = [
  { label: "Taxa de conversão", value: "0%", hint: "pedidos pagos ÷ visitas" },
  { label: "Abandono do PIX", value: "0%", hint: "pedidos expirados ÷ PIX gerados" },
];

export function CheckoutAnalyticsPanel() {
  const maxValue = Math.max(...FUNNEL_STAGES.map((stage) => stage.value), 1);

  return (
    <Card>
      <CardHeader
        title="Analytics do checkout"
        description="Funil deste checkout — as métricas da conta inteira ficam no Dashboard."
      />

      <CardBody className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {RATES.map((rate) => (
            <div key={rate.label} className="rounded-lg border border-neutral-200 px-4 py-3">
              <p className="text-neutral-500 text-xs">{rate.label}</p>
              <p className="mt-1 font-semibold text-2xl text-neutral-900 tracking-tight">
                {rate.value}
              </p>
              <p className="mt-0.5 text-neutral-400 text-[11px]">{rate.hint}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {FUNNEL_STAGES.map((stage) => (
            <div key={stage.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <p className="font-medium text-neutral-700 text-sm">{stage.label}</p>
                <p className="font-semibold text-neutral-900 text-sm tabular-nums">{stage.value}</p>
              </div>
              <HorizontalBar value={stage.value} max={maxValue} />
              <p className="mt-1 text-neutral-400 text-[11px]">{stage.description}</p>
            </div>
          ))}
        </div>

        <p className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-neutral-500 text-xs leading-relaxed">
          <InfoIcon className="mt-px size-4 shrink-0" />
          Sem tráfego registrado no período. O funil depende do registro de eventos da página
          pública (RF-ANL-06), que ainda não tem endpoint.
        </p>
      </CardBody>
    </Card>
  );
}
