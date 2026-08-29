import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { disconnectGateway, saveGateway } from "@/features/gateway/api/gateway.api";
import { gatewayKeys, gatewayQueries } from "@/features/gateway/api/gateway.queries";
import type { SaveGatewayInput } from "@/features/gateway/types/gateway";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

export function useGateway() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery(gatewayQueries.connection());

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: gatewayKeys.connection() });
  }

  const save = useMutation({
    mutationFn: (input: SaveGatewayInput) => saveGateway(input),
    onSuccess: invalidate,
  });

  const disconnect = useMutation({ mutationFn: disconnectGateway, onSuccess: invalidate });

  return {
    gateway: data ?? null,
    isConnected: data?.status === "connected",
    isLoadingGateway: isLoading,
    hasGatewayError: isError,
    saveGateway: save.mutateAsync,
    isSavingGateway: save.isPending,
    didSaveGateway: save.isSuccess,
    saveGatewayErrorMessage: save.isError
      ? getApiErrorMessage(save.error, "Não foi possível salvar as credenciais.")
      : null,
    disconnectGateway: disconnect.mutateAsync,
    isDisconnectingGateway: disconnect.isPending,
    disconnectGatewayErrorMessage: disconnect.isError
      ? getApiErrorMessage(disconnect.error, "Não foi possível desconectar o gateway.")
      : null,
  };
}
