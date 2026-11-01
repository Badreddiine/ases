'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { clean } from '@/lib/utils';

const board = z.object({
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, 'Format attendu : 2026-2027'), title: z.string().max(150).optional(), description: z.string().max(2000).optional(),
  start_date: z.string().optional(), end_date: z.string().optional(), group_photo_url: z.string().optional(), president_message: z.string().max(2000).optional(),
});
const refresh = () => { revalidatePath('/admin/bureau'); revalidatePath('/bureau'); revalidatePath('/anciens-bureaux'); };

export async function createBoard(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  const { error } = await supabase.from('boards').insert(board.parse(clean(Object.fromEntries(fd))));
  if (error) throw new Error(error.message);
  refresh();
}
export async function updateBoard(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  const id = String(fd.get('id'));
  const { error } = await supabase.from('boards').update(board.partial().parse(clean(Object.fromEntries(fd)))).eq('id', id);
  if (error) throw new Error(error.message);
  refresh();
}
export async function activateBoard(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  const { error } = await supabase.rpc('activate_board', { p_board: String(fd.get('id')) });
  if (error) throw new Error(error.message);
  refresh();
}
export async function archiveBoard(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  const { error } = await supabase.from('boards').update({ is_active: false }).eq('id', String(fd.get('id')));
  if (error) throw new Error(error.message);
  refresh();
}
const member = z.object({ board_id: z.string().uuid(), profile_id: z.string().uuid(), position: z.string().min(2).max(80), biography: z.string().max(800).optional(), photo_url: z.string().optional(), linkedin_url: z.string().url().optional(), instagram_url: z.string().url().optional(), display_order: z.coerce.number().int().optional() });
export async function addMember(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  const { error } = await supabase.from('board_members').insert(member.parse(clean(Object.fromEntries(fd))));
  if (error) throw new Error(error.message);
  refresh();
}
export async function removeMember(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  await supabase.from('board_members').delete().eq('id', String(fd.get('id')));
  refresh();
}
