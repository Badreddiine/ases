import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { createSession } from '@/lib/actions/hr';
import { fmt } from '@/lib/utils';
import { Empty } from '@/components/Title';

const KIND: Record<string, string> = { meeting: 'Réunion', training: 'Entraînement', event: 'Événement' };
export default async function Presences({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const { supabase } = await requireRole(['admin', 'rh']);
  const [{ data: sessions }, { data: events }] = await Promise.all([
    supabase.from('attendance_sessions').select('*').order('session_date', { ascending: false }).limit(50),
    supabase.from('events').select('id,title').order('starts_at', { ascending: false }).limit(50),
  ]);
  // Statistiques par membre sur la période
  const from = searchParams.from ? new Date(searchParams.from).toISOString() : '1970-01-01';
  const to = searchParams.to ? new Date(searchParams.to + 'T23:59:59').toISOString() : '2999-01-01';
  const { data: recs } = await supabase.from('attendance_records').select('status,member_id,profiles(full_name),attendance_sessions!inner(session_date)').gte('attendance_sessions.session_date', from).lte('attendance_sessions.session_date', to);
  const stats = new Map<string, { name: string; total: number; ok: number }>();
  for (const r of (recs ?? []) as any[]) {
    const s = stats.get(r.member_id) ?? { name: r.profiles?.full_name ?? '—', total: 0, ok: 0 };
    s.total++; if (r.status === 'present' || r.status === 'late') s.ok++; stats.set(r.member_id, s);
  }
  return (
    <div className="container-ases space-y-10 py-12">
      <div><Link href="/rh" className="text-sm font-semibold text-royal">← Espace RH</Link><h1 className="text-5xl font-bold">Présences</h1></div>
      <form action={createSession} className="card grid gap-3 md:grid-cols-4">
        <h2 className="text-2xl font-bold md:col-span-4">Nouvelle séance</h2>
        <div><label className="label" htmlFor="t">Titre</label><input id="t" name="title" required className="input" /></div>
        <div><label className="label" htmlFor="k">Type</label><select id="k" name="kind" className="input">{Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label className="label" htmlFor="d">Date et heure</label><input id="d" type="datetime-local" name="session_date" required className="input" /></div>
        <div><label className="label" htmlFor="e">Événement lié</label><select id="e" name="event_id" className="input"><option value="">—</option>{events?.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
        <button className="btn-royal md:col-span-4">Créer et faire l’appel</button>
      </form>
      <section>
        <h2 className="mb-3 text-3xl font-bold">Séances récentes</h2>
        {sessions?.length ? <ul className="space-y-2">{sessions.map((s) => <li key={s.id}><Link href={`/rh/presences/${s.id}`} className="card flex justify-between !p-4 hover:border-royal"><b>{s.title}</b><span className="text-sm">{KIND[s.kind]} · {fmt(s.session_date)}</span></Link></li>)}</ul> : <Empty text="Aucune séance créée." />}
      </section>
      <section>
        <h2 className="mb-3 text-3xl font-bold">Assiduité par membre</h2>
        <form className="mb-4 flex flex-wrap gap-3"><input type="date" name="from" defaultValue={searchParams.from} className="input max-w-[180px]" aria-label="Du" /><input type="date" name="to" defaultValue={searchParams.to} className="input max-w-[180px]" aria-label="Au" /><button className="btn-royal !py-2 !text-base">Appliquer la période</button></form>
        {stats.size ? (
          <div className="card overflow-x-auto !p-0"><table className="w-full text-left text-sm"><thead className="bg-navy text-white"><tr><th className="p-3">Membre</th><th className="p-3">Séances</th><th className="p-3">Présences</th><th className="p-3">Assiduité</th></tr></thead>
            <tbody>{[...stats.values()].sort((a, b) => a.name.localeCompare(b.name)).map((s) => <tr key={s.name} className="border-t"><td className="p-3 font-semibold">{s.name}</td><td className="p-3">{s.total}</td><td className="p-3">{s.ok}</td><td className="p-3 font-bold text-royal">{Math.round((s.ok / s.total) * 100)}%</td></tr>)}</tbody></table></div>
        ) : <Empty text="Aucune donnée sur cette période." />}
      </section>
    </div>
  );
}
