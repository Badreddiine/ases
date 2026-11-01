import { setStatus } from '@/lib/actions/people';
import { Empty } from './Title';

export default async function MembersTable({ supabase, q, status }: { supabase: any; q?: string; status?: string }) {
  let query = supabase.from('profiles').select('id,full_name,email,phone,student_id,status,registered_at,member_sections(sports_sections(name))').order('full_name').limit(200);
  if (q) query = query.or(`full_name.ilike.%${q}%,student_id.ilike.%${q}%,email.ilike.%${q}%`);
  if (status) query = query.eq('status', status);
  const { data } = await query;
  return (
    <div>
      <form className="mb-4 flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={q} placeholder="Nom, CNE ou email" className="input max-w-xs" aria-label="Rechercher" />
        <select name="status" defaultValue={status ?? ''} className="input max-w-[200px]" aria-label="Statut"><option value="">Tous les statuts</option><option value="active">Actif</option><option value="pending">En attente</option><option value="suspended">Suspendu</option></select>
        <button className="btn-royal !py-2 !text-base">Filtrer</button>
      </form>
      {data?.length ? (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy text-white"><tr><th className="p-3">Nom</th><th className="p-3">Contact</th><th className="p-3">CNE</th><th className="p-3">Sections</th><th className="p-3">Inscrit le</th><th className="p-3">Statut</th></tr></thead>
            <tbody>
              {data.map((m: any) => (
                <tr key={m.id} className="border-t align-top">
                  <td className="p-3 font-semibold">{m.full_name}</td>
                  <td className="p-3">{m.email}<br />{m.phone}</td>
                  <td className="p-3">{m.student_id}</td>
                  <td className="p-3">{m.member_sections?.map((s: any) => s.sports_sections?.name).join(', ')}</td>
                  <td className="p-3">{new Date(m.registered_at).toLocaleDateString('fr-FR')}</td>
                  <td className="p-3">
                    <form action={setStatus} className="flex gap-1">
                      <input type="hidden" name="id" value={m.id} />
                      <select name="status" defaultValue={m.status} className="input !w-auto !py-1" aria-label={`Statut de ${m.full_name}`}><option value="active">Actif</option><option value="pending">En attente</option><option value="suspended">Suspendu</option></select>
                      <button className="btn-outline !px-3 !py-1 !text-sm">OK</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty text="Aucun membre trouvé." />}
    </div>
  );
}
