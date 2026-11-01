import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Title, { Empty } from '@/components/Title';

export default async function Events({ searchParams }: { searchParams: { q?: string; cat?: string } }) {
  let q = createClient().from('events').select('id,title,category,location,starts_at,status,capacity').in('status', ['published', 'full', 'completed']).order('starts_at', { ascending: false });
  if (searchParams.q) q = q.ilike('title', `%${searchParams.q}%`);
  if (searchParams.cat) q = q.eq('category', searchParams.cat);
  const { data } = await q;
  const now = Date.now();
  return (
    <div className="container-ases py-16">
      <Title>Événements</Title>
      <form className="mb-8 flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={searchParams.q} placeholder="Rechercher un événement" className="input max-w-xs" aria-label="Rechercher" />
        <select name="cat" defaultValue={searchParams.cat ?? ''} className="input max-w-xs" aria-label="Catégorie">
          <option value="">Toutes les catégories</option><option>Tournoi</option><option>Tests sportifs</option><option>Soirée</option><option>Formation</option>
        </select>
        <button className="btn-royal !py-2 !text-base">Filtrer</button>
      </form>
      {data?.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {data.map((e) => (
            <Link key={e.id} href={`/evenements/${e.id}`} className="card flex justify-between hover:border-royal">
              <div>
                <p className="text-sm font-semibold text-ases-red">{e.category} · {new Date(e.starts_at).getTime() > now ? 'À venir' : 'Passé'}</p>
                <h3 className="text-2xl font-bold">{e.title}</h3>
                <p className="text-sm">{e.location} — {new Date(e.starts_at).toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca', dateStyle: 'long', timeStyle: 'short' })}</p>
              </div>
              <span className="self-start rounded-full bg-royal-100 px-3 py-1 text-xs font-semibold">{e.status === 'full' ? 'Complet' : e.status === 'completed' ? 'Terminé' : 'Ouvert'}</span>
            </Link>
          ))}
        </div>
      ) : <Empty text="Aucun événement ne correspond à votre recherche." />}
    </div>
  );
}
