import { useState } from "react";

import { GatewayConnectionDialog } from "@/features/gateway/components/gateway-connection-dialog";
import { useGateway } from "@/features/gateway/hooks/use-gateway";
import { GATEWAY_CATALOG, type GatewayCatalogEntry } from "@/features/gateway/lib/gateway-catalog";
import { formatDateTime } from "@/shared/lib/format-date";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { InfoIcon, PlugIcon } from "@/shared/ui/icons";
import { Skeleton } from "@/shared/ui/skeleton";

/**
 * Um card por gateway disponível. A conexão é global da conta (RF-GTW-03), então
 * o estado exibido no card vem sempre da mesma consulta.
 */
export function GatewayList() {
  const { gateway, isConnected, isLoadingGateway, hasGatewayError } = useGateway();
  const [configuringGateway, setConfiguringGateway] = useState<GatewayCatalogEntry>();

  return (
    <div className="space-y-4">
      {hasGatewayError && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-amber-800 text-xs leading-relaxed">
          <InfoIcon className="mt-px size-4 shrink-0" />
          Não foi possível consultar o estado do gateway. Os cards abaixo continuam disponíveis para
          conectar.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GATEWAY_CATALOG.map((entry) => {
          const isThisConnected = isConnected && gateway?.provider === entry.provider;

          return (
            <Card key={entry.provider} className="flex flex-col">
              <CardHeader
                title={entry.name}
                description={entry.description}
                action={
                  isLoadingGateway ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    <Badge tone={isThisConnected ? "success" : "neutral"}>
                      {isThisConnected ? "Conectado" : "Não conectado"}
                    </Badge>
                  )
                }
              />

              <CardBody className="mt-auto space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {entry.methods.map((method) => (
                    <span
                      key={method}
                      className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-px font-medium text-[11px] text-neutral-500"
                    >
                      {method}
                    </span>
                  ))}
                </div>

                {isThisConnected && gateway?.connectedAt && (
                  <p className="text-neutral-500 text-xs">
                    Conectado em {formatDateTime(gateway.connectedAt)}.
                  </p>
                )}

                <Button
                  variant={isThisConnected ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => setConfiguringGateway(entry)}
                >
                  <PlugIcon className="size-4" />
                  {isThisConnected ? "Gerenciar" : "Configurar"}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {configuringGateway && (
        <GatewayConnectionDialog
          isOpen
          onClose={() => setConfiguringGateway(undefined)}
          gateway={configuringGateway}
        />
      )}
    </div>
  );
}
