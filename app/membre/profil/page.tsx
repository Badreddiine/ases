import { requireRole } from '@/lib/auth';
import { updateProfile } from '@/lib/actions/people';
import Upload from '@/components/Upload';

export default async function Profil() {
  const { supabase, user, profile } = await requireRole(['admin', 'rh', 'member', 'event_manager']);
  const [{ data: sections }, { data: mine }] = await Promise.all([supabase.from('sports_sections').select('id,name').order('name'), supabase.from('member_sections').select('section_id').eq('member_id', user.id)]);
  const set = new Set(mine?.map((m) => m.section_id));
  return (
    <div className="container-ases max-w-2xl py-12">
      <h1 className="mb-6 text-5xl font-bold">Mon profil</h1>
      <form action={updateProfile} className="card space-y-4">
        <div><label className="label" htmlFor="n">Nom complet</label><input id="n" name="full_name" defaultValue={profile.full_name ?? ''} required className="input" /></div>
        <div><label className="label" htmlFor="p">Téléphone</label><input id="p" name="phone" defaultValue={profile.phone ?? ''} className="input" /></div>
        <div><label className="label" htmlFor="c">Numéro étudiant (CNE)</label><input id="c" name="student_id" defaultValue={profile.student_id ?? ''} className="input" /></div>
        <Upload name="avatar_url" bucket="avatars" label="Photo de profil" defaultValue={profile.avatar_url ?? ''} />
        <fieldset><legend className="label">Mes sections sportives</legend>
          <div className="flex flex-wrap gap-4">{sections?.map((s) => <label key={s.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="sections" value={s.id} defaultChecked={set.has(s.id)} />{s.name}</label>)}</div></fieldset>
        <p className="text-xs text-navy/60">Le rôle et le statut d’adhésion sont gérés par l’administration.</p>
        <button className="btn-royal">Enregistrer</button>
      </form>
    </div>
  );
}
