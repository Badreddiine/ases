import { requireRole } from '@/lib/auth';
import { setRole, setStatus } from '@/lib/actions/people';

const ROLES: Record<string, string> = { admin: 'Administrateur', rh: 'RH', member: 'Membre', event_manager: 'Responsable événements' };
export default async function Comptes() {
  const { supabase, user } = await requireRole(['admin']);
  const { data } = await supabase.from('profiles').select('id,full_name,email,role,status').order('full_name');
  return (
    <div>
      <h1 className="mb-2 text-5xl font-bold">Gestion des comptes</h1>
      <p className="mb-6 text-sm text-navy/70">Les comptes se créent via l’inscription publique (rôle « Membre » par défaut). Seul l’administrateur peut attribuer un rôle privilégié.</p>
      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy text-white"><tr><th className="p-3">Nom</th><th className="p-3">Email</th><th className="p-3">Rôle</th><th className="p-3">Statut</th></tr></thead>
          <tbody>{data?.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3 font-semibold">{p.full_name}</td><td className="p-3">{p.email}</td>
              <td className="p-3"><form action={setRole} className="flex gap-1"><input type="hidden" name="id" value={p.id} />
                <select name="role" defaultValue={p.role} disabled={p.id === user.id} className="input !w-auto !py-1" aria-label={`Rôle de ${p.full_name}`}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                <button disabled={p.id === user.id} className="btn-outline !px-3 !py-1 !text-sm">OK</button></form></td>
              <td className="p-3"><form action={setStatus} className="flex gap-1"><input type="hidden" name="id" value={p.id} />
                <select name="status" defaultValue={p.status} className="input !w-auto !py-1" aria-label={`Statut de ${p.full_name}`}><option value="active">Actif</option><option value="pending">En attente</option><option value="suspended">Suspendu</option></select>
                <button className="btn-outline !px-3 !py-1 !text-sm">OK</button></form></td>
            </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
