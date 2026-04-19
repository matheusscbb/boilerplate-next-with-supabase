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
  student_name?: string | null;
}

export interface PlanCardProps {
  plan: PlanCardData;
}
