import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Role = 'admin' | 'rh' | 'member' | 'event_manager';

/** Vérification serveur du rôle (en plus du RLS en base). */
export async function requireRole(roles: Role[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || !roles.includes(profile.role)) redirect('/membre');
  return { supabase, user, profile };
}
