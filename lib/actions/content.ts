'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { clean } from '@/lib/utils';

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function saveNews(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  const p = z.object({ title: z.string().min(3).max(150), excerpt: z.string().max(300).optional(), content: z.string().max(10000).optional(), image_url: z.string().optional(), category: z.string().max(50).optional() }).parse(clean(Object.fromEntries(fd)));
  const { error } = await supabase.from('news').insert({ ...p, is_published: fd.get('is_published') === 'on' });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/actualites'); revalidatePath('/');
}
export async function toggleNews(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  await supabase.from('news').update({ is_published: fd.get('publish') === '1' }).eq('id', String(fd.get('id')));
  revalidatePath('/admin/actualites'); revalidatePath('/');
}
export async function deleteNews(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  await supabase.from('news').delete().eq('id', String(fd.get('id')));
  revalidatePath('/admin/actualites'); revalidatePath('/');
}
export async function sendAnnouncement(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  const p = z.object({ title: z.string().min(3).max(100), body: z.string().min(3).max(500) }).parse(Object.fromEntries(fd));
  const { error } = await supabase.rpc('announce', { p_title: p.title, p_body: p.body });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/actualites');
}

export async function addGallery(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  const p = z.object({ url: z.string().url(), title: z.string().max(100).optional(), category: z.string().max(50).optional() }).parse(clean(Object.fromEntries(fd)));
  const isVideo = /\.(mp4|webm)$/i.test(p.url);
  const { error } = await supabase.from('gallery').insert({ ...p, media_type: isVideo ? 'video' : 'image' });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/galerie'); revalidatePath('/galerie');
}
export async function deleteGallery(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  await supabase.from('gallery').delete().eq('id', String(fd.get('id')));
  revalidatePath('/admin/galerie'); revalidatePath('/galerie');
}

export async function addSection(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  const p = z.object({ name: z.string().min(2).max(60), description: z.string().max(500).optional(), schedule: z.string().max(200).optional(), image_url: z.string().optional(), manager_id: z.string().uuid().optional() }).parse(clean(Object.fromEntries(fd)));
  const { error } = await supabase.from('sports_sections').insert({ ...p, slug: slug(p.name) });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/sections'); revalidatePath('/sections');
}
export async function deleteSection(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  await supabase.from('sports_sections').delete().eq('id', String(fd.get('id')));
  revalidatePath('/admin/sections'); revalidatePath('/sections');
}

export async function saveSettings(fd: FormData) {
  const { supabase } = await requireRole(['admin']);
  const keys = ['contact_email', 'phone', 'address', 'instagram_url', 'facebook_url', 'linkedin_url'];
  const rows = keys.map((key) => ({ key, value: String(fd.get(key) ?? '') }));
  const { error } = await supabase.from('site_settings').upsert(rows);
  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
}
