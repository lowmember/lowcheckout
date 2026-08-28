import { useQuery } from "@tanstack/react-query";

import { accountQueries } from "@/features/account/api/account.queries";

export function useMe() {
  const { data, isLoading, isError } = useQuery(accountQueries.me());

  return {
    me: data,
    account: data?.account,
    accountUser: data?.user,
    isLoadingMe: isLoading,
    hasMeError: isError,
  };
}
