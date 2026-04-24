'use client';

import { useState } from 'react';
import { Button } from '@/design-system';
import { InviteDialog } from './InviteDialog';

/**
 * Client-side header actions rendered next to the page title. Keeps the
 * Invite dialog's open/close state outside the page (which is server-side).
 */
export function InviteButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Convidar aluno
      </Button>
      <InviteDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
