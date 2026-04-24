'use client';

import { Accordion } from '@/design-system';
import { ChevronDownIcon } from '../icons';

/**
 * Chevron icon wrapped in `Accordion.Trigger`. Must be used inside an
 * `Accordion.Item` — toggles the item open/closed and rotates 180° via the
 * `data-state` attribute propagated down to the chevron.
 */
export function DayExpandTrigger() {
  return (
    <Accordion.Trigger
      aria-label="Expandir ou recolher dia"
      className="group/trigger h-7 w-7 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180" />
    </Accordion.Trigger>
  );
}
