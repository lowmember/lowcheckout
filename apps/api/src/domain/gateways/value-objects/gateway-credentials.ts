import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/**
 * Credenciais do provedor, em claro. Só existem em memória: para chegarem ao
 * banco passam pelo `Encrypter`, e nunca voltam numa resposta HTTP (RF-GTW-01).
 *
 * O certificado é o material mTLS do EfiBank (arquivo `.p12` em base64). É
 * opcional no tipo porque outros ambientes/providers podem não exigi-lo — o
 * adapter é quem cobra o que precisa.
 */
export interface GatewayCredentialsProps {
  clientId: string;
  clientSecret: string;
  certificateBase64: string | null;
  certificatePassphrase: string | null;
}

export class GatewayCredentials {
  private readonly props: GatewayCredentialsProps;

  private constructor(props: GatewayCredentialsProps) {
    this.props = props;
  }

  static create(input: {
    clientId: string;
    clientSecret: string;
    certificateBase64?: string | null;
    certificatePassphrase?: string | null;
  }): GatewayCredentials {
    const clientId = input.clientId.trim();
    const clientSecret = input.clientSecret.trim();

    if (clientId === "" || clientSecret === "") {
      throw new InvariantViolationError("Informe o client id e o client secret do provedor");
    }

    return new GatewayCredentials({
      clientId,
      clientSecret,
      certificateBase64: GatewayCredentials.normalize(input.certificateBase64),
      certificatePassphrase: input.certificatePassphrase ?? null,
    });
  }

  /** Reconstrói a partir do JSON decifrado; erro aqui é corrupção, não entrada do usuário. */
  static fromDecrypted(value: unknown): GatewayCredentials {
    if (typeof value !== "object" || value === null) {
      throw new InvariantViolationError("Credenciais do gateway ilegíveis");
    }

    const record = value as Record<string, unknown>;

    return GatewayCredentials.create({
      clientId: typeof record.clientId === "string" ? record.clientId : "",
      clientSecret: typeof record.clientSecret === "string" ? record.clientSecret : "",
      certificateBase64:
        typeof record.certificateBase64 === "string" ? record.certificateBase64 : null,
      certificatePassphrase:
        typeof record.certificatePassphrase === "string" ? record.certificatePassphrase : null,
    });
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get clientSecret(): string {
    return this.props.clientSecret;
  }

  get certificateBase64(): string | null {
    return this.props.certificateBase64;
  }

  get certificatePassphrase(): string | null {
    return this.props.certificatePassphrase;
  }

  toJSON(): GatewayCredentialsProps {
    return { ...this.props };
  }

  private static normalize(value: string | null | undefined): string | null {
    const trimmed = value?.trim();

    return trimmed === undefined || trimmed === "" ? null : trimmed;
  }
}
