import Image from 'next/image';
import { Instagram, Linkedin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

const ORDER = ['Président(e)', 'Vice-président(e)', 'Secrétaire général(e)', 'Secrétaire général(e) adjoint(e)', 'Trésorier(e)', 'Trésorier(e) adjoint(e)', 'Responsable RH', 'Responsable Communication', 'Responsable Sponsoring', 'Responsable Événementiel'];

export default async function BoardView({ board }: { board: any }) {
  const { data } = await createClient().from('board_members')
    .select('id,position,biography,photo_url,linkedin_url,instagram_url,display_order,profiles(full_name,avatar_url)')
    .eq('board_id', board.id).order('display_order');
  const members = (data ?? []) as any[];
  const rank = (p: string) => { const i = ORDER.indexOf(p); return i === -1 ? 99 : i; };
  members.sort((a, b) => rank(a.position) - rank(b.position) || a.display_order - b.display_order);
  const president = members.find((m) => m.position.startsWith('Président'));
  const others = members.filter((m) => m !== president);
  const photo = (m: any) => m.photo_url || m.profiles?.avatar_url;
  return (
    <div>
      <p className="mb-6 font-display text-2xl text-royal">Mandat {board.academic_year}</p>
      {board.group_photo_url && <Image src={board.group_photo_url} alt={`Photo officielle du bureau ${board.academic_year}`} width={1200} height={600} className="mb-10 w-full rounded-2xl object-cover" />}
      {president && (
        <div className="mb-10 grid gap-6 rounded-2xl bg-ases-night p-8 text-white md:grid-cols-[220px_1fr]">
          {photo(president) && <Image src={photo(president)} alt={president.profiles?.full_name} width={220} height={260} className="h-64 w-full rounded-xl object-cover" />}
          <div>
            <p className="font-display text-lg uppercase text-ases-red">{president.position}</p>
            <h3 className="text-4xl font-bold">{president.profiles?.full_name}</h3>
            {board.president_message && <blockquote className="mt-4 border-l-4 border-ases-red pl-4 text-white/90">{board.president_message}</blockquote>}
          </div>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((m) => (
          <article key={m.id} className="card">
            {photo(m) && <Image src={photo(m)} alt={m.profiles?.full_name} width={320} height={320} className="mb-4 h-56 w-full rounded-xl object-cover" />}
            <p className="text-sm font-semibold text-ases-red">{m.position}</p>
            <h3 className="text-2xl font-bold">{m.profiles?.full_name}</h3>
            {m.biography && <p className="mt-2 text-sm text-navy/80">{m.biography}</p>}
            <div className="mt-3 flex gap-3">
              {m.linkedin_url && <a href={m.linkedin_url} aria-label="LinkedIn"><Linkedin className="text-royal" /></a>}
              {m.instagram_url && <a href={m.instagram_url} aria-label="Instagram"><Instagram className="text-ases-red" /></a>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
