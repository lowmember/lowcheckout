import { queryOptions } from "@tanstack/react-query";

import { getMe } from "@/features/account/api/account.api";

export const accountKeys = {
  all: ["account"] as const,
  me: () => [...accountKeys.all, "me"] as const,
};

export const accountQueries = {
  me: () =>
    queryOptions({
      queryKey: accountKeys.me(),
      queryFn: getMe,
      retry: false,
    }),
};
