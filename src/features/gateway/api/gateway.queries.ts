import { queryOptions } from "@tanstack/react-query";

import { getGateway } from "@/features/gateway/api/gateway.api";

export const gatewayKeys = {
  all: ["gateway"] as const,
  connection: () => [...gatewayKeys.all, "connection"] as const,
};

export const gatewayQueries = {
  connection: () =>
    queryOptions({
      queryKey: gatewayKeys.connection(),
      queryFn: getGateway,
      retry: false,
    }),
};
