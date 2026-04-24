import type { ReactNode } from 'react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fecha ao clicar fora do conteúdo. */
  closeOnOverlayClick?: boolean;
  /** Fecha ao apertar Esc. */
  closeOnEscape?: boolean;
  children: ReactNode;
  className?: string;
  /** Largura máxima do conteúdo. */
  size?: 'sm' | 'md' | 'lg';
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface DialogBodyProps {
  children: ReactNode;
  className?: string;
}

export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}
