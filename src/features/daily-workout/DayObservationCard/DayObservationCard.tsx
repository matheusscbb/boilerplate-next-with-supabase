'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Textarea } from '@/design-system';
import { saveDayObservation, upsertWorkoutSession } from '../actions';
import { useDebouncedCallback } from '../useDebouncedCallback';
import type { DayObservationCardProps } from '../types';

export function DayObservationCard({
  sessionId,
  planId,
  performedOn,
  initialObservation,
  readOnly,
  onSessionCreated,
}: DayObservationCardProps) {
  const [value, setValue] = useState(initialObservation);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const sessionRef = useRef<string | null>(sessionId);
  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);

  const persist = useDebouncedCallback(async (text: string) => {
    setStatus('saving');
    try {
      let sid = sessionRef.current;
      if (!sid) {
        const s = await upsertWorkoutSession({ planId, performedOn });
        sid = s.id;
        sessionRef.current = sid;
        onSessionCreated(sid);
      }
      await saveDayObservation({ sessionId: sid, observation: text });
      setStatus('saved');
      setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 1200);
    } catch (e) {
      console.error('Falha ao salvar observação do dia:', e);
      setStatus('error');
    }
  }, 500);

  const onChange = useCallback(
    (text: string) => {
      setValue(text);
      persist(text);
    },
    [persist]
  );

  return (
    <section className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <header className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Observações do dia</h3>
        {status === 'saving' && (
          <span className="text-[11px] text-muted-foreground">Salvando…</span>
        )}
        {status === 'saved' && (
          <span className="text-[11px] text-green-600 dark:text-green-400">Salvo</span>
        )}
        {status === 'error' && (
          <span className="text-[11px] text-destructive">Erro ao salvar</span>
        )}
      </header>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        disabled={readOnly}
        rows={3}
        placeholder={
          readOnly
            ? ''
            : 'Como foi o treino hoje? Como estava o corpo, sono, alimentação…'
        }
      />
    </section>
  );
}
