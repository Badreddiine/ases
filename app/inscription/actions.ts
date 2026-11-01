'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({ full_name: z.string().min(2).max(100), email: z.string().email(), password: z.string().min(8) });

export async function signup(fd: FormData) {
  const p = schema.safeParse(Object.fromEntries(fd));
  if (!p.success) redirect('/inscription?error=' + encodeURIComponent('Vérifiez les champs du formulaire.'));
  // Le rôle n'est JAMAIS transmis par le client : le trigger SQL force 'member'.
  const { error } = await createClient().auth.signUp({ email: p.data.email, password: p.data.password, options: { data: { full_name: p.data.full_name } } });
  if (error) redirect('/inscription?error=' + encodeURIComponent(error.message));
  redirect('/inscription?ok=1');
}
