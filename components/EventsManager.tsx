import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { fmt, toInput } from '@/lib/utils';
import { saveEvent, setEventStatus, deleteEvent } from '@/lib/actions/events';
import Upload from './Upload';
import { Empty } from './Title';

const STATUS: Record<string, string> = { draft: 'Brouillon', published: 'Publié', full: 'Complet', completed: 'Terminé', cancelled: 'Annulé' };

export default async function EventsManager({ base, edit }: { base: string; edit?: string }) {
  const { supabase, user, profile } = await requireRole(['admin', 'event_manager']);
  let q = supabase.from('events').select('*').order('starts_at', { ascending: false });
  if (profile.role === 'event_manager') q = q.eq('manager_id', user.id);
  const [{ data: events }, { data: managers }] = await Promise.all([q, supabase.from('profiles').select('id,full_name').in('role', ['event_manager', 'admin'])]);
  const e = events?.find((x) => x.id === edit);
  return (
    <div className="space-y-10">
      <form action={saveEvent} className="card grid gap-3 md:grid-cols-3">
        <h2 className="text-3xl font-bold md:col-span-3">{e ? 'Modifier l’événement' : 'Nouvel événement'}</h2>
        {e && <input type="hidden" name="id" value={e.id} />}
        <input type="hidden" name="base" value={base} />
        <div className="md:col-span-2"><label className="label" htmlFor="t">Titre</label><input id="t" name="title" required defaultValue={e?.title} className="input" /></div>
        <div><label className="label" htmlFor="c">Catégorie</label><input id="c" name="category" list="cats" defaultValue={e?.category} className="input" /><datalist id="cats"><option>Tournoi</option><option>Tests sportifs</option><option>Soirée</option><option>Formation</option></datalist></div>
        <div><label className="label" htmlFor="l">Lieu</label><input id="l" name="location" defaultValue={e?.location} className="input" /></div>
        <div><label className="label" htmlFor="d">Date et heure</label><input id="d" type="datetime-local" name="starts_at" required defaultValue={toInput(e?.starts_at)} className="input" /></div>
        <div><label className="label" htmlFor="cap">Capacité maximale</label><input id="cap" type="number" min={1} name="capacity" required defaultValue={e?.capacity ?? 50} className="input" /></div>
        <div><label className="label" htmlFor="dl">Fin des inscriptions</label><input id="dl" type="datetime-local" name="registration_deadline" defaultValue={toInput(e?.registration_deadline)} className="input" /></div>
        <div><label className="label" htmlFor="ca">Annulation possible jusqu’au</label><input id="ca" type="datetime-local" name="allow_cancel_until" defaultValue={toInput(e?.allow_cancel_until)} className="input" /></div>
        <div><label className="label" htmlFor="st">Statut</label><select id="st" name="status" defaultValue={e?.status ?? 'draft'} className="input">{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        {profile.role === 'admin' && <div><label className="label" htmlFor="mg">Responsable</label><select id="mg" name="manager_id" defaultValue={e?.manager_id ?? ''} className="input"><option value="">— Aucun —</option>{managers?.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div>}
        <div className="md:col-span-3"><label className="label" htmlFor="ds">Description</label><textarea id="ds" name="description" rows={3} defaultValue={e?.description} className="input" /></div>
        <div className="md:col-span-2"><label className="label" htmlFor="cd">Conditions d’inscription</label><input id="cd" name="conditions" defaultValue={e?.conditions} className="input" /></div>
        <Upload name="poster_url" bucket="posters" label="Affiche" defaultValue={e?.poster_url ?? ''} />
        <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" name="announce" /> Notifier tous les membres actifs (si publié)</label>
        <div className="flex gap-3 md:col-span-3"><button className="btn-royal">{e ? 'Enregistrer' : 'Créer l’événement'}</button>{e && <Link href={base} className="btn-outline">Annuler</Link>}</div>
      </form>

      <section>
        <h2 className="mb-4 text-3xl font-bold">Événements</h2>
        {events?.length ? (
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
                <div><h3 className="text-xl font-bold">{ev.title}</h3><p className="text-sm">{fmt(ev.starts_at)} · {ev.location} · {ev.capacity} places</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={setEventStatus} className="flex gap-1">
                    <input type="hidden" name="id" value={ev.id} /><input type="hidden" name="base" value={base} />
                    <select name="status" defaultValue={ev.status} className="input !w-auto !py-1.5" aria-label="Statut">{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                    <button className="btn-outline !px-4 !py-1.5 !text-sm">OK</button>
                  </form>
                  <Link href={`/gestionnaire/${ev.id}`} className="btn-royal !px-4 !py-1.5 !text-sm">Participants</Link>
                  <Link href={`${base}?edit=${ev.id}`} className="btn-outline !px-4 !py-1.5 !text-sm">Modifier</Link>
                  <form action={deleteEvent}><input type="hidden" name="id" value={ev.id} /><input type="hidden" name="base" value={base} /><button className="btn-outline !border-ases-red !px-4 !py-1.5 !text-sm !text-ases-red">Supprimer</button></form>
                </div>
              </div>
            ))}
          </div>
        ) : <Empty text="Aucun événement. Créez le premier avec le formulaire ci-dessus." />}
      </section>
    </div>
  );
}
