import type { HTMLAttributes, LiHTMLAttributes } from 'react';

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  variant?: 'unordered' | 'ordered' | 'none';
}

export interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}
