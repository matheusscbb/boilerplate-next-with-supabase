import type { ScheduleConfig } from '@/core/domain';

export interface PlanCardData {
  id: string;
  name: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  schedule_type: string;
  schedule_config: ScheduleConfig;
  day_count: number;
  /** How many students this plan is attached to (0 when not assigned yet). */
  assignment_count: number;
}

export interface PlanCardProps {
  plan: PlanCardData;
}
