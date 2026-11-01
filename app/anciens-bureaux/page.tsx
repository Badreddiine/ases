import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Title, { Empty } from '@/components/Title';
import BoardView from '@/components/BoardView';

export default async function Anciens({ searchParams }: { searchParams: { annee?: string } }) {
  const { data: boards } = await createClient().from('boards').select('*').eq('is_active', false).order('academic_year', { ascending: false });
  const current = boards?.find((b) => b.academic_year === searchParams.annee) ?? boards?.[0];
  return (
    <div className="container-ases py-16">
      <Title sub="Retrouvez les équipes qui ont marqué l’histoire d’ASES.">Anciens bureaux</Title>
      {boards?.length ? (
        <>
          <nav aria-label="Années académiques" className="mb-8 flex flex-wrap gap-2">
            {boards.map((b) => (
              <Link key={b.id} href={`?annee=${b.academic_year}`} className={`rounded-full px-4 py-1.5 font-display text-lg ${b.id === current?.id ? 'bg-royal text-white' : 'bg-royal-100 text-navy'}`}>{b.academic_year}</Link>
            ))}
          </nav>
          {current && <BoardView board={current} />}
        </>
      ) : <Empty text="Aucun bureau archivé." />}
    </div>
  );
}
