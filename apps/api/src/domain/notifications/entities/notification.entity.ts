import type { NotificationType } from "@/domain/notifications/value-objects/notification-type";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const MAX_TITLE_LENGTH = 160;
const MAX_BODY_LENGTH = 400;

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface NotificationSnapshot {
  id: string;
  accountId: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Pedido que originou o aviso, quando existe — leva o painel direto a ele. */
  orderId: string | null;
  checkoutId: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface CreateNotificationProps {
  id: string;
  accountId: string;
  type: NotificationType;
  title: string;
  body: string;
  orderId?: string | null;
  checkoutId?: string | null;
  now: Date;
}

/**
 * Aviso de vendas no sino do painel (RF-NOT-01). Nasce não lida e só muda de
 * estado uma vez: marcar como lida de novo é no-op, o que torna o endpoint
 * idempotente sem precisar de trava.
 */
export class Notification {
  private readonly id: string;
  private readonly accountId: string;
  private readonly type: NotificationType;
  private readonly title: string;
  private readonly body: string;
  private readonly orderId: string | null;
  private readonly checkoutId: string | null;
  private readAt: Date | null;
  private readonly createdAt: Date;

  private constructor(snapshot: NotificationSnapshot) {
    this.id = snapshot.id;
    this.accountId = snapshot.accountId;
    this.type = snapshot.type;
    this.title = snapshot.title;
    this.body = snapshot.body;
    this.orderId = snapshot.orderId;
    this.checkoutId = snapshot.checkoutId;
    this.readAt = snapshot.readAt;
    this.createdAt = snapshot.createdAt;
  }

  static create(props: CreateNotificationProps): Notification {
    const title = props.title.trim();

    if (title === "" || title.length > MAX_TITLE_LENGTH) {
      throw new InvariantViolationError("Título da notificação inválido");
    }

    return new Notification({
      id: props.id,
      accountId: props.accountId,
      type: props.type,
      title,
      body: props.body.trim().slice(0, MAX_BODY_LENGTH),
      orderId: props.orderId ?? null,
      checkoutId: props.checkoutId ?? null,
      readAt: null,
      createdAt: props.now,
    });
  }

  static restore(snapshot: NotificationSnapshot): Notification {
    return new Notification(snapshot);
  }

  get notificationId(): string {
    return this.id;
  }

  get isRead(): boolean {
    return this.readAt !== null;
  }

  /** `false` quando já estava lida — o caso de uso não precisa gravar de novo. */
  markAsRead(now: Date): boolean {
    if (this.readAt) {
      return false;
    }

    this.readAt = now;
    return true;
  }

  toSnapshot(): NotificationSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      type: this.type,
      title: this.title,
      body: this.body,
      orderId: this.orderId,
      checkoutId: this.checkoutId,
      readAt: this.readAt,
      createdAt: this.createdAt,
    };
  }
}
