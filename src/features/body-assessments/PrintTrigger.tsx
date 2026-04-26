'use client';

import { useEffect } from 'react';

/**
 * Auto-triggers the browser's print dialog right after mount. This is the
 * mechanism we use to "export PDF" — the user just hits "Save as PDF" in
 * the print dialog. Re-runs are guarded by a flag on `window` so React
 * StrictMode in development doesn't fire it twice.
 */
export function PrintTrigger({ delayMs = 350 }: { delayMs?: number }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as Window & { __assessmentAutoPrinted?: boolean };
    if (w.__assessmentAutoPrinted) return;
    w.__assessmentAutoPrinted = true;
    const timer = window.setTimeout(() => {
      window.print();
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return null;
}

export function PrintActions() {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Imprimir / Salvar PDF
      </button>
      <button
        type="button"
        onClick={() => window.close()}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
      >
        Fechar
      </button>
    </div>
  );
}
