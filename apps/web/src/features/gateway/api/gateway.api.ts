import type { GatewayConnection, SaveGatewayInput } from "@/features/gateway/types/gateway";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/types";

export async function getGateway() {
  const response = await httpClient.get<ApiResponse<GatewayConnection | null>>("/gateway");
  return response.data.data;
}

export async function saveGateway(input: SaveGatewayInput) {
  const response = await httpClient.put<ApiResponse<GatewayConnection>>("/gateway", input);
  return response.data.data;
}

export async function disconnectGateway() {
  await httpClient.delete("/gateway");
}
