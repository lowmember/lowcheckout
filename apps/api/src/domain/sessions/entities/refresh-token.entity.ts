import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface RefreshTokenSnapshot {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface CreateRefreshTokenProps {
  id: string;
  userId: string;
  /** SHA-256 do token; o valor em claro nunca chega ao domínio nem ao banco. */
  tokenHash: string;
  expiresAt: Date;
  now: Date;
}

const TOKEN_HASH_LENGTH = 64;

export class RefreshToken {
  private readonly id: string;
  private readonly userId: string;
  private readonly tokenHash: string;
  private readonly expiresAt: Date;
  private revokedAt: Date | null;
  private readonly createdAt: Date;

  private constructor(props: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.tokenHash = props.tokenHash;
    this.expiresAt = props.expiresAt;
    this.revokedAt = props.revokedAt;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateRefreshTokenProps): RefreshToken {
    if (props.tokenHash.length !== TOKEN_HASH_LENGTH) {
      throw new InvariantViolationError("O hash do refresh token deve ser um SHA-256 hexadecimal");
    }

    if (props.expiresAt.getTime() <= props.now.getTime()) {
      throw new InvariantViolationError("O refresh token precisa expirar no futuro");
    }

    return new RefreshToken({
      id: props.id,
      userId: props.userId,
      tokenHash: props.tokenHash,
      expiresAt: props.expiresAt,
      revokedAt: null,
      createdAt: props.now,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: RefreshTokenSnapshot): RefreshToken {
    return new RefreshToken({
      id: snapshot.id,
      userId: snapshot.userId,
      tokenHash: snapshot.tokenHash,
      expiresAt: snapshot.expiresAt,
      revokedAt: snapshot.revokedAt,
      createdAt: snapshot.createdAt,
    });
  }

  get refreshTokenId(): string {
    return this.id;
  }

  get ownerUserId(): string {
    return this.userId;
  }

  isUsable(now: Date): boolean {
    return this.revokedAt === null && this.expiresAt.getTime() > now.getTime();
  }

  revoke(now: Date): void {
    if (this.revokedAt !== null) {
      return;
    }

    this.revokedAt = now;
  }

  toSnapshot(): RefreshTokenSnapshot {
    return {
      id: this.id,
      userId: this.userId,
      tokenHash: this.tokenHash,
      expiresAt: this.expiresAt,
      revokedAt: this.revokedAt,
      createdAt: this.createdAt,
    };
  }
}
