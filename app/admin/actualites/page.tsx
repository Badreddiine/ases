import { requireRole } from '@/lib/auth';
import { saveNews, toggleNews, deleteNews, sendAnnouncement } from '@/lib/actions/content';
import Upload from '@/components/Upload';
import { Empty } from '@/components/Title';

export default async function Actualites() {
  const { supabase } = await requireRole(['admin']);
  const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false });
  return (
    <div className="space-y-10">
      <h1 className="text-5xl font-bold">Actualités</h1>
      <form action={sendAnnouncement} className="card grid gap-3 md:grid-cols-3">
        <h2 className="text-2xl font-bold md:col-span-3">Annonce à tous les membres actifs</h2>
        <div><label className="label" htmlFor="at">Titre</label><input id="at" name="title" required className="input" /></div>
        <div className="md:col-span-2"><label className="label" htmlFor="ab">Message</label><input id="ab" name="body" required className="input" /></div>
        <button className="btn-red">Envoyer l’annonce</button>
      </form>
      <form action={saveNews} className="card grid gap-3 md:grid-cols-2">
        <h2 className="text-2xl font-bold md:col-span-2">Nouvelle actualité</h2>
        <div><label className="label" htmlFor="nt">Titre</label><input id="nt" name="title" required className="input" /></div>
        <div><label className="label" htmlFor="nc">Catégorie</label><input id="nc" name="category" className="input" /></div>
        <div className="md:col-span-2"><label className="label" htmlFor="ne">Résumé</label><input id="ne" name="excerpt" className="input" /></div>
        <div className="md:col-span-2"><label className="label" htmlFor="nx">Contenu</label><textarea id="nx" name="content" rows={4} className="input" /></div>
        <Upload name="image_url" bucket="posters" label="Image" />
        <label className="flex items-center gap-2 self-end text-sm"><input type="checkbox" name="is_published" /> Publier immédiatement</label>
        <button className="btn-royal md:col-span-2">Enregistrer</button>
      </form>
      {data?.length ? (
        <ul className="space-y-3">{data.map((n) => (
          <li key={n.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
            <div><b>{n.title}</b> <span className="ml-2 rounded-full bg-royal-100 px-2 py-0.5 text-xs">{n.is_published ? 'Publiée' : 'Brouillon'}</span><p className="text-sm text-navy/70">{n.excerpt}</p></div>
            <div className="flex gap-2">
              <form action={toggleNews}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="publish" value={n.is_published ? '0' : '1'} /><button className="btn-outline !px-4 !py-1.5 !text-sm">{n.is_published ? 'Dépublier' : 'Publier'}</button></form>
              <form action={deleteNews}><input type="hidden" name="id" value={n.id} /><button className="btn-outline !border-ases-red !px-4 !py-1.5 !text-sm !text-ases-red">Supprimer</button></form>
            </div>
          </li>))}</ul>
      ) : <Empty text="Aucune actualité." />}
    </div>
  );
}
