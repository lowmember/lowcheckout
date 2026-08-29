import { useMutation } from "@tanstack/react-query";

import { deactivateAccount, deleteAccount } from "@/features/account/api/account.api";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseAccountDangerZoneOptions {
  onDone?: () => void;
}

/** RF-CONF-03 e RF-CONF-04 — as duas ações da danger zone. */
export function useAccountDangerZone({ onDone }: UseAccountDangerZoneOptions = {}) {
  const deactivation = useMutation({ mutationFn: deactivateAccount, onSuccess: onDone });
  const deletion = useMutation({ mutationFn: deleteAccount, onSuccess: onDone });

  return {
    deactivate: deactivation.mutateAsync,
    isDeactivating: deactivation.isPending,
    deactivateErrorMessage: deactivation.isError
      ? getApiErrorMessage(deactivation.error, "Não foi possível desativar a conta.")
      : null,
    remove: deletion.mutateAsync,
    isRemoving: deletion.isPending,
    removeErrorMessage: deletion.isError
      ? getApiErrorMessage(deletion.error, "Não foi possível deletar a conta.")
      : null,
  };
}
