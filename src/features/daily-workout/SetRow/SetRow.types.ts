export interface SetRowValue {
  /** Row identifier from the DB (null = not yet persisted). */
  id: string | null;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  /** ISO timestamp when the user ticked "set concluída". Null = pending. */
  completedAt: string | null;
  /** True for sets added by the student beyond the prescribed count. */
  isExtra?: boolean;
}

export interface SetRowProps {
  value: SetRowValue;
  readOnly: boolean;
  /**
   * Prescribed rest seconds between sets (same for every set of the
   * exercise — we display it per set as a reminder).
   */
  restSeconds?: number | null;
  onChange: (next: SetRowValue) => void;
  onRemove: () => void;
}
