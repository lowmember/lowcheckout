import type { GatewayConnectionDto } from "@/application/gateways/dtos/gateway-connection.dto";
import { toGatewayConnectionDto } from "@/application/gateways/mappers/gateway-connection.mapper";
import type { PaymentGateway } from "@/application/payments/ports/payment-gateway";
import type { Clock } from "@/application/shared/ports/clock";
import type { Encrypter } from "@/application/shared/ports/encrypter";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { UseCase } from "@/application/shared/use-case";
import { GatewayConnection } from "@/domain/gateways/entities/gateway-connection.entity";
import type { GatewayConnectionsRepository } from "@/domain/gateways/repositories/gateway-connections.repository";
import { GatewayCredentials } from "@/domain/gateways/value-objects/gateway-credentials";
import type { GatewayEnvironment } from "@/domain/gateways/value-objects/gateway-environment";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";

export interface ConnectGatewayInput {
  accountId: string;
  provider: GatewayProvider;
  environment: GatewayEnvironment;
  clientId: string;
  clientSecret: string;
  certificateBase64?: string | null;
  certificatePassphrase?: string | null;
  pixKey?: string | null;
}

export type ConnectGatewayUseCase = UseCase<ConnectGatewayInput, GatewayConnectionDto>;

/**
 * RF-GTW-01/04/05. A ordem importa: **primeiro** o provedor valida, só depois
 * gravamos. Nada é marcado como conectado sem verificação — é o que evita
 * descobrir o problema na primeira venda.
 *
 * Quando a verificação falha numa conexão que já existia, as credenciais antigas
 * são preservadas e só o diagnóstico (`last_error`, `last_checked_at`) é
 * gravado: um erro de digitação na rotação não pode derrubar quem já vendia.
 */
export class DefaultConnectGatewayUseCase implements ConnectGatewayUseCase {
  private readonly gatewayConnectionsRepository: GatewayConnectionsRepository;
  private readonly paymentGateway: PaymentGateway;
  private readonly encrypter: Encrypter;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor(
    gatewayConnectionsRepository: GatewayConnectionsRepository,
    paymentGateway: PaymentGateway,
    encrypter: Encrypter,
    idGenerator: IdGenerator,
    clock: Clock,
  ) {
    this.gatewayConnectionsRepository = gatewayConnectionsRepository;
    this.paymentGateway = paymentGateway;
    this.encrypter = encrypter;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async execute(input: ConnectGatewayInput): Promise<GatewayConnectionDto> {
    const credentials = GatewayCredentials.create(input);
    const existing = await this.gatewayConnectionsRepository.findByAccountAndProvider(
      input.accountId,
      input.provider,
    );

    try {
      await this.paymentGateway.verifyCredentials({
        environment: input.environment,
        credentials,
      });
    } catch (error) {
      await this.registerFailure(existing, error);

      throw error;
    }

    const now = this.clock.now();
    const encryptedCredentials = this.encrypter.encrypt(JSON.stringify(credentials.toJSON()));
    const pixKey = input.pixKey ?? null;

    if (existing) {
      existing.reconnect({ environment: input.environment, encryptedCredentials, pixKey }, now);

      await this.gatewayConnectionsRepository.update(existing);

      return toGatewayConnectionDto(existing);
    }

    const connection = GatewayConnection.createConnected({
      id: this.idGenerator.generate(),
      accountId: input.accountId,
      provider: input.provider,
      environment: input.environment,
      encryptedCredentials,
      pixKey,
      now,
    });

    await this.gatewayConnectionsRepository.create(connection);

    return toGatewayConnectionDto(connection);
  }

  private async registerFailure(existing: GatewayConnection | null, error: unknown): Promise<void> {
    if (!existing) {
      return;
    }

    existing.registerCheckFailure(
      error instanceof Error ? error.message : "Falha desconhecida na verificação",
      this.clock.now(),
    );

    await this.gatewayConnectionsRepository.update(existing);
  }
}
