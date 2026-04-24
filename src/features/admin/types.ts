export interface TrainerRow {
  id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  student_count: number;
  created_at: string;
  /** NULL = never expires. ISO timestamp string when set. */
  license_expires_at: string | null;
}

export interface StudentRow {
  id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  coach_id: string | null;
  coach_name: string | null;
  created_at: string;
}

export interface TrainerInviteSummary {
  id: string;
  token: string;
  url: string;
  created_at: string;
  expires_at: string;
}

export interface AdminPanelProps {
  trainers: TrainerRow[];
  students: StudentRow[];
  allTrainers: Pick<TrainerRow, 'id' | 'full_name'>[];
}
