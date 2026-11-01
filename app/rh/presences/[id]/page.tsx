import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { saveAttendance } from '@/lib/actions/hr';
import { fmt } from '@/lib/utils';

export default async function Appel({ params }: { params: { id: string } }) {
  const { supabase } = await requireRole(['admin', 'rh']);
  const { data: s } = await supabase.from('attendance_sessions').select('*').eq('id', params.id).maybeSingle();
  if (!s) notFound();
  const [{ data: members }, { data: recs }] = await Promise.all([
    supabase.from('profiles').select('id,full_name,student_id').eq('status', 'active').order('full_name'),
    supabase.from('attendance_records').select('member_id,status').eq('session_id', s.id),
  ]);
  const current = new Map(recs?.map((r) => [r.member_id, r.status]));
  return (
    <div className="container-ases max-w-3xl space-y-6 py-12">
      <Link href="/rh/presences" className="text-sm font-semibold text-royal">← Présences</Link>
      <div><h1 className="text-5xl font-bold">{s.title}</h1><p>{fmt(s.session_date)}</p></div>
      <form action={saveAttendance} className="card space-y-2">
        <input type="hidden" name="session_id" value={s.id} />
        {members?.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
            <span><b>{m.full_name}</b> <span className="text-sm text-navy/60">{m.student_id}</span></span>
            <select name={`s_${m.id}`} defaultValue={current.get(m.id) ?? ''} className="input !w-auto !py-1.5" aria-label={`Présence de ${m.full_name}`}>
              <option value="">—</option><option value="present">Présent</option><option value="absent">Absent</option><option value="late">En retard</option><option value="excused">Excusé</option>
            </select>
          </div>
        ))}
        <button className="btn-royal mt-4">Enregistrer l’appel</button>
      </form>
    </div>
  );
}
