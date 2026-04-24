'use client';

import { Accordion } from '@/design-system';
import { ExercisesList } from './ExercisesList';
import {
  DayDragHandle,
  DayExpandTrigger,
  DayIndexBadge,
  DayNameField,
  DayScheduleBadge,
  DayStatusBadge,
  RemoveDayButton,
  RestDayMessage,
  RestDayToggleButton,
} from './parts';
import type { WorkoutDayBuilderProps } from './WorkoutDayBuilder.types';

/**
 * Card representing a single day of a training plan.
 *
 * Responsibilities are split across focused sub-components (parts/*):
 *   - Header: drag handle, index, name, schedule, status, toggles, trigger
 *   - Body: either the exercises list or the rest-day message
 *
 * This file is the thin orchestrator — no presentation logic beyond layout.
 */
export function WorkoutDayBuilder({
  day,
  index,
  scheduleLabel,
  canRemove = true,
  isDraggable = false,
  isDragging = false,
  dragHandleProps,
  setNodeRef,
  style,
  onUpdate,
  onRemove,
}: WorkoutDayBuilderProps) {
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'rounded-xl border border-border bg-background overflow-hidden',
        isDragging ? 'shadow-xl ring-2 ring-primary/40' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Accordion unstyled defaultValue={day._id}>
        <Accordion.Item value={day._id}>
          <Accordion.Header
            className={[
              'flex items-center gap-2 bg-background-secondary px-3 py-2.5 sm:gap-3 sm:px-4',
              'border-b border-transparent data-[state=open]:border-border transition-colors',
            ].join(' ')}
          >
            {isDraggable && <DayDragHandle handleProps={dragHandleProps} />}
            <DayIndexBadge index={index} muted={day.isRestDay} />
            <DayNameField
              value={day.name}
              onChange={(name) => onUpdate({ name })}
            />
            {scheduleLabel && <DayScheduleBadge label={scheduleLabel} />}
            <DayStatusBadge
              isRestDay={day.isRestDay}
              exerciseCount={day.exercises.length}
            />
            <RestDayToggleButton
              isRestDay={day.isRestDay}
              onToggle={() => onUpdate({ isRestDay: !day.isRestDay })}
            />
            {canRemove && <RemoveDayButton onRemove={onRemove} />}
            <DayExpandTrigger />
          </Accordion.Header>

          <Accordion.Content>
            {day.isRestDay ? (
              <RestDayMessage />
            ) : (
              <ExercisesList
                dndContextId={`plan-day-exercises-${day._id}`}
                exercises={day.exercises}
                onChange={(exercises) => onUpdate({ exercises })}
              />
            )}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
