import { Instagram, Facebook, Linkedin, Mail } from 'lucide-react';
import Logo from './Logo';
import { createClient } from '@/lib/supabase/server';

export default async function Footer() {
  const { data } = await createClient().from('site_settings').select('key,value');
  const s = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container-ases flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <Logo />
        <p className="font-display text-xl uppercase">❤️🏅💙 Home Of Champions</p>
        <div className="flex gap-4">
          {s.instagram_url && <a href={s.instagram_url} aria-label="Instagram"><Instagram /></a>}
          {s.facebook_url && <a href={s.facebook_url} aria-label="Facebook"><Facebook /></a>}
          {s.linkedin_url && <a href={s.linkedin_url} aria-label="LinkedIn"><Linkedin /></a>}
          {s.contact_email && <a href={`mailto:${s.contact_email}`} aria-label="Email"><Mail /></a>}
        </div>
      </div>
      <p className="pb-6 text-center text-sm text-white/60">© {new Date().getFullYear()} ASES – Association Sportive de l’ENCG de Settat</p>
    </footer>
  );
}
