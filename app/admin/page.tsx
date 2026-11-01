import { requireRole } from '@/lib/auth';
import BarChart from '@/components/BarChart';
import { fmt } from '@/lib/utils';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export default async function Admin() {
  const { supabase } = await requireRole(['admin']);
  const count = (t: string, f?: (q: any) => any) => { let q = supabase.from(t).select('*', { count: 'exact', head: true }); if (f) q = f(q); return q.then((r: any) => r.count ?? 0); };
  const [members, active, events, resv, abs, { data: profs }, { data: att }, { data: lastRes }, { data: lastAbs }] = await Promise.all([
    count('profiles'), count('profiles', (q) => q.eq('status', 'active')),
    count('events', (q) => q.eq('status', 'published').gte('starts_at', new Date().toISOString())),
    count('reservations', (q) => q.neq('status', 'cancelled')), count('absence_requests', (q) => q.eq('status', 'pending')),
    supabase.from('profiles').select('registered_at'), supabase.from('attendance_records').select('status'),
    supabase.from('reservations').select('created_at,status,profiles(full_name),events(title)').order('created_at', { ascending: false }).limit(5),
    supabase.from('absence_requests').select('created_at,status,reason,member:profiles!absence_requests_member_id_fkey(full_name)').order('created_at', { ascending: false }).limit(5),
  ]);
  // Croissance sur 6 mois (cumul)
  const now = new Date(); const growth: [string, number][] = [];
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    growth.push([MONTHS[end.getMonth() === 0 ? 11 : end.getMonth() - 1], (profs ?? []).filter((p: any) => new Date(p.registered_at) < end).length]);
  }
  const attStats: [string, number][] = [['Présent', 'present'], ['Retard', 'late'], ['Excusé', 'excused'], ['Absent', 'absent']].map(([l, k]) => [l, (att ?? []).filter((a: any) => a.status === k).length]);
  const activity = [
    ...(lastRes ?? []).map((r: any) => ({ at: r.created_at, text: `${r.profiles?.full_name ?? 'Un membre'} — réservation (${r.status}) : ${r.events?.title}` })),
    ...(lastAbs ?? []).map((a: any) => ({ at: a.created_at, text: `${a.member?.full_name ?? 'Un membre'} — demande d’absence (${a.status}) : ${a.reason}` })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 8);
  const cards = [['Membres', members], ['Membres actifs', active], ['Événements à venir', events], ['Réservations', resv], ['Absences en attente', abs]];
  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-bold">Vue d’ensemble</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([l, n]) => <div key={String(l)} className="card border-l-4 border-l-royal"><p className="text-sm">{l}</p><p className="font-display text-5xl font-bold">{n}</p></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart title="Croissance des membres" data={growth} />
        <BarChart title="Assiduité (toutes séances)" data={attStats} color="bg-ases-red" />
      </div>
      <section className="card">
        <h2 className="mb-3 text-2xl font-bold">Activités récentes</h2>
        {activity.length ? <ul className="divide-y text-sm">{activity.map((a, i) => <li key={i} className="flex justify-between gap-4 py-2"><span>{a.text}</span><span className="shrink-0 text-navy/60">{fmt(a.at)}</span></li>)}</ul> : <p className="text-sm text-navy/60">Aucune activité pour le moment.</p>}
      </section>
    </div>
  );
}
