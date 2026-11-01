import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { createBoard, updateBoard, activateBoard, archiveBoard, addMember, removeMember } from './actions';
import Upload from '@/components/Upload';

const POSITIONS = ['Président(e)', 'Vice-président(e)', 'Secrétaire général(e)', 'Secrétaire général(e) adjoint(e)', 'Trésorier(e)', 'Trésorier(e) adjoint(e)', 'Responsable RH', 'Responsable Communication', 'Responsable Sponsoring', 'Responsable Événementiel', 'Responsable section sportive', 'Membre du comité'];

export default async function GestionBureau() {
  const { supabase } = await requireRole(['admin']);
  const [{ data: boards }, { data: profiles }] = await Promise.all([
    supabase.from('boards').select('*, board_members(id,position,profiles(full_name))').order('academic_year', { ascending: false }),
    supabase.from('profiles').select('id,full_name').order('full_name'),
  ]);
  return (
    <div className="space-y-10">
      <h1 className="text-5xl font-bold">Gestion du bureau</h1>
      <form action={createBoard} className="card grid gap-3 md:grid-cols-3">
        <h2 className="text-2xl font-bold md:col-span-3">Créer un nouveau bureau</h2>
        <div><label className="label" htmlFor="y">Année académique</label><input id="y" name="academic_year" placeholder="2026-2027" required className="input" /></div>
        <div><label className="label" htmlFor="s">Début du mandat</label><input id="s" type="date" name="start_date" className="input" /></div>
        <div><label className="label" htmlFor="e">Fin du mandat</label><input id="e" type="date" name="end_date" className="input" /></div>
        <div className="md:col-span-2"><label className="label" htmlFor="m">Mot du président</label><input id="m" name="president_message" className="input" /></div>
        <Upload name="group_photo_url" bucket="board" label="Photo officielle de groupe" />
        <button className="btn-royal md:col-span-3">Créer le bureau</button>
      </form>

      {boards?.map((b: any) => (
        <section key={b.id} className="card space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-bold">{b.academic_year} {b.is_active && <span className="ml-2 rounded-full bg-ases-red px-3 py-1 text-sm text-white">Actif</span>}</h2>
            <div className="flex gap-2">
              <Link href={`/bureau?preview=${b.id}`} className="btn-outline !px-4 !py-1.5 !text-sm">Aperçu</Link>
              {b.is_active
                ? <form action={archiveBoard}><input type="hidden" name="id" value={b.id} /><button className="btn-outline !px-4 !py-1.5 !text-sm">Archiver</button></form>
                : <form action={activateBoard}><input type="hidden" name="id" value={b.id} /><button className="btn-red !px-4 !py-1.5 !text-sm">Activer ce bureau</button></form>}
            </div>
          </div>

          <form action={updateBoard} className="grid gap-3 md:grid-cols-3">
            <input type="hidden" name="id" value={b.id} />
            <div><label className="label">Début</label><input type="date" name="start_date" defaultValue={b.start_date ?? ''} className="input" /></div>
            <div><label className="label">Fin</label><input type="date" name="end_date" defaultValue={b.end_date ?? ''} className="input" /></div>
            <Upload name="group_photo_url" bucket="board" label="Remplacer la photo de groupe" defaultValue={b.group_photo_url ?? ''} />
            <div className="md:col-span-3"><label className="label">Mot du président</label><textarea name="president_message" rows={2} defaultValue={b.president_message ?? ''} className="input" /></div>
            <button className="btn-outline !py-2 !text-base md:col-span-3">Enregistrer les modifications</button>
          </form>

          <ul className="divide-y text-sm">
            {b.board_members?.map((m: any) => (
              <li key={m.id} className="flex items-center justify-between py-2"><span><b>{m.profiles?.full_name}</b> — {m.position}</span>
                <form action={removeMember}><input type="hidden" name="id" value={m.id} /><button className="font-semibold text-ases-red">Retirer</button></form></li>
            ))}
          </ul>

          <form action={addMember} className="grid gap-3 rounded-xl bg-royal-100 p-4 md:grid-cols-3">
            <input type="hidden" name="board_id" value={b.id} />
            <div><label className="label">Membre</label><select name="profile_id" required className="input">{profiles?.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
            <div><label className="label">Poste</label><input name="position" list={`pos-${b.id}`} required className="input" /><datalist id={`pos-${b.id}`}>{POSITIONS.map((p) => <option key={p} value={p} />)}</datalist></div>
            <div><label className="label">Ordre d’affichage</label><input type="number" name="display_order" defaultValue={0} className="input" /></div>
            <div className="md:col-span-3"><label className="label">Biographie</label><input name="biography" className="input" /></div>
            <div><label className="label">LinkedIn (URL)</label><input name="linkedin_url" type="url" className="input" /></div>
            <div><label className="label">Instagram (URL)</label><input name="instagram_url" type="url" className="input" /></div>
            <Upload name="photo_url" bucket="board" label="Portrait" />
            <button className="btn-royal !py-2 !text-base md:col-span-3">Ajouter au bureau</button>
          </form>
        </section>
      ))}
    </div>
  );
}
