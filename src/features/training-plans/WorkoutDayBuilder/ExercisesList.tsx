'use client';

import { useState } from 'react';
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
import { Button } from '@/design-system';
import {
  ExerciseFormRow,
  SortableExerciseRow,
  defaultExerciseRow,
} from '../ExerciseFormRow';
import type { ExerciseRow } from '../ExerciseFormRow';
import { PlusIcon } from './icons';

export interface ExercisesListProps {
  exercises: ExerciseRow[];
  onChange: (exercises: ExerciseRow[]) => void;
  /**
   * Stable id for this list's `DndContext` (and sortable scope). Required for
   * correct SSR hydration: without it, @dnd-kit's global id counter diverges
   * between server and client (`aria-describedby` mismatch).
   */
  dndContextId: string;
}

/**
 * Lista de exercícios de um dia — sortável via drag-and-drop.
 *
 * Cada dia monta seu próprio `DndContext`/`SortableContext` para que arrastar
 * um exercício de um dia não afete os outros. O wrapper externo (dias) tem
 * seu próprio DnD independente, pois cada lista opera sobre uma coleção
 * diferente.
 */
export function ExercisesList({
  exercises,
  onChange,
  dndContextId,
}: ExercisesListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeExercise = activeId
    ? exercises.find((e) => e._id === activeId)
    : null;
  const activeIndex = activeId
    ? exercises.findIndex((e) => e._id === activeId)
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

  const addExercise = () => onChange([...exercises, defaultExerciseRow()]);

  const updateExercise = (exId: string, updates: Partial<ExerciseRow>) =>
    onChange(
      exercises.map((e) => (e._id === exId ? { ...e, ...updates } : e))
    );

  const removeExercise = (exId: string) =>
    onChange(exercises.filter((e) => e._id !== exId));

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(String(event.active.id));

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = exercises.findIndex((e) => e._id === active.id);
    const newIndex = exercises.findIndex((e) => e._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(exercises, oldIndex, newIndex));
  };

  const handleDragCancel = () => setActiveId(null);

  return (
    <div className="space-y-2 p-4">
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
          items={exercises.map((e) => e._id)}
          strategy={verticalListSortingStrategy}
        >
          {exercises.map((exercise, idx) => (
            <SortableExerciseRow
              key={exercise._id}
              exercise={exercise}
              index={idx}
              onUpdate={(updates) => updateExercise(exercise._id, updates)}
              onRemove={() => removeExercise(exercise._id)}
            />
          ))}
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 180 }}>
          {activeExercise ? (
            <ExerciseFormRow
              exercise={activeExercise}
              index={activeIndex}
              isDraggable
              isDragging
              onUpdate={() => {}}
              onRemove={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addExercise}
        className="mt-1 w-full border border-dashed border-border text-muted-foreground hover:text-foreground"
      >
        <PlusIcon className="mr-1.5 h-4 w-4" />
        Adicionar exercício
      </Button>
    </div>
  );
}
