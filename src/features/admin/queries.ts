import type { SupabaseClient } from '@supabase/supabase-js';
import type { TrainerRow, StudentRow } from './types';

type AnySupabase = SupabaseClient;

export async function listAllTrainers(supabase: AnySupabase): Promise<TrainerRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, is_active, created_at, license_expires_at')
    .eq('role', 'trainer')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const trainerIds = data.map((t) => t.id);
  let studentCounts: Record<string, number> = {};

  if (trainerIds.length > 0) {
    const { data: students } = await supabase
      .from('profiles')
      .select('coach_id')
      .in('coach_id', trainerIds)
      .eq('role', 'student');

    if (students) {
      studentCounts = students.reduce<Record<string, number>>((acc, s) => {
        if (s.coach_id) acc[s.coach_id] = (acc[s.coach_id] ?? 0) + 1;
        return acc;
      }, {});
    }
  }

  return data.map((row) => ({
    id: row.id,
    full_name: row.full_name,
    email: null,
    is_active: row.is_active ?? true,
    student_count: studentCounts[row.id] ?? 0,
    created_at: row.created_at,
    license_expires_at: row.license_expires_at ?? null,
  }));
}

export async function listAllStudents(supabase: AnySupabase): Promise<StudentRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      is_active,
      coach_id,
      created_at,
      coach:profiles!coach_id(full_name)
    `)
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const coach = Array.isArray(row.coach) ? row.coach[0] : row.coach;
    return {
      id: row.id,
      full_name: row.full_name,
      email: null,
      is_active: row.is_active ?? true,
      coach_id: row.coach_id,
      coach_name: coach?.full_name ?? null,
      created_at: row.created_at,
    };
  });
}
