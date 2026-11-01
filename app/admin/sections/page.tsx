import { requireRole } from '@/lib/auth';
import { addSection, deleteSection } from '@/lib/actions/content';
import Upload from '@/components/Upload';
import { Empty } from '@/components/Title';

export default async function SectionsAdmin() {
  const { supabase } = await requireRole(['admin']);
  const [{ data }, { data: profiles }] = await Promise.all([supabase.from('sports_sections').select('*, manager:profiles(full_name)').order('name'), supabase.from('profiles').select('id,full_name').order('full_name')]);
  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-bold">Sections sportives</h1>
      <form action={addSection} className="card grid gap-3 md:grid-cols-2">
        <div><label className="label" htmlFor="sn">Nom</label><input id="sn" name="name" required className="input" /></div>
        <div><label className="label" htmlFor="sm">Responsable</label><select id="sm" name="manager_id" className="input"><option value="">— Aucun —</option>{profiles?.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
        <div className="md:col-span-2"><label className="label" htmlFor="sd">Description</label><input id="sd" name="description" className="input" /></div>
        <div><label className="label" htmlFor="ss">Horaires et activités</label><input id="ss" name="schedule" className="input" /></div>
        <Upload name="image_url" bucket="posters" label="Image" />
        <button className="btn-royal md:col-span-2">Ajouter la section</button>
      </form>
      {data?.length ? <ul className="space-y-2">{data.map((s: any) => (
        <li key={s.id} className="card flex items-center justify-between !p-4"><span><b>{s.name}</b> — {s.manager?.full_name ?? 'sans responsable'} · {s.schedule}</span>
          <form action={deleteSection}><input type="hidden" name="id" value={s.id} /><button className="text-sm font-semibold text-ases-red">Supprimer</button></form></li>))}</ul> : <Empty text="Aucune section." />}
    </div>
  );
}
