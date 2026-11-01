'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { clean, toIso } from '@/lib/utils';

export async function createSession(fd: FormData) {
  const { supabase, user } = await requireRole(['admin', 'rh']);
  const p = z.object({ title: z.string().min(3).max(120), kind: z.enum(['meeting', 'training', 'event']), session_date: z.string().min(1), event_id: z.string().uuid().optional() }).parse(clean(Object.fromEntries(fd)));
  const { data, error } = await supabase.from('attendance_sessions').insert({ ...p, session_date: toIso(p.session_date), created_by: user.id }).select('id').single();
  if (error) throw new Error(error.message);
  redirect(`/rh/presences/${data.id}`);
}

export async function saveAttendance(fd: FormData) {
  const { supabase } = await requireRole(['admin', 'rh']);
  const session_id = String(fd.get('session_id'));
  const valid = ['present', 'absent', 'late', 'excused'];
  const rows = [...fd.entries()].filter(([k, v]) => k.startsWith('s_') && valid.includes(String(v))).map(([k, v]) => ({ session_id, member_id: k.slice(2), status: String(v) }));
  if (rows.length) {
    const { error } = await supabase.from('attendance_records').upsert(rows, { onConflict: 'session_id,member_id' });
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/rh/presences/${session_id}`); revalidatePath('/rh/presences');
}

export async function reviewAbsence(fd: FormData) {
  const { supabase, user } = await requireRole(['admin', 'rh']);
  const decision = z.enum(['approved', 'rejected']).parse(fd.get('decision'));
  const { error } = await supabase.from('absence_requests').update({ status: decision, rh_comment: String(fd.get('comment') ?? ''), reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', String(fd.get('id')));
  if (error) throw new Error(error.message);
  revalidatePath('/rh');
}
