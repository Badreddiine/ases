'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(fd: FormData) {
  const { error } = await createClient().auth.signInWithPassword({ email: String(fd.get('email')), password: String(fd.get('password')) });
  if (error) redirect('/connexion?error=' + encodeURIComponent('Email ou mot de passe incorrect.'));
  redirect('/membre');
}
export async function logout() {
  await createClient().auth.signOut();
  redirect('/');
}
