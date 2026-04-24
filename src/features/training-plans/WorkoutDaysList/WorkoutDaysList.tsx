'use client';

import { useId, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import { Stack } from '@/design-system';
import {
  SortableWorkoutDay,
  WorkoutDayBuilder,
} from '../WorkoutDayBuilder';
import type { DayRow } from '../WorkoutDayBuilder';

export interface WorkoutDaysListProps {
  days: DayRow[];
  onChange: (days: DayRow[]) => void;
  /** Per-index schedule label (e.g. weekday abbreviation). Optional. */
  scheduleLabels?: (string | undefined)[];
  /** Show the destructive "remove day" button on each card. */
  canRemove?: boolean;
}

/**
 * Lista ordenável dos dias de um plano.
 *
 * Encapsula todo o setup de drag-and-drop: sensores, modifiers, DragOverlay,
 * update de estado via `arrayMove`. O consumidor (ex.: `PlanForm`) só precisa
 * passar a coleção, um `onChange` e, opcionalmente, rótulos por índice.
 *
 * Segue o mesmo padrão de `ExercisesList` — cada lista tem seu próprio
 * `DndContext` independente.
 */
export function WorkoutDaysList({
  days,
  onChange,
  scheduleLabels,
  canRemove = false,
}: WorkoutDaysListProps) {
  const dndContextId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeDay = activeId ? days.find((d) => d._id === activeId) : null;
  const activeIndex = activeId
    ? days.findIndex((d) => d._id === activeId)
    : -1;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateDay = (dayId: string, updates: Partial<Omit<DayRow, '_id'>>) =>
    onChange(days.map((d) => (d._id === dayId ? { ...d, ...updates } : d)));

  const removeDay = (dayId: string) =>
    onChange(days.filter((d) => d._id !== dayId));

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(String(event.active.id));

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = days.findIndex((d) => d._id === active.id);
    const newIndex = days.findIndex((d) => d._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(days, oldIndex, newIndex));
  };

  const handleDragCancel = () => setActiveId(null);

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        id={`${dndContextId}-sortable`}
        items={days.map((d) => d._id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack gap="md">
          {days.map((day, idx) => (
            <SortableWorkoutDay
              key={day._id}
              day={day}
              index={idx}
              scheduleLabel={scheduleLabels?.[idx]}
              canRemove={canRemove}
              onUpdate={(updates) => updateDay(day._id, updates)}
              onRemove={() => removeDay(day._id)}
            />
          ))}
        </Stack>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 180 }}>
        {activeDay ? (
          <WorkoutDayBuilder
            day={activeDay}
            index={activeIndex}
            scheduleLabel={scheduleLabels?.[activeIndex]}
            canRemove={false}
            isDraggable
            isDragging
            onUpdate={() => {}}
            onRemove={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
