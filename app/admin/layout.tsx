import Link from 'next/link';
import { requireRole } from '@/lib/auth';

const nav = [
  ['/admin', 'Vue d’ensemble'], ['/admin/membres', 'Gestion des membres'], ['/admin/bureau', 'Gestion du bureau'],
  ['/rh', 'Gestion RH'], ['/rh?status=pending', 'Gestion des absences'], ['/admin/evenements', 'Gestion des événements'],
  ['/admin/reservations', 'Réservations'], ['/admin/actualites', 'Actualités'], ['/admin/galerie', 'Galerie'],
  ['/admin/sections', 'Sections sportives'], ['/admin/comptes', 'Gestion des comptes'], ['/admin/parametres', 'Paramètres'],
];
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['admin']);
  return (
    <div className="container-ases grid gap-8 py-10 md:grid-cols-[230px_1fr]">
      <aside aria-label="Administration" className="rounded-2xl bg-navy-900 p-4 text-white md:sticky md:top-24 md:self-start">
        <p className="mb-3 font-display text-xl uppercase text-ases-red">Administration</p>
        <ul className="space-y-1">{nav.map(([h, l]) => <li key={h}><Link href={h} className="block rounded-lg px-3 py-2 text-sm hover:bg-royal">{l}</Link></li>)}</ul>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
