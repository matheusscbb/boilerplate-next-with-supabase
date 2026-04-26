'use client';

import { useState, createContext, useContext, useRef, useEffect } from 'react';
import Link from 'next/link';
import type {
  HeaderContextValue,
  HeaderProps,
  HeaderLogoProps,
  HeaderNavProps,
  HeaderNavItemProps,
  HeaderActionsProps,
  HeaderMobileMenuProps,
  HeaderUserMenuProps,
  HeaderUserMenuItemProps,
} from './Header.types';

// ─── Context ───────────────────────────────────────────────────────────────────

const HeaderContext = createContext<HeaderContextValue>({
  isOpen: false,
  setIsOpen: () => {},
});

function useHeader() {
  return useContext(HeaderContext);
}

// ─── Root ──────────────────────────────────────────────────────────────────────

function HeaderRoot({ children, className = '', ...props }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <HeaderContext.Provider value={{ isOpen, setIsOpen }}>
      <header
        className={[
          'sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {children}
        </div>
      </header>

      {/* Mobile overlay — sibling of <header>, outside its stacking context */}
      <div
        aria-hidden="true"
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setIsOpen(false)}
      />
    </HeaderContext.Provider>
  );
}

// ─── Logo ──────────────────────────────────────────────────────────────────────

function HeaderLogo({ children, href = '/', className = '' }: HeaderLogoProps) {
  return (
    <Link
      href={href}
      className={[
        'flex shrink-0 items-center gap-2 text-lg font-bold text-foreground transition-opacity hover:opacity-80',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Link>
  );
}

// ─── Nav (desktop) ─────────────────────────────────────────────────────────────

function HeaderNav({ children, className = '' }: HeaderNavProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className={[
        'hidden lg:flex items-center gap-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </nav>
  );
}

// ─── NavItem ───────────────────────────────────────────────────────────────────

function HeaderNavItem({ children, href, active = false, className = '' }: HeaderNavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={[
        'relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
        active
          ? 'text-primary bg-primary/10'
          : 'text-foreground-secondary hover:text-foreground hover:bg-muted',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {active && (
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary"
        />
      )}
    </Link>
  );
}

// ─── Actions ───────────────────────────────────────────────────────────────────

function HeaderActions({ children, className = '' }: HeaderActionsProps) {
  return (
    <div className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

// ─── Mobile Toggle (Hamburger) ─────────────────────────────────────────────────

function HeaderMobileToggle({ className = '' }: { className?: string }) {
  const { isOpen, setIsOpen } = useHeader();
  return (
    <button
      type="button"
      aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      aria-expanded={isOpen}
      aria-controls="header-mobile-menu"
      onClick={() => setIsOpen(!isOpen)}
      className={[
        'flex lg:hidden h-9 w-9 items-center justify-center rounded-md transition-colors',
        'text-foreground-secondary hover:bg-muted hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="relative block h-5 w-5" aria-hidden="true">
        <span
          className={[
            'absolute left-0 block h-0.5 w-full rounded bg-current transition-all duration-300',
            isOpen ? 'top-[9px] rotate-45' : 'top-0.5',
          ].join(' ')}
        />
        <span
          className={[
            'absolute left-0 top-[9px] block h-0.5 w-full rounded bg-current transition-all duration-300',
            isOpen ? 'opacity-0 scale-x-0' : 'opacity-100',
          ].join(' ')}
        />
        <span
          className={[
            'absolute left-0 block h-0.5 w-full rounded bg-current transition-all duration-300',
            isOpen ? 'top-[9px] -rotate-45' : 'top-[17px]',
          ].join(' ')}
        />
      </span>
    </button>
  );
}

// ─── Mobile Menu (Drawer) ──────────────────────────────────────────────────────

function HeaderMobileMenu({ children, className = '' }: HeaderMobileMenuProps) {
  const { isOpen, setIsOpen } = useHeader();
  return (
    <aside
      id="header-mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
      className={[
        'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background shadow-xl',
        'transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="text-base font-semibold text-foreground">Menu</span>
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setIsOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-secondary transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
    </aside>
  );
}

// ─── Mobile Nav ────────────────────────────────────────────────────────────────

function HeaderMobileNav({ children, className = '' }: HeaderNavProps) {
  return (
    <nav
      aria-label="Navegação mobile"
      className={['flex flex-col gap-1 p-3', className].filter(Boolean).join(' ')}
    >
      {children}
    </nav>
  );
}

// ─── Mobile NavItem ────────────────────────────────────────────────────────────

function HeaderMobileNavItem({ children, href, active = false, className = '' }: HeaderNavItemProps) {
  const { setIsOpen } = useHeader();
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={() => setIsOpen(false)}
      className={[
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-foreground-secondary hover:bg-muted hover:text-foreground',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Link>
  );
}

// ─── User Menu ─────────────────────────────────────────────────────────────────

function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return 'U';
}

function HeaderUserMenu({
  name,
  email,
  avatarUrl,
  children,
  className = '',
}: HeaderUserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initials = getInitials(name, email);
  const displayName = name || email || 'Usuário';

  return (
    <div
      ref={ref}
      className={['relative hidden lg:block', className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        aria-label="Menu do usuário"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 pr-2.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {avatarUrl ? (
          // Avatars come from arbitrary external URLs (OAuth providers,
          // user uploads, etc.). Routing them through next/image would
          // require listing every domain in next.config — using a plain
          // <img> is the pragmatic choice for this design-system primitive.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {initials}
          </span>
        )}
        <span className="max-w-32 truncate text-sm font-medium text-foreground">
          {displayName}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={[
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            open ? 'rotate-180' : '',
          ].join(' ')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className={[
          'absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-lg border border-border bg-background shadow-md',
          'transition-all duration-150',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none',
        ].join(' ')}
      >
        <div className="border-b border-border px-4 py-3">
          <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
          {email && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p>
          )}
        </div>
        <div className="p-1" role="menu">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── User MenuItem ─────────────────────────────────────────────────────────────

function HeaderUserMenuItem({
  children,
  href,
  onClick,
  danger = false,
  className = '',
}: HeaderUserMenuItemProps) {
  const baseClass = [
    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors',
    danger ? 'text-destructive hover:bg-destructive/10' : 'text-foreground hover:bg-muted',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} role="menuitem" className={baseClass}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" onClick={onClick} className={baseClass}>
      {children}
    </button>
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────────

function HeaderDivider({ className = '' }: { className?: string }) {
  return <hr className={['my-1 border-border', className].filter(Boolean).join(' ')} />;
}

// ─── Compound Export ───────────────────────────────────────────────────────────

export const Header = Object.assign(HeaderRoot, {
  Logo: HeaderLogo,
  Nav: HeaderNav,
  NavItem: HeaderNavItem,
  Actions: HeaderActions,
  MobileToggle: HeaderMobileToggle,
  MobileMenu: HeaderMobileMenu,
  MobileNav: HeaderMobileNav,
  MobileNavItem: HeaderMobileNavItem,
  UserMenu: HeaderUserMenu,
  UserMenuItem: HeaderUserMenuItem,
  Divider: HeaderDivider,
});
