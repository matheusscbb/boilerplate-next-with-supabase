'use client';

import { useId, useState, useRef, useEffect, useCallback } from 'react';
import { exerciseDatabase, EXERCISE_CATEGORIES } from '@/shared/constants';
import type { Exercise } from '@/core/domain';
import type { ExerciseComboboxProps } from './ExerciseCombobox.types';
import { buildFlatList, normalize } from './helpers';
import { CheckIcon, ClearIcon, SearchIcon } from './icons';

export function ExerciseCombobox({
  value,
  onChange,
  displayNameFallback = '',
  placeholder = 'Buscar exercício…',
  disabled = false,
}: ExerciseComboboxProps) {
  // Stable id used to wire the combobox <input> to its listbox via aria-controls.
  const listboxId = useId();
  const selected = value ? exerciseDatabase.find((e) => e.id === value) ?? null : null;

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // ── Filtered results ───────────────────────────────────────────────────────

  const normQuery = normalize(query);
  const filtered: Exercise[] = normQuery
    ? exerciseDatabase.filter((e) => normalize(e.name).includes(normQuery))
    : exerciseDatabase;

  const flat = buildFlatList(filtered);

  // ── Close on outside click ─────────────────────────────────────────────────

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // Revert query to selected name if user typed but didn't pick
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // ── Scroll highlighted item into view ──────────────────────────────────────

  useEffect(() => {
    if (highlightIdx < 0 || !listRef.current) return;
    const item = listRef.current.querySelectorAll('[role="option"]')[highlightIdx];
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const selectExercise = useCallback(
    (ex: Exercise) => {
      onChange(ex.id, ex);
      setQuery('');
      setOpen(false);
      setHighlightIdx(-1);
    },
    [onChange]
  );

  const clearSelection = () => {
    onChange('', null);
    setQuery('');
    setHighlightIdx(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    setHighlightIdx(-1);
    // Clear selection when user starts typing a new query
    if (selected) onChange('', null);
  };

  const handleFocus = () => {
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx((prev) => Math.min(prev + 1, flat.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && flat[highlightIdx]) {
          selectExercise(flat[highlightIdx]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setQuery('');
        setHighlightIdx(-1);
        break;
    }
  };

  // When open and user is typing: show query.
  // When closed and something is selected: show exercise name.
  // Otherwise: typed query, or custom name from parent (e.g. loaded from DB).
  const fallbackClosed =
    (query.trim() || displayNameFallback.trim() || '').length > 0
      ? query.trim() || displayNameFallback
      : '';
  const inputValue = open ? query : selected ? selected.name : fallbackClosed;

  const groups = EXERCISE_CATEGORIES.map((cat) => ({
    category: cat,
    items: filtered.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input + icons */}
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
          <SearchIcon />
        </div>

        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          placeholder={selected ? '' : placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className={[
            'h-10 w-full rounded-md border border-border bg-background',
            'pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
          ].join(' ')}
        />

        {(selected || query.trim() || displayNameFallback.trim()) && (
          <button
            type="button"
            aria-label="Limpar seleção"
            onClick={clearSelection}
            className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-background shadow-md">
          {groups.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Nenhum exercício encontrado.
            </p>
          ) : (
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Exercícios"
              className="max-h-64 overflow-y-auto py-1"
            >
              {groups.map(({ category, items }) => (
                <li key={category} role="presentation">
                  <div className="sticky top-0 bg-muted px-3 py-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </span>
                  </div>

                  <ul>
                    {items.map((ex) => {
                      const idx = flat.indexOf(ex);
                      const isHighlighted = idx === highlightIdx;
                      const isSelected = ex.id === value;

                      return (
                        <li
                          key={ex.id}
                          role="option"
                          aria-selected={isSelected}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectExercise(ex);
                          }}
                          onMouseEnter={() => setHighlightIdx(idx)}
                          className={[
                            'flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition-colors',
                            isHighlighted
                              ? 'bg-primary/10 text-primary'
                              : isSelected
                                ? 'bg-primary/5 text-primary'
                                : 'text-foreground hover:bg-muted',
                          ].join(' ')}
                        >
                          <span>{ex.name}</span>
                          {isSelected && <CheckIcon />}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
