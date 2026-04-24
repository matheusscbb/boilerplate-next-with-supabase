'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/infra/supabase/server';

export async function updateProfileName(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const fullName = (formData.get('fullName') as string | null)?.trim() ?? '';

  if (!fullName) {
    return { error: 'O nome não pode ficar em branco.', success: false };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.', success: false };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id);

  if (profileError) {
    return { error: profileError.message, success: false };
  }

  // Keep auth user_metadata in sync so AppHeader shows the updated name.
  await supabase.auth.updateUser({ data: { full_name: fullName } });

  revalidatePath('/perfil');
  return { error: null, success: true };
}
