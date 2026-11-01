import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { reviewAbsence } from '@/lib/actions/hr';
import MembersTable from '@/components/MembersTable';
import { Empty } from '@/components/Title';

export default async function RH({ searchParams }: { searchParams: { q?: string; mstatus?: string; status?: string; from?: string; to?: string } }) {
  const { supabase } = await requireRole(['admin', 'rh']);
  let aq = supabase.from('absence_requests').select('*, member:profiles!absence_requests_member_id_fkey(full_name)').order('created_at', { ascending: false }).limit(100);
  if (searchParams.status) aq = aq.eq('status', searchParams.status);
  if (searchParams.from) aq = aq.gte('start_date', searchParams.from);
  if (searchParams.to) aq = aq.lte('end_date', searchParams.to);
  const [{ data: abs }, { count: pending }, { count: active }, { count: total }, { data: recs }] = await Promise.all([
    aq,
    supabase.from('absence_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('attendance_records').select('status'),
  ]);
  const rate = recs?.length ? Math.round((recs.filter((r) => r.status === 'present' || r.status === 'late').length / recs.length) * 100) : 0;
  const docs: Record<string, string> = {};
  for (const a of abs ?? []) if (a.document_url) { const { data } = await supabase.storage.from('documents').createSignedUrl(a.document_url, 3600); if (data) docs[a.id] = data.signedUrl; }
  const L: Record<string, string> = { pending: 'En attente', approved: 'Approuvée', rejected: 'Refusée' };
  return (
    <div className="container-ases space-y-10 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-5xl font-bold">Espace RH</h1><Link href="/rh/presences" className="btn-royal !py-2 !text-base">Présences</Link></div>
      <div className="grid gap-4 sm:grid-cols-4">
        {[['Membres', total ?? 0], ['Actifs', active ?? 0], ['Absences en attente', pending ?? 0], ['Taux de présence', `${rate}%`]].map(([l, v]) => <div key={String(l)} className="card border-l-4 border-l-royal"><p className="text-sm">{l}</p><p className="font-display text-4xl font-bold">{v}</p></div>)}
      </div>

      <section>
        <h2 className="mb-4 text-3xl font-bold">Demandes d’absence</h2>
        <form className="mb-4 flex flex-wrap gap-3" role="search">
          <select name="status" defaultValue={searchParams.status ?? ''} className="input max-w-[200px]" aria-label="Statut"><option value="">Tous les statuts</option><option value="pending">En attente</option><option value="approved">Approuvées</option><option value="rejected">Refusées</option></select>
          <input type="date" name="from" defaultValue={searchParams.from} className="input max-w-[180px]" aria-label="À partir du" />
          <input type="date" name="to" defaultValue={searchParams.to} className="input max-w-[180px]" aria-label="Jusqu’au" />
          <button className="btn-royal !py-2 !text-base">Filtrer</button>
        </form>
        <div className="space-y-3">
          {abs?.length ? abs.map((a: any) => (
            <form key={a.id} action={reviewAbsence} className="card grid items-end gap-3 !p-4 md:grid-cols-[1.4fr_1fr_auto_auto]">
              <input type="hidden" name="id" value={a.id} />
              <div><b>{a.member?.full_name}</b> · <span className="text-sm font-semibold text-royal">{L[a.status]}</span>
                <p className="text-sm">{a.start_date} → {a.end_date} · {a.reason}</p>{a.description && <p className="text-sm text-navy/70">{a.description}</p>}
                {docs[a.id] && <a href={docs[a.id]} target="_blank" rel="noreferrer" className="text-sm font-semibold text-royal">Voir le justificatif</a>}</div>
              {a.status === 'pending' ? <>
                <input name="comment" placeholder="Commentaire" className="input" aria-label="Commentaire" />
                <button name="decision" value="approved" className="btn-royal !px-4 !py-2 !text-base">Approuver</button>
                <button name="decision" value="rejected" className="btn-outline !px-4 !py-2 !text-base">Refuser</button></>
                : <p className="text-sm md:col-span-3">{a.rh_comment && <>« {a.rh_comment} »</>}</p>}
            </form>)) : <Empty text="Aucune demande ne correspond à ces filtres." />}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-3xl font-bold">Annuaire des membres</h2>
        <MembersTable supabase={supabase} q={searchParams.q} status={searchParams.mstatus} />
      </section>
    </div>
  );
}
