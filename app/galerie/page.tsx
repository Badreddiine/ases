import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import Title, { Empty } from '@/components/Title';

export default async function Galerie() {
  const { data } = await createClient().from('gallery').select('*').order('created_at', { ascending: false });
  return (
    <div className="container-ases py-16">
      <Title>Galerie</Title>
      {data?.length ? (
        <div className="columns-2 gap-4 md:columns-3">
          {data.map((g) => (
            <figure key={g.id} className="mb-4 break-inside-avoid overflow-hidden rounded-xl">
              {g.media_type === 'video'
                ? <video src={g.url} controls className="w-full" />
                : <Image src={g.url} alt={g.title ?? 'Photo ASES'} width={600} height={800} className="w-full" />}
            </figure>
          ))}
        </div>
      ) : <Empty text="La galerie est vide pour le moment." />}
    </div>
  );
}
