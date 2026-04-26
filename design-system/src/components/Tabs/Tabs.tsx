'use client';

import { createContext, useContext } from 'react';
import type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsPanelProps,
} from './Tabs.types';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* deve ser usado dentro de <Tabs>.');
  return ctx;
}

function TabsRoot({
  value,
  onChange,
  children,
  className = '',
  'aria-label': ariaLabel,
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div role="tablist" aria-label={ariaLabel} className={className || undefined}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div
      className={[
        'inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, children, disabled, className = '' }: TabsTriggerProps) {
  const { value: active, onChange } = useTabsContext();
  const selected = active === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      onClick={() => onChange(value)}
      className={[
        'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        selected
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

function TabsPanel({ value, children, className = '' }: TabsPanelProps) {
  const { value: active } = useTabsContext();
  if (active !== value) return null;
  return (
    <div role="tabpanel" className={className || undefined}>
      {children}
    </div>
  );
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
});
