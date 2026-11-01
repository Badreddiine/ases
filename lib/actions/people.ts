'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function setStatus(fd: FormData) {
  const { supabase } = await requireRole(['admin', 'rh']);
  const status = z.enum(['active', 'pending', 'suspended']).parse(fd.get('status'));
  const { error } = await supabase.from('profiles').update({ status }).eq('id', String(fd.get('id')));
  if (error) throw new Error(error.message);
  revalidatePath('/rh'); revalidatePath('/admin/membres'); revalidatePath('/admin/comptes');
}

export async function setRole(fd: FormData) {
  const { supabase, user } = await requireRole(['admin']);
  const id = String(fd.get('id'));
  if (id === user.id) throw new Error('Vous ne pouvez pas modifier votre propre rôle.');
  const role = z.enum(['admin', 'rh', 'member', 'event_manager']).parse(fd.get('role'));
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/comptes');
}

const profile = z.object({ full_name: z.string().min(2).max(100), phone: z.string().max(30).optional(), student_id: z.string().max(30).optional(), avatar_url: z.string().optional() });
export async function updateProfile(fd: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const raw = Object.fromEntries(fd); const sections = fd.getAll('sections').map(String);
  const p = profile.parse(Object.fromEntries(Object.entries(raw).filter(([k, v]) => v !== '' && !k.startsWith('$ACTION') && k !== 'sections')));
  const { error } = await supabase.from('profiles').update(p).eq('id', user.id);
  if (error) throw new Error(error.message);
  await supabase.from('member_sections').delete().eq('member_id', user.id);
  if (sections.length) await supabase.from('member_sections').insert(sections.map((s) => ({ member_id: user.id, section_id: s })));
  revalidatePath('/membre');
}
