'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button, Checkbox, Textarea } from '@/design-system';
import { SetRow } from '../SetRow';
import type { SetRowValue } from '../SetRow';
import { useDebouncedCallback } from '../useDebouncedCallback';
import {
  deleteSetLog,
  ensureExerciseLog,
  saveExerciseObservation,
  saveSetLog,
  toggleExerciseCompleted,
  upsertWorkoutSession,
} from '../actions';
import type { ExerciseLogCardProps } from './ExerciseLogCard.types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface LocalState {
  logId: string | null;
  sets: SetRowValue[];
  observation: string;
  completed: boolean;
}

function formatRestSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m}min`;
  return `${m}min ${s}s`;
}

function toInitialSets(
  log: ExerciseLogCardProps['initialLog'],
  prescribedSets: number | null
): SetRowValue[] {
  const prescribed = prescribedSets ?? 0;
  if (log?.sets && log.sets.length > 0) {
    return [...log.sets]
      .sort((a, b) => a.set_number - b.set_number)
      .map((s) => ({
        id: s.id,
        setNumber: s.set_number,
        reps: s.reps,
        weightKg: s.weight_kg,
        completedAt: s.completed_at ?? null,
        isExtra: s.set_number > prescribed,
      }));
  }
  const count = Math.max(0, Math.min(prescribed, 12));
  return Array.from({ length: count }, (_, i) => ({
    id: null,
    setNumber: i + 1,
    reps: null,
    weightKg: null,
    completedAt: null,
    isExtra: false,
  }));
}

function ExerciseLogCardImpl({
  exercise,
  initialLog,
  sessionId,
  planId,
  performedOn,
  readOnly,
  onSessionCreated,
}: ExerciseLogCardProps) {
  const [state, setState] = useState<LocalState>(() => ({
    logId: initialLog?.id ?? null,
    sets: toInitialSets(initialLog, exercise.sets),
    observation: initialLog?.observation ?? '',
    completed: !!initialLog?.completed_at,
  }));
  const [status, setStatus] = useState<SaveStatus>('idle');

  // Track the latest resolved session/log ids across async calls without races.
  const sessionRef = useRef<string | null>(sessionId);
  const logRef = useRef<string | null>(state.logId);
  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);
  useEffect(() => {
    logRef.current = state.logId;
  }, [state.logId]);

  const ensureIds = useCallback(async (): Promise<{ sessionId: string; logId: string }> => {
    let sid = sessionRef.current;
    if (!sid) {
      const s = await upsertWorkoutSession({ planId, performedOn });
      sid = s.id;
      sessionRef.current = sid;
      onSessionCreated(sid);
    }
    let lid = logRef.current;
    if (!lid) {
      const l = await ensureExerciseLog({ sessionId: sid, exerciseId: exercise.id });
      lid = l.id;
      logRef.current = lid;
      setState((prev) => ({ ...prev, logId: lid }));
    }
    return { sessionId: sid, logId: lid };
  }, [exercise.id, onSessionCreated, performedOn, planId]);

  const withStatus = useCallback(
    async (run: () => Promise<void>) => {
      setStatus('saving');
      try {
        await run();
        setStatus('saved');
        setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 1200);
      } catch (e) {
        console.error('Falha ao salvar log:', e);
        setStatus('error');
      }
    },
    []
  );

  const persistObservation = useDebouncedCallback((text: string) => {
    void withStatus(async () => {
      const { logId } = await ensureIds();
      await saveExerciseObservation({ exerciseLogId: logId, observation: text });
    });
  }, 500);

  const persistSet = useDebouncedCallback((row: SetRowValue) => {
    void withStatus(async () => {
      const { logId } = await ensureIds();
      const saved = await saveSetLog({
        exerciseLogId: logId,
        setNumber: row.setNumber,
        reps: row.reps,
        weightKg: row.weightKg,
        completedAt: row.completedAt,
      });
      setState((prev) => ({
        ...prev,
        sets: prev.sets.map((s) =>
          s.setNumber === row.setNumber
            ? { ...s, id: saved.id, completedAt: saved.completed_at }
            : s
        ),
      }));
    });
  }, 500);

  const updateSet = useCallback(
    (row: SetRowValue) => {
      setState((prev) => ({
        ...prev,
        sets: prev.sets.map((s) => (s.setNumber === row.setNumber ? row : s)),
      }));
      persistSet(row);
    },
    [persistSet]
  );

  const removeSet = useCallback(
    (row: SetRowValue) => {
      setState((prev) => ({
        ...prev,
        sets: prev.sets
          .filter((s) => s.setNumber !== row.setNumber)
          .map((s, i) => ({ ...s, setNumber: i + 1 })),
      }));
      if (row.id) {
        void withStatus(async () => {
          await deleteSetLog({ id: row.id! });
        });
      }
    },
    [withStatus]
  );

  const addSet = useCallback(() => {
    setState((prev) => {
      const next = [...prev.sets];
      next.push({
        id: null,
        setNumber: next.length + 1,
        reps: null,
        weightKg: null,
        completedAt: null,
        isExtra: true,
      });
      return { ...prev, sets: next };
    });
  }, []);

  const toggleCompleted = useCallback(
    (completed: boolean) => {
      setState((prev) => ({ ...prev, completed }));
      void withStatus(async () => {
        const { logId } = await ensureIds();
        await toggleExerciseCompleted({ exerciseLogId: logId, completed });
      });
    },
    [ensureIds, withStatus]
  );

  const updateObservation = useCallback(
    (text: string) => {
      setState((prev) => ({ ...prev, observation: text }));
      persistObservation(text);
    },
    [persistObservation]
  );

  const isCardio = exercise.exercise_type === 'cardio';
  const restLabel =
    exercise.rest_seconds && exercise.rest_seconds > 0
      ? formatRestSeconds(exercise.rest_seconds)
      : null;

  return (
    <article className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{exercise.name}</h3>
            {isCardio ? (
              <Badge variant="info" size="sm">Cardio</Badge>
            ) : (
              <Badge variant="primary" size="sm">Força</Badge>
            )}
            {!isCardio && exercise.sets && exercise.reps_range && (
              <span className="text-xs text-muted-foreground">
                {exercise.sets} × {exercise.reps_range}
              </span>
            )}
            {!isCardio && restLabel && (
              <span className="text-xs text-muted-foreground">
                Descanso {restLabel}
              </span>
            )}
          </div>
          <StatusLabel status={status} />
        </div>

        <div className="shrink-0">
          <Checkbox
            label="Concluído"
            checked={state.completed}
            disabled={readOnly}
            onChange={(e) => toggleCompleted(e.target.checked)}
          />
        </div>
      </header>

      {!isCardio ? (
        <div className="space-y-2">
          {state.sets.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma série registrada.</p>
          ) : (
            state.sets.map((s) => (
              <SetRow
                key={`${s.setNumber}-${s.id ?? 'new'}`}
                value={s}
                readOnly={readOnly}
                restSeconds={exercise.rest_seconds}
                onChange={updateSet}
                onRemove={() => removeSet(s)}
              />
            ))
          )}
          {!readOnly && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={addSet}
              className="mt-1"
            >
              + Adicionar série extra
            </Button>
          )}
        </div>
      ) : (
        <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Cardio: registre a execução completa no campo de observações abaixo.
        </p>
      )}

      <div className="mt-4">
        <label
          htmlFor={`obs-${exercise.id}`}
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Observações do exercício
        </label>
        <Textarea
          id={`obs-${exercise.id}`}
          value={state.observation}
          onChange={(e) => updateObservation(e.target.value)}
          readOnly={readOnly}
          disabled={readOnly}
          rows={2}
          resize="vertical"
          placeholder={readOnly ? '' : 'Ex.: falha na última série com 62.5kg'}
        />
      </div>
    </article>
  );
}

function StatusLabel({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;
  const map: Record<Exclude<SaveStatus, 'idle'>, { text: string; tone: string }> = {
    saving: { text: 'Salvando…', tone: 'text-muted-foreground' },
    saved: { text: 'Salvo', tone: 'text-green-600 dark:text-green-400' },
    error: { text: 'Erro ao salvar', tone: 'text-destructive' },
  };
  const { text, tone } = map[status];
  return <p className={`mt-0.5 text-[11px] ${tone}`}>{text}</p>;
}

export const ExerciseLogCard = memo(ExerciseLogCardImpl);
