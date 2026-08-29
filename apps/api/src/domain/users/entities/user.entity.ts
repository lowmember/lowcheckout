import { Email } from "@/domain/shared/value-objects/email";
import { Url } from "@/domain/shared/value-objects/url";
import { GoogleSub } from "@/domain/users/value-objects/google-sub";
import { UserName } from "@/domain/users/value-objects/user-name";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface UserSnapshot {
  id: string;
  accountId: string;
  googleSub: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  id: string;
  accountId: string;
  googleSub: string;
  email: string;
  /** O Google pode não mandar nome (RF-AUTH-01): cai para o e-mail. */
  name?: string | null;
  avatarUrl?: string | null;
  now: Date;
}

export class User {
  private readonly id: string;
  private readonly accountId: string;
  private googleSub: GoogleSub;
  /** Vem do Google e é imutável pela aplicação: o editável é `accounts.contact_email`. */
  private readonly email: Email;
  private name: UserName;
  private avatarUrl: Url | null;
  private lastLoginAt: Date | null;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id: string;
    accountId: string;
    googleSub: GoogleSub;
    email: Email;
    name: UserName;
    avatarUrl: Url | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.googleSub = props.googleSub;
    this.email = props.email;
    this.name = props.name;
    this.avatarUrl = props.avatarUrl;
    this.lastLoginAt = props.lastLoginAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateUserProps): User {
    const email = Email.create(props.email);
    const rawName = props.name?.trim();

    return new User({
      id: props.id,
      accountId: props.accountId,
      googleSub: GoogleSub.create(props.googleSub),
      email,
      // Fallback registrado em docs/modelo-de-dados.md: `name` é not null no schema.
      name: UserName.create(rawName ? rawName : email.toString()),
      avatarUrl: Url.createOptional(props.avatarUrl),
      lastLoginAt: props.now,
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: UserSnapshot): User {
    return new User({
      id: snapshot.id,
      accountId: snapshot.accountId,
      googleSub: GoogleSub.create(snapshot.googleSub),
      email: Email.create(snapshot.email),
      name: UserName.create(snapshot.name),
      avatarUrl: snapshot.avatarUrl === null ? null : Url.create(snapshot.avatarUrl),
      lastLoginAt: snapshot.lastLoginAt,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  get userId(): string {
    return this.id;
  }

  get ownerAccountId(): string {
    return this.accountId;
  }

  get currentEmail(): string {
    return this.email.toString();
  }

  /**
   * O nome não é reescrito a cada login: RF-CONF-01 o torna editável pelo
   * usuário, e o Google não pode desfazer essa edição. Só a foto acompanha o
   * perfil de origem.
   */
  registerLogin(avatarUrl: string | null | undefined, now: Date): void {
    this.lastLoginAt = now;

    const nextAvatarUrl = Url.createOptional(avatarUrl);

    if (nextAvatarUrl !== null && this.avatarUrl?.toString() !== nextAvatarUrl.toString()) {
      this.avatarUrl = nextAvatarUrl;
    }

    this.touch(now);
  }

  /**
   * Mesma pessoa, `sub` diferente: acontece quando o e-mail já era conhecido por
   * outro caminho. RF-AUTH-01 exige que o mesmo e-mail continue sendo o mesmo
   * usuário, então o `sub` é reapontado em vez de criar um registro novo.
   */
  relinkGoogleSub(googleSub: string, now: Date): void {
    const next = GoogleSub.create(googleSub);

    if (this.googleSub.equals(next)) {
      return;
    }

    this.googleSub = next;
    this.touch(now);
  }

  rename(name: string, now: Date): void {
    const next = UserName.create(name);

    if (this.name.equals(next)) {
      return;
    }

    this.name = next;
    this.touch(now);
  }

  toSnapshot(): UserSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      googleSub: this.googleSub.toString(),
      email: this.email.toString(),
      name: this.name.toString(),
      avatarUrl: this.avatarUrl?.toString() ?? null,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private touch(now: Date): void {
    this.updatedAt = now;
  }
}
