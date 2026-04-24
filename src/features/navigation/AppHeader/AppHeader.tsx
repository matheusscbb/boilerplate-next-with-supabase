'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Header } from '@/design-system';
import { SupabaseAuthRepository } from '@/infra/supabase/SupabaseAuthRepository';
import { getNavItems } from './config';
import { LogOutIcon, UserIcon } from './icons';
import { LogoMark } from './LogoMark';
import type { AppHeaderProps } from './AppHeader.types';

const authRepo = new SupabaseAuthRepository();

export function AppHeader({ user, role }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const navItems = getNavItems(role);

  const name: string = user.user_metadata?.full_name ?? user.user_metadata?.name ?? '';
  const email: string = user.email ?? '';
  const avatarUrl: string = user.user_metadata?.avatar_url ?? '';

  const initials = name
    ? name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
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
        {navItems.map(({ href, label, Icon }) => (
          <Header.NavItem key={href} href={href} active={pathname.startsWith(href)}>
            <Icon />
            {label}
          </Header.NavItem>
        ))}
      </Header.Nav>

      {/* Right-side actions */}
      <Header.Actions>
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

        <Header.MobileToggle />
      </Header.Actions>

      {/* Mobile drawer */}
      <Header.MobileMenu>
        <Header.MobileNav>
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navegação
          </p>
          {navItems.map(({ href, label, Icon }) => (
            <Header.MobileNavItem
              key={href}
              href={href}
              active={pathname.startsWith(href)}
            >
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
