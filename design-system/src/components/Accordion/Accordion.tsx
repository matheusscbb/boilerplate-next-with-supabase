'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import type {
  AccordionContentProps,
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
} from './Accordion.types';

// ─── Contexts ─────────────────────────────────────────────────────────────────

interface AccordionRootContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}

const AccordionRootContext = createContext<AccordionRootContextValue | null>(
  null
);

function useAccordionRoot() {
  const ctx = useContext(AccordionRootContext);
  if (!ctx)
    throw new Error('Accordion.* deve ser usado dentro de <Accordion>.');
  return ctx;
}

interface AccordionItemContextValue {
  value: string;
  open: boolean;
  disabled: boolean;
  headerId: string;
  contentId: string;
  toggle: () => void;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null
);

function useAccordionItem() {
  const ctx = useContext(AccordionItemContext);
  if (!ctx)
    throw new Error(
      'Accordion.Header / Trigger / Content devem ser usados dentro de <Accordion.Item>.'
    );
  return ctx;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function AccordionRoot(props: AccordionProps) {
  const {
    type = 'single',
    unstyled = false,
    className = '',
    children,
    ...rest
  } = props as AccordionProps & {
    type?: 'single' | 'multiple';
    className?: string;
  };

  // Normalise controlled / uncontrolled state for both modes.
  const isMultiple = type === 'multiple';

  const defaultOpen: string[] = isMultiple
    ? ((props as { defaultValue?: string[] }).defaultValue ?? [])
    : (() => {
        const dv = (props as { defaultValue?: string | null }).defaultValue;
        return dv ? [dv] : [];
      })();

  const controlledOpen: string[] | undefined = (() => {
    if (isMultiple) return (props as { value?: string[] }).value;
    const v = (props as { value?: string | null }).value;
    if (v === undefined) return undefined;
    return v === null ? [] : [v];
  })();

  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultOpen);
  const open = controlledOpen ?? uncontrolled;

  const setOpen = useCallback(
    (next: string[]) => {
      if (controlledOpen === undefined) setUncontrolled(next);
      if (isMultiple) {
        (props as { onValueChange?: (v: string[]) => void }).onValueChange?.(
          next
        );
      } else {
        (
          props as { onValueChange?: (v: string | null) => void }
        ).onValueChange?.(next[0] ?? null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [controlledOpen, isMultiple]
  );

  const collapsible = isMultiple
    ? true
    : ((props as { collapsible?: boolean }).collapsible ?? true);

  const toggle = useCallback(
    (value: string) => {
      const isOpen = open.includes(value);
      if (isMultiple) {
        setOpen(isOpen ? open.filter((v) => v !== value) : [...open, value]);
      } else if (isOpen) {
        if (collapsible) setOpen([]);
      } else {
        setOpen([value]);
      }
    },
    [open, isMultiple, collapsible, setOpen]
  );

  const ctxValue = useMemo<AccordionRootContextValue>(
    () => ({
      isOpen: (value: string) => open.includes(value),
      toggle,
    }),
    [open, toggle]
  );

  return (
    <AccordionRootContext.Provider value={ctxValue}>
      <div
        className={[
          unstyled
            ? ''
            : 'divide-y divide-border rounded-lg border border-border',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </div>
    </AccordionRootContext.Provider>
  );
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function Item({
  value,
  disabled = false,
  className = '',
  children,
  ...rest
}: AccordionItemProps) {
  const { isOpen, toggle } = useAccordionRoot();
  const open = isOpen(value);
  const reactId = useId();
  const headerId = `acc-header-${reactId}`;
  const contentId = `acc-content-${reactId}`;

  const itemCtx = useMemo<AccordionItemContextValue>(
    () => ({
      value,
      open,
      disabled,
      headerId,
      contentId,
      toggle: () => {
        if (!disabled) toggle(value);
      },
    }),
    [value, open, disabled, headerId, contentId, toggle]
  );

  return (
    <AccordionItemContext.Provider value={itemCtx}>
      <div
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        className={className || undefined}
        {...rest}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ className = '', children, ...rest }: AccordionHeaderProps) {
  const { open, headerId } = useAccordionItem();
  return (
    <div
      id={headerId}
      data-state={open ? 'open' : 'closed'}
      className={className || undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

// ─── Trigger ──────────────────────────────────────────────────────────────────

function Trigger({
  className = '',
  children,
  onClick,
  disabled: disabledProp,
  ...rest
}: AccordionTriggerProps) {
  const { open, toggle, contentId, headerId, disabled } = useAccordionItem();
  const isDisabled = disabledProp ?? disabled;

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={contentId}
      aria-labelledby={headerId}
      data-state={open ? 'open' : 'closed'}
      disabled={isDisabled}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) toggle();
      }}
      className={[
        'inline-flex items-center justify-center transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

// Keep in sync with the `duration-200` class on the grid wrapper below.
const CONTENT_TRANSITION_MS = 200;

function Content({
  className = '',
  children,
  unmountOnClose = false,
  ...rest
}: AccordionContentProps) {
  const { open, contentId, headerId } = useAccordionItem();

  // Switch from `overflow-hidden` to `overflow-visible` only AFTER the open
  // animation settles, so children like dropdowns / popovers are not clipped.
  // On close we flip back to hidden immediately so the collapse animation
  // keeps working.
  const [overflowVisible, setOverflowVisible] = useState(open);

  useEffect(() => {
    if (!open) {
      setOverflowVisible(false);
      return;
    }
    const id = window.setTimeout(
      () => setOverflowVisible(true),
      CONTENT_TRANSITION_MS
    );
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={headerId}
      aria-hidden={!open}
      data-state={open ? 'open' : 'closed'}
      className={[
        'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <div
        className={`min-h-0 ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}`}
      >
        {unmountOnClose && !open ? null : children}
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const Accordion = Object.assign(AccordionRoot, {
  Item,
  Header,
  Trigger,
  Content,
});
