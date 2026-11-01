'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { clean } from '@/lib/utils';

const schema = z.object({ start_date: z.string(), end_date: z.string(), reason: z.string().min(3).max(200), description: z.string().max(1000).optional(), document_url: z.string().optional() });

export async function submitAbsence(fd: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const p = schema.parse(clean(Object.fromEntries(fd)));
  if (p.end_date < p.start_date) throw new Error('La date de fin doit suivre la date de début.');
  const { error } = await supabase.from('absence_requests').insert({ ...p, member_id: user.id });
  if (error) throw new Error(error.message);
  revalidatePath('/membre');
}
export async function markRead(fd: FormData) {
  await createClient().from('notifications').update({ is_read: true }).eq('id', String(fd.get('id')));
  revalidatePath('/membre'); revalidatePath('/membre/notifications');
}
export async function markAllRead() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  revalidatePath('/membre/notifications'); revalidatePath('/', 'layout');
}
