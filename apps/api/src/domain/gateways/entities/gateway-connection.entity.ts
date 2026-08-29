import type { GatewayEnvironment } from "@/domain/gateways/value-objects/gateway-environment";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";
import type { GatewayStatus } from "@/domain/gateways/value-objects/gateway-status";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface GatewayConnectionSnapshot {
  id: string;
  accountId: string;
  provider: GatewayProvider;
  environment: GatewayEnvironment;
  status: GatewayStatus;
  /** Texto cifrado pelo `Encrypter`; `null` quando a conexão foi desfeita. */
  encryptedCredentials: string | null;
  pixKey: string | null;
  lastError: string | null;
  connectedAt: Date | null;
  lastCheckedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGatewayConnectionProps {
  id: string;
  accountId: string;
  provider: GatewayProvider;
  environment: GatewayEnvironment;
  encryptedCredentials: string;
  pixKey: string | null;
  now: Date;
}

const MAX_LAST_ERROR_LENGTH = 500;

/**
 * O gateway é **global da conta** (RF-GTW-03): conecta uma vez e todo checkout
 * herda. A entidade nunca vê a credencial em claro — só o texto cifrado, que
 * ela trata como opaco.
 */
export class GatewayConnection {
  private readonly id: string;
  private readonly accountId: string;
  private readonly provider: GatewayProvider;
  private environment: GatewayEnvironment;
  private status: GatewayStatus;
  private encryptedCredentials: string | null;
  private pixKey: string | null;
  private lastError: string | null;
  private connectedAt: Date | null;
  private lastCheckedAt: Date | null;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(snapshot: GatewayConnectionSnapshot) {
    this.id = snapshot.id;
    this.accountId = snapshot.accountId;
    this.provider = snapshot.provider;
    this.environment = snapshot.environment;
    this.status = snapshot.status;
    this.encryptedCredentials = snapshot.encryptedCredentials;
    this.pixKey = snapshot.pixKey;
    this.lastError = snapshot.lastError;
    this.connectedAt = snapshot.connectedAt;
    this.lastCheckedAt = snapshot.lastCheckedAt;
    this.createdAt = snapshot.createdAt;
    this.updatedAt = snapshot.updatedAt;
  }

  /** Só se cria uma conexão já verificada: RF-GTW-05 não admite "conectado" sem checar. */
  static createConnected(props: CreateGatewayConnectionProps): GatewayConnection {
    return new GatewayConnection({
      id: props.id,
      accountId: props.accountId,
      provider: props.provider,
      environment: props.environment,
      status: "connected",
      encryptedCredentials: props.encryptedCredentials,
      pixKey: GatewayConnection.normalizePixKey(props.pixKey),
      lastError: null,
      connectedAt: props.now,
      lastCheckedAt: props.now,
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: GatewayConnectionSnapshot): GatewayConnection {
    return new GatewayConnection(snapshot);
  }

  get gatewayConnectionId(): string {
    return this.id;
  }

  get gatewayProvider(): GatewayProvider {
    return this.provider;
  }

  get isConnected(): boolean {
    return this.status === "connected" && this.encryptedCredentials !== null;
  }

  get currentEncryptedCredentials(): string | null {
    return this.encryptedCredentials;
  }

  get currentPixKey(): string | null {
    return this.pixKey;
  }

  get currentEnvironment(): GatewayEnvironment {
    return this.environment;
  }

  /** RF-GTW-04: rotação de credenciais — só chamada depois de o provedor aceitar. */
  reconnect(
    props: {
      environment: GatewayEnvironment;
      encryptedCredentials: string;
      pixKey: string | null;
    },
    now: Date,
  ): void {
    this.environment = props.environment;
    this.encryptedCredentials = props.encryptedCredentials;
    this.pixKey = GatewayConnection.normalizePixKey(props.pixKey);
    this.status = "connected";
    this.lastError = null;
    this.connectedAt = now;
    this.lastCheckedAt = now;
    this.touch(now);
  }

  /**
   * A verificação falhou numa conexão que já existia. Registra o diagnóstico
   * **sem** trocar as credenciais que estavam funcionando: um erro de digitação
   * na rotação não pode derrubar as vendas de quem já vendia.
   */
  registerCheckFailure(reason: string, now: Date): void {
    this.lastError = reason.slice(0, MAX_LAST_ERROR_LENGTH);
    this.lastCheckedAt = now;
    this.touch(now);
  }

  /**
   * RF-GTW-04: as páginas públicas param de gerar PIX. As credenciais são
   * descartadas — guardá-las depois de desconectar não serve a ninguém.
   */
  disconnect(now: Date): void {
    this.status = "disconnected";
    this.encryptedCredentials = null;
    this.connectedAt = null;
    this.lastError = null;
    this.lastCheckedAt = now;
    this.touch(now);
  }

  toSnapshot(): GatewayConnectionSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      provider: this.provider,
      environment: this.environment,
      status: this.status,
      encryptedCredentials: this.encryptedCredentials,
      pixKey: this.pixKey,
      lastError: this.lastError,
      connectedAt: this.connectedAt,
      lastCheckedAt: this.lastCheckedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static normalizePixKey(pixKey: string | null): string | null {
    const trimmed = pixKey?.trim();

    if (trimmed === undefined || trimmed === "") {
      return null;
    }

    if (trimmed.length > 160) {
      throw new InvariantViolationError("A chave PIX deve ter no máximo 160 caracteres");
    }

    return trimmed;
  }

  private touch(now: Date): void {
    this.updatedAt = now;
  }
}
