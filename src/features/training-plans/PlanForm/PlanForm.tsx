'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Checkbox, Stack, Switch } from '@/design-system';
import { DaySchedulePicker } from '../DaySchedulePicker';
import { defaultDayRow } from '../WorkoutDayBuilder';
import { WorkoutDaysList } from '../WorkoutDaysList';
import { WEEKDAY_LABELS, WEEKDAY_SHORT } from './constants';
import { savePlan, updatePlan } from './helpers/save';
import { initialFormState, syncDaysToCount } from './helpers/schedule';
import { MuscleVolumeCounter } from './MuscleVolumeCounter';
import { Section } from './Section';
import type { FormState } from './PlanForm.types';

export interface PlanFormProps {
  /** When set, submit updates this plan instead of creating a new one. */
  planId?: string;
  initialState?: FormState;
}

export function PlanForm({ planId, initialState }: PlanFormProps = {}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(
    () => initialState ?? initialFormState()
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Generic field updater ──────────────────────────────────────────────────

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  // ── Day helpers ───────────────────────────────────────────────────────────

  const addDay = () =>
    setState((prev) => ({
      ...prev,
      days: [...prev.days, defaultDayRow(prev.days.length)],
    }));

  // Per-index weekday abbreviations (only relevant in `weekdays` mode).
  const scheduleLabels =
    state.scheduleMode === 'weekdays'
      ? state.weekdays.map((wd) => WEEKDAY_SHORT[wd])
      : undefined;

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (planId) {
        await updatePlan(planId, state);
      } else {
        await savePlan(state);
      }
      router.push('/plano-de-treino');
      router.refresh();
    } catch (err) {
      console.error('[PlanForm] save failed:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Erro ao salvar o plano.'
      );
      setLoading(false);
    }
  };

  const isValid =
    state.name.trim().length > 0 &&
    state.startDate.length > 0 &&
    state.days.length > 0 &&
    state.days.every((d) => d.name.trim().length > 0 && d.exercises.length > 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        {/* ── Informações do plano ── */}
        <Section title="Informações do plano">
          <Stack gap="md">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Nome do plano <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Ex: Hipertrofia — Fase 1"
                value={state.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Data de início <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={state.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Data de término{' '}
                  <span className="text-xs text-muted-foreground">(opcional)</span>
                </label>
                <Input
                  type="date"
                  value={state.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                  min={state.startDate}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={state.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
              />
              <span className="text-sm text-foreground">Plano ativo</span>
            </label>
          </Stack>
        </Section>

        {/* ── Programação ── */}
        <Section title="Programação dos treinos">
          <DaySchedulePicker
            mode={state.scheduleMode}
            weekdays={state.weekdays}
            intervalDays={state.intervalDays}
            cycleLength={state.cycleLength}
            onModeChange={(m) => {
              setState((prev) => {
                const requiredCount =
                  m === 'weekdays'
                    ? prev.weekdays.length
                    : m === 'cycle'
                      ? Math.max(1, parseInt(prev.cycleLength) || 1)
                      : null;
                const days =
                  requiredCount !== null
                    ? syncDaysToCount(prev.days, requiredCount)
                    : prev.days;
                return { ...prev, scheduleMode: m, days };
              });
            }}
            onWeekdaysChange={(nextWeekdays) => {
              setState((prev) => {
                const sorted = [...nextWeekdays].sort((a, b) => a - b);
                const newDays = sorted.map((wd, i) => {
                  const prevIdx = prev.weekdays.indexOf(wd);
                  if (prevIdx !== -1 && prevIdx < prev.days.length) {
                    return prev.days[prevIdx];
                  }
                  return { ...defaultDayRow(i), name: WEEKDAY_LABELS[wd] };
                });
                return { ...prev, weekdays: sorted, days: newDays };
              });
            }}
            onIntervalDaysChange={(v) => set('intervalDays', v)}
            onCycleLengthChange={(v) => {
              setState((prev) => {
                const count = Math.max(1, Math.min(30, parseInt(v) || 1));
                return {
                  ...prev,
                  cycleLength: v,
                  days: syncDaysToCount(prev.days, count),
                };
              });
            }}
          />
        </Section>

        {/* ── Dias de treino ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dias de treino
            </h2>
            <span className="text-xs text-muted-foreground">
              {state.days.length}{' '}
              {state.days.length === 1 ? 'dia' : 'dias'}
            </span>
          </div>

          <WorkoutDaysList
            days={state.days}
            onChange={(days) => set('days', days)}
            scheduleLabels={scheduleLabels}
            canRemove={state.scheduleMode === 'interval'}
          />

          {state.scheduleMode === 'interval' && (
            <Button
              type="button"
              variant="ghost"
              onClick={addDay}
              className="w-full border border-dashed border-border text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Adicionar dia de treino
            </Button>
          )}
        </div>

        {/* ── Volume por grupo muscular ── */}
        <Section title="Volume por grupo muscular">
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-foreground">
                  Contar volume indireto
                </span>
                <p className="text-xs text-muted-foreground">
                  1 série de Costas conta +0,5 de Bíceps · 1 série de Peito conta +0,5 de Tríceps
                </p>
              </div>
              <Switch
                checked={state.countHalfReps}
                onChange={(v) => set('countHalfReps', v)}
              />
            </label>

            <MuscleVolumeCounter
              days={state.days}
              countHalfReps={state.countHalfReps}
            />
          </div>
        </Section>

        {/* ── Actions ── */}
        <div className="space-y-3">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/plano-de-treino')}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={loading} disabled={!isValid}>
              {planId ? 'Salvar alterações' : 'Salvar plano'}
            </Button>
          </div>
        </div>
      </Stack>
    </form>
  );
}
