import type {
  TrainingPlanFull,
  WorkoutSessionFull,
  WorkoutSessionSummary,
} from '@/core/domain';

export interface DailyWorkoutPanelProps {
  plan: TrainingPlanFull | null;
  /** Selected day ISO `YYYY-MM-DD`. */
  selectedDate: string;
  /** "Today" in the user's locale (computed on the server as UTC fallback). */
  today: string;
  /** First day of the currently displayed calendar month. */
  monthISO: string;
  /**
   * Lightweight sessions summary for the current month (used only to decorate
   * the calendar). One entry per `performed_on` date.
   */
  monthSessions: WorkoutSessionSummary[];
  /**
   * Full session for the currently selected date, if already persisted.
   * `null` means "no session yet — will be created lazily on first edit".
   */
  selectedSession: WorkoutSessionFull | null;
  /**
   * When there is no active plan and the user is a coach, show copy that points
   * to self-assigning a plan instead of "ask your trainer".
   */
  emptyPlanCoachHint?: boolean;
}

export interface WorkoutCalendarProps {
  plan: TrainingPlanFull | null;
  selectedDate: string;
  monthISO: string;
  monthSessions: WorkoutSessionSummary[];
  today: string;
}

export interface DayObservationCardProps {
  sessionId: string | null;
  planId: string;
  performedOn: string;
  initialObservation: string;
  readOnly: boolean;
  onSessionCreated: (sessionId: string) => void;
}
