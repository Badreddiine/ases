import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import Title, { Empty } from '@/components/Title';

export default async function Sections() {
  const { data } = await createClient().from('sports_sections').select('*, manager:profiles(full_name)').order('name');
  return (
    <div className="container-ases py-16">
      <Title sub="Choisissez votre sport et rejoignez la section.">Sections sportives</Title>
      {data?.length ? (
        <div className="grid gap-6 md:grid-cols-3">
          {data.map((s: any) => (
            <article key={s.id} className="card overflow-hidden !p-0">
              {s.image_url && <Image src={s.image_url} alt={s.name} width={600} height={360} className="h-48 w-full object-cover" />}
              <div className="p-6">
                <h3 className="text-3xl font-bold">{s.name}</h3>
                <p className="mt-1 text-sm">{s.description}</p>
                {s.manager?.full_name && <p className="mt-2 text-sm font-semibold">Responsable : {s.manager.full_name}</p>}
                {s.schedule && <p className="text-sm text-navy/70">{s.schedule}</p>}
                <Link href={`/contact?section=${s.slug}#adhesion`} className="btn-royal mt-4 !py-2 !text-base">Rejoindre la section</Link>
              </div>
            </article>
          ))}
        </div>
      ) : <Empty text="Aucune section pour le moment." />}
    </div>
  );
}
