'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Header } from '@/design-system';
import { SupabaseAuthRepository } from '@/infra/supabase/SupabaseAuthRepository';

// ─── Icons ─────────────────────────────────────────────────────────────────────

function DumbbellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M14.4 14.4 9.6 9.6" />
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
      <path d="m21.5 21.5-1.4-1.4" />
      <path d="M3.9 3.9 2.5 2.5" />
      <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829 2 2 0 1 1 2.828 2.829l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

function SaladIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M7 21h10" />
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
      <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" />
      <path d="m13 12 4-4" />
      <path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M3 21a9 9 0 0 1 18 0" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

// ─── Logo Mark ─────────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">
      S
    </span>
  );
}

// ─── Nav items config ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/treinos', label: 'Treinos', Icon: DumbbellIcon },
  { href: '/plano-de-treino', label: 'Plano de Treino', Icon: CalendarIcon },
  { href: '/dieta', label: 'Dieta', Icon: SaladIcon },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

const authRepo = new SupabaseAuthRepository();

interface AppHeaderProps {
  user: User;
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const name: string = user.user_metadata?.full_name ?? user.user_metadata?.name ?? '';
  const email: string = user.email ?? '';
  const avatarUrl: string = user.user_metadata?.avatar_url ?? '';

  const initials = name
    ? name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : email[0]?.toUpperCase() ?? 'U';

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await authRepo.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <Header>
      {/* Brand */}
      <Header.Logo href="/dashboard">
        <LogoMark />
        <span>Saitama</span>
      </Header.Logo>

      {/* Desktop navigation */}
      <Header.Nav>
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Header.NavItem key={href} href={href} active={pathname.startsWith(href)}>
            <Icon />
            {label}
          </Header.NavItem>
        ))}
      </Header.Nav>

      {/* Right-side actions */}
      <Header.Actions>
        {/* User menu — desktop only (hidden on mobile via Header.UserMenu itself) */}
        <Header.UserMenu name={name} email={email} avatarUrl={avatarUrl}>
          <Header.UserMenuItem href="/perfil">
            <UserIcon />
            Meu Perfil
          </Header.UserMenuItem>
          <Header.Divider />
          <Header.UserMenuItem danger onClick={handleLogout}>
            <LogOutIcon />
            {loggingOut ? 'Saindo…' : 'Sair'}
          </Header.UserMenuItem>
        </Header.UserMenu>

        {/* Hamburger — mobile only */}
        <Header.MobileToggle />
      </Header.Actions>

      {/* Mobile drawer */}
      <Header.MobileMenu>
        {/* Navigation section */}
        <Header.MobileNav>
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navegação
          </p>
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <Header.MobileNavItem key={href} href={href} active={pathname.startsWith(href)}>
              <Icon />
              {label}
            </Header.MobileNavItem>
          ))}
        </Header.MobileNav>

        {/* User section — bottom of drawer */}
        <div className="mt-auto border-t border-border p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name || email}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              {name && (
                <p className="truncate text-sm font-medium text-foreground">{name}</p>
              )}
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Header.MobileNavItem href="/perfil" active={pathname === '/perfil'}>
              <UserIcon />
              Meu Perfil
            </Header.MobileNavItem>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <LogOutIcon />
              {loggingOut ? 'Saindo…' : 'Sair'}
            </button>
          </div>
        </div>
      </Header.MobileMenu>
    </Header>
  );
}
