'use server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';

export type CheckInResult = { ok: boolean; message: string; member?: string; student_id?: string; event?: string };

/** Valide la présence via la fonction SQL check_in (empêche les doublons, vérifie le responsable de l'événement). */
export async function checkInToken(token: string): Promise<CheckInResult> {
  const { supabase } = await requireRole(['admin', 'event_manager']);
  const { data, error } = await supabase.rpc('check_in', { p_token: token.trim() });
  if (error) return { ok: false, message: error.message };
  revalidatePath('/gestionnaire', 'layout');
  return { ok: true, message: 'Présence validée', ...(data as any) };
}
export async function checkInForm(fd: FormData) {
  await checkInToken(String(fd.get('token')));
}
