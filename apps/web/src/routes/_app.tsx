import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getInitials, requireCompletedOnboarding, useSession } from "@/features/auth";
import { NotificationsMenu } from "@/features/notifications";
import { env } from "@/shared/config/env";
import { cn } from "@/shared/lib/cn";
import {
  AppShell,
  Avatar,
  COMPACT_ITEM_CLASSNAME,
  SearchTrigger,
  SIDEBAR_ITEM_ACTIVE_CLASSNAME,
  SIDEBAR_ITEM_CLASSNAME,
} from "@/shared/ui/app-shell";
import { CommandPalette } from "@/shared/ui/command-palette";
import {
  CartIcon,
  DashboardIcon,
  LogoutIcon,
  PackageIcon,
  PlugIcon,
  SalesIcon,
  SettingsIcon,
} from "@/shared/ui/icons";
import { Logo } from "@/shared/ui/logo";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    requireCompletedOnboarding();
  },
  component: AppLayout,
});

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", Icon: DashboardIcon, isExact: true },
  { to: "/produtos", label: "Produtos", Icon: PackageIcon, isExact: false },
  { to: "/checkouts", label: "Checkouts", Icon: CartIcon, isExact: false },
  { to: "/vendas", label: "Vendas", Icon: SalesIcon, isExact: false },
  { to: "/gateways", label: "Gateways", Icon: PlugIcon, isExact: false },
] as const;

const FOOTER_ITEM = {
  to: "/configuracoes",
  label: "Configurações",
  Icon: SettingsIcon,
} as const;

const COMMAND_ITEMS = [...NAV_ITEMS, FOOTER_ITEM].map((item) => ({
  id: item.to,
  label: item.label,
  description: item.to,
}));

function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, signOut } = useSession();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsPaletteOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSignOut() {
    signOut();
    queryClient.clear();
    navigate({ to: "/entrar" });
  }

  const userName = session?.user.name ?? "Sua conta";

  return (
    <>
      <AppShell
        sidebar={
          <>
            <div className="flex h-14 shrink-0 items-center px-5">
              <Logo className="h-7" />
            </div>

            <nav className="flex-1 space-y-0.5 px-3 py-2">
              {NAV_ITEMS.map(({ to, label, Icon, isExact }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: isExact }}
                  className={SIDEBAR_ITEM_CLASSNAME}
                  activeProps={{ className: SIDEBAR_ITEM_ACTIVE_CLASSNAME }}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="border-neutral-200 border-t px-3 py-3">
              <Link
                to={FOOTER_ITEM.to}
                className={SIDEBAR_ITEM_CLASSNAME}
                activeProps={{ className: SIDEBAR_ITEM_ACTIVE_CLASSNAME }}
              >
                <FOOTER_ITEM.Icon className="size-[18px] shrink-0" />
                {FOOTER_ITEM.label}
              </Link>
            </div>
          </>
        }
        compactNav={[...NAV_ITEMS, FOOTER_ITEM].map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className={COMPACT_ITEM_CLASSNAME}
            activeProps={{ className: "bg-neutral-100 text-neutral-900" }}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
        topbar={
          <>
            <Logo className="h-5 lg:hidden" />
            <SearchTrigger onClick={() => setIsPaletteOpen(true)} />

            <NotificationsMenu />

            <div className="relative shrink-0">
              <button
                type="button"
                aria-label="Menu da conta"
                aria-expanded={isUserMenuOpen}
                onClick={() => setIsUserMenuOpen((current) => !current)}
                className="rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              >
                <Avatar initials={getInitials(userName)} />
              </button>

              {isUserMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Fechar menu"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div className="absolute right-0 z-50 mt-2 w-64 animate-pop-in origin-top-right rounded-xl border border-neutral-200 bg-white p-1.5 shadow-neutral-900/10 shadow-lg">
                    <div className="px-2.5 py-2">
                      <p className="truncate font-medium text-neutral-900 text-sm">{userName}</p>
                      <p className="truncate text-neutral-500 text-xs">{session?.user.email}</p>
                      {env.isDev && session && (
                        <p className="mt-1.5 truncate font-mono text-[10px] text-neutral-400">
                          x-account-id: {session.accountId}
                        </p>
                      )}
                    </div>

                    <div className="my-1 h-px bg-neutral-100" />

                    <Link
                      to={FOOTER_ITEM.to}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-neutral-600 text-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      <SettingsIcon className="size-4" />
                      Configurações
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm",
                        "text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
                      )}
                    >
                      <LogoutIcon className="size-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        }
      >
        <Outlet />
      </AppShell>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        items={COMMAND_ITEMS}
        placeholder="Busque uma página do painel..."
        onSelect={(id) => {
          setIsPaletteOpen(false);
          navigate({ to: id });
        }}
      />
    </>
  );
}
