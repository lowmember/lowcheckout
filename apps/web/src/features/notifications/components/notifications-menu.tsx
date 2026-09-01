import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import type { Notification, NotificationType } from "@/features/notifications/types/notification";
import { cn } from "@/shared/lib/cn";
import { formatRelativeTime } from "@/shared/lib/format-date";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import {
  BellIcon,
  ReceiptCheckIcon,
  ReceiptClockIcon,
  ReceiptXIcon,
  SpinnerIcon,
} from "@/shared/ui/icons";

const MAX_BADGE_COUNT = 9;

const TYPE_ICONS: Record<NotificationType, typeof ReceiptCheckIcon> = {
  sale_created: ReceiptClockIcon,
  sale_paid: ReceiptCheckIcon,
  sale_expired: ReceiptXIcon,
};

const TYPE_TONES: Record<NotificationType, string> = {
  sale_created: "bg-sky-50 text-sky-600",
  sale_paid: "bg-emerald-50 text-emerald-600",
  sale_expired: "bg-neutral-100 text-neutral-500",
};

/** O sino da topbar: vendas criadas, aprovadas e expiradas (RF-NOT-01). */
export function NotificationsMenu() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    isLoadingNotifications,
    hasNotificationsError,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications({ isEnabled: isOpen });

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Notificações"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-400",
          "transition-colors hover:bg-neutral-100 hover:text-neutral-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
          isOpen && "bg-neutral-100 text-neutral-700",
        )}
      >
        <BellIcon className="size-[18px]" />

        {unreadCount > 0 && (
          <span className="-top-0.5 -right-0.5 absolute flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-semibold text-[10px] text-white leading-4">
            {unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 flex max-h-[26rem] w-80 animate-pop-in origin-top-right flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-neutral-900/10 shadow-lg">
          <header className="flex items-center justify-between gap-2 border-neutral-100 border-b px-4 py-3">
            <p className="font-medium text-neutral-900 text-sm">Notificações</p>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                isLoading={isMarkingAllAsRead}
                onClick={() => void markAllAsRead().catch(() => undefined)}
              >
                Marcar todas como lidas
              </Button>
            )}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoadingNotifications && (
              <p className="flex items-center gap-2 px-4 py-6 text-neutral-500 text-sm">
                <SpinnerIcon className="size-4" />
                Carregando...
              </p>
            )}

            {hasNotificationsError && (
              <p className="px-4 py-6 text-red-600 text-sm">
                Não foi possível carregar suas notificações.
              </p>
            )}

            {!isLoadingNotifications && !hasNotificationsError && notifications.length === 0 && (
              <div className="px-4 py-2">
                <EmptyState
                  icon={<BellIcon className="size-5" />}
                  title="Nada por aqui ainda"
                  description="Avisamos você a cada PIX gerado, aprovado ou expirado."
                />
              </div>
            )}

            <ul className="divide-y divide-neutral-100">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onOpen={() => {
                    setIsOpen(false);
                    if (!notification.readAt) {
                      void markAsRead(notification.id).catch(() => undefined);
                    }
                  }}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

interface NotificationRowProps {
  notification: Notification;
  onOpen: () => void;
}

function NotificationRow({ notification, onOpen }: NotificationRowProps) {
  const Icon = TYPE_ICONS[notification.type];

  const content = (
    <>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          TYPE_TONES[notification.type],
        )}
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm",
              notification.readAt ? "text-neutral-600" : "font-medium text-neutral-900",
            )}
          >
            {notification.title}
          </span>
          {!notification.readAt && <span className="size-1.5 shrink-0 rounded-full bg-red-500" />}
        </span>
        <span className="mt-0.5 block truncate text-neutral-500 text-xs">{notification.body}</span>
        <span className="mt-1 block text-[11px] text-neutral-400">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>
    </>
  );

  const className = cn(
    "flex w-full items-start gap-3 px-4 py-3 text-left",
    "transition-colors duration-200 ease-out hover:bg-neutral-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-inset",
  );

  return (
    <li>
      {notification.checkoutId ? (
        <Link
          to="/checkouts/$checkoutId"
          params={{ checkoutId: notification.checkoutId }}
          onClick={onOpen}
          className={className}
        >
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onOpen} className={className}>
          {content}
        </button>
      )}
    </li>
  );
}
