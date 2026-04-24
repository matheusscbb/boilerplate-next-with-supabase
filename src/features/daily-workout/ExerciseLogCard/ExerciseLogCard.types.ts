import type {
  ExerciseInDay,
  ExerciseLogWithSets,
} from '@/core/domain';

export interface ExerciseLogCardProps {
  exercise: ExerciseInDay;
  initialLog: ExerciseLogWithSets | null;
  /** Must exist before any write succeeds. `null` = session will be created on demand. */
  sessionId: string | null;
  planId: string;
  performedOn: string;
  readOnly: boolean;
  /** Reports back a created session id so the panel can propagate it. */
  onSessionCreated: (sessionId: string) => void;
}
