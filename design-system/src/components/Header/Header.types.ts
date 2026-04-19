import type { HTMLAttributes } from 'react';

export interface HeaderContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
}

export interface HeaderLogoProps {
  children?: React.ReactNode;
  href?: string;
  className?: string;
}

export interface HeaderNavProps {
  children?: React.ReactNode;
  className?: string;
}

export interface HeaderNavItemProps {
  children?: React.ReactNode;
  href: string;
  active?: boolean;
  className?: string;
}

export interface HeaderActionsProps {
  children?: React.ReactNode;
  className?: string;
}

export interface HeaderMobileMenuProps {
  children?: React.ReactNode;
  className?: string;
}

export interface HeaderUserMenuProps {
  name?: string;
  email?: string;
  avatarUrl?: string;
  children?: React.ReactNode;
  className?: string;
}

export interface HeaderUserMenuItemProps {
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  className?: string;
}
