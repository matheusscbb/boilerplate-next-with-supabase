import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export type AccordionType = 'single' | 'multiple';

interface AccordionBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /**
   * Render children without the default bordered container. Useful when each
   * item is styled as an independent card (e.g. drag-and-drop lists).
   */
  unstyled?: boolean;
  children: ReactNode;
}

export interface AccordionSingleProps extends AccordionBaseProps {
  type?: 'single';
  /** Allow the current open item to be closed by clicking it again. Defaults to `true`. */
  collapsible?: boolean;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

export interface AccordionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface AccordionTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * When true, children are unmounted while closed. Defaults to `false` so
   * form state inside the panel is preserved across open/close transitions.
   */
  unmountOnClose?: boolean;
  children: ReactNode;
}
