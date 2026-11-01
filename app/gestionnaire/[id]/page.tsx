import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { checkInForm } from '@/lib/actions/checkin';
import { fmt } from '@/lib/utils';
import Scanner from '@/components/Scanner';

const LABEL: Record<string, string> = { confirmed: 'Confirmée', waitlisted: 'Liste d’attente', cancelled: 'Annulée', checked_in: 'Présent' };
export default async function Participants({ params }: { params: { id: string } }) {
  const { supabase } = await requireRole(['admin', 'event_manager']);
  const { data: e } = await supabase.from('events').select('*').eq('id', params.id).maybeSingle();
  if (!e) notFound();
  const { data: res } = await supabase.from('reservations').select('id,status,qr_token,created_at,checked_in_at,profiles(full_name,student_id,email)').eq('event_id', e.id).order('created_at');
  const n = (s: string) => res?.filter((r) => r.status === s).length ?? 0;
  return (
    <div className="container-ases space-y-8 py-12">
      <Link href="/gestionnaire" className="text-sm font-semibold text-royal">← Mes événements</Link>
      <div><h1 className="text-5xl font-bold">{e.title}</h1><p>{fmt(e.starts_at)} · {e.location}</p></div>
      <div className="grid gap-4 sm:grid-cols-4">
        {[['Confirmées', n('confirmed')], ['Présents', n('checked_in')], ['Liste d’attente', n('waitlisted')], ['Capacité', e.capacity]].map(([l, v]) => <div key={String(l)} className="card"><p className="text-sm">{l}</p><p className="font-display text-4xl font-bold text-royal">{v}</p></div>)}
      </div>
      <Scanner />
      <section>
        <h2 className="mb-3 text-3xl font-bold">Participants</h2>
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy text-white"><tr><th className="p-3">Nom</th><th className="p-3">CNE</th><th className="p-3">Statut</th><th className="p-3">Réservé le</th><th className="p-3"></th></tr></thead>
            <tbody>{res?.length ? res.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-semibold">{r.profiles?.full_name}</td><td className="p-3">{r.profiles?.student_id}</td>
                <td className="p-3">{LABEL[r.status]}{r.checked_in_at && ` · ${fmt(r.checked_in_at)}`}</td><td className="p-3">{fmt(r.created_at)}</td>
                <td className="p-3">{r.status === 'confirmed' && <form action={checkInForm}><input type="hidden" name="token" value={r.qr_token} /><button className="btn-royal !px-3 !py-1 !text-sm">Valider la présence</button></form>}</td>
              </tr>)) : <tr><td colSpan={5} className="p-6 text-center text-navy/60">Aucune réservation pour le moment.</td></tr>}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
