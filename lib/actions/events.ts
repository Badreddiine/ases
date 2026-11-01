'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { clean, toIso } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(3).max(150), description: z.string().max(5000).optional(), category: z.string().max(50).optional(),
  location: z.string().max(150).optional(), poster_url: z.string().optional(), conditions: z.string().max(1000).optional(),
  capacity: z.coerce.number().int().min(1).max(100000), status: z.enum(['draft', 'published', 'full', 'completed', 'cancelled']),
  starts_at: z.string().min(1), registration_deadline: z.string().optional(), allow_cancel_until: z.string().optional(), manager_id: z.string().uuid().optional(),
});

export async function saveEvent(fd: FormData) {
  const { supabase, user, profile } = await requireRole(['admin', 'event_manager']);
  const id = fd.get('id') as string | null;
  const base = String(fd.get('base') ?? '/admin/evenements');
  const p = schema.parse(clean(Object.fromEntries(fd)));
  const payload: Record<string, any> = { ...p, starts_at: toIso(p.starts_at), registration_deadline: toIso(p.registration_deadline), allow_cancel_until: toIso(p.allow_cancel_until) };
  if (profile.role === 'event_manager') payload.manager_id = user.id;
  let eventId = id;
  if (id) {
    const { error } = await supabase.from('events').update(payload).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase.from('events').insert({ ...payload, created_by: user.id }).select('id').single();
    if (error) throw new Error(error.message);
    eventId = data.id;
  }
  if (p.status === 'published' && fd.get('announce') === 'on') await supabase.rpc('announce_event', { p_event: eventId });
  revalidatePath('/evenements'); revalidatePath(base);
  redirect(base);
}

export async function setEventStatus(fd: FormData) {
  const { supabase } = await requireRole(['admin', 'event_manager']);
  const { error } = await supabase.from('events').update({ status: String(fd.get('status')) }).eq('id', String(fd.get('id')));
  if (error) throw new Error(error.message);
  revalidatePath('/evenements'); revalidatePath(String(fd.get('base')));
}

export async function deleteEvent(fd: FormData) {
  const { supabase } = await requireRole(['admin', 'event_manager']);
  const { error } = await supabase.from('events').delete().eq('id', String(fd.get('id')));
  if (error) throw new Error(error.message);
  revalidatePath(String(fd.get('base')));
}
