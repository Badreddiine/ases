import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { addGallery, deleteGallery } from '@/lib/actions/content';
import Upload from '@/components/Upload';
import { Empty } from '@/components/Title';

export default async function GalerieAdmin() {
  const { supabase } = await requireRole(['admin']);
  const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-bold">Galerie</h1>
      <form action={addGallery} className="card grid gap-3 md:grid-cols-3">
        <Upload name="url" bucket="gallery" label="Photo ou vidéo (50 Mo max)" accept="image/*,video/mp4,video/webm" maxMB={50} />
        <div><label className="label" htmlFor="gt">Titre</label><input id="gt" name="title" className="input" /></div>
        <div><label className="label" htmlFor="gc">Catégorie</label><input id="gc" name="category" list="gcats" className="input" /><datalist id="gcats"><option>Événements</option><option>Compétitions</option><option>Entraînements</option><option>Vie associative</option></datalist></div>
        <button className="btn-royal md:col-span-3">Ajouter à la galerie</button>
      </form>
      {data?.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{data.map((g) => (
          <div key={g.id} className="card !p-2">
            {g.media_type === 'video' ? <video src={g.url} className="h-32 w-full rounded object-cover" /> : <Image src={g.url} alt={g.title ?? ''} width={300} height={200} className="h-32 w-full rounded object-cover" />}
            <p className="mt-1 truncate text-xs">{g.title}</p>
            <form action={deleteGallery}><input type="hidden" name="id" value={g.id} /><button className="text-xs font-semibold text-ases-red">Supprimer</button></form>
          </div>))}</div>
      ) : <Empty text="La galerie est vide." />}
    </div>
  );
}
