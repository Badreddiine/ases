'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const contact = z.object({ name: z.string().min(2).max(100), email: z.string().email(), message: z.string().min(5).max(2000) });
const member = z.object({ full_name: z.string().min(2).max(100), email: z.string().email(), student_id: z.string().min(3).max(30), sports: z.string().max(200).optional() });

export async function sendContact(fd: FormData) {
  const p = contact.parse(Object.fromEntries(fd));
  const { error } = await createClient().from('contact_messages').insert(p);
  if (error) throw new Error(error.message);
  redirect('/contact?ok=1');
}
export async function applyMembership(fd: FormData) {
  const p = member.parse(Object.fromEntries(fd));
  const { error } = await createClient().from('membership_applications').insert(p);
  if (error) throw new Error(error.message);
  redirect('/contact?ok=1');
}
