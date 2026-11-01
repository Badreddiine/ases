import Link from 'next/link';
import { Bell } from 'lucide-react';
import Logo from './Logo';
import { createClient } from '@/lib/supabase/server';

const links = [
  ['/a-propos', 'À propos'], ['/bureau', 'Le Bureau'], ['/sections', 'Sections'],
  ['/evenements', 'Événements'], ['/galerie', 'Galerie'], ['/contact', 'Contact'],
];
export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { count } = user ? await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false) : { count: 0 };
  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 text-white backdrop-blur">
      <div className="container-ases flex items-center justify-between py-3">
        <Link href="/" aria-label="Accueil ASES"><Logo /></Link>
        <nav aria-label="Navigation principale" className="hidden gap-6 font-display text-lg uppercase md:flex">
          {links.map(([h, l]) => <Link key={h} href={h} className="hover:text-ases-red">{l}</Link>)}
        </nav>
        <div className="flex items-center gap-3">
          {user && (
            <Link href="/membre/notifications" aria-label={`${count} notifications non lues`} className="relative">
              <Bell />
              {!!count && <span className="absolute -right-2 -top-2 rounded-full bg-ases-red px-1.5 text-[11px] font-bold">{count}</span>}
            </Link>
          )}
          <Link href={user ? '/membre' : '/connexion'} className="btn-red !py-2 !text-base">{user ? 'Mon espace' : 'Connexion'}</Link>
        </div>
      </div>
      <nav aria-label="Navigation mobile" className="flex gap-4 overflow-x-auto px-5 pb-3 font-display uppercase md:hidden">
        {links.map(([h, l]) => <Link key={h} href={h} className="whitespace-nowrap">{l}</Link>)}
      </nav>
    </header>
  );
}
