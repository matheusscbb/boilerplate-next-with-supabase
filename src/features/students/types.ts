import type { Profile } from '@/core/domain';

/**
 * Lightweight profile row shown in the coach's students list.
 * Derived from `profiles` where `coach_id = me`.
 */
export interface StudentSummary {
  id: string;
  full_name: string | null;
  created_at: string;
  active_plan_name: string | null;
}

/** Minimal plan info required by the assign-plan picker. */
export interface AssignablePlan {
  id: string;
  name: string;
  is_active: boolean;
}

/** Active invite links created by the coach and still valid. */
export interface CoachInviteSummary {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
}

export type { Profile };
