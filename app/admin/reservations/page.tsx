import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { fmt } from '@/lib/utils';
import { Empty } from '@/components/Title';

export default async function Reservations() {
  const { supabase } = await requireRole(['admin']);
  const { data } = await supabase.from('events').select('id,title,starts_at,capacity,status,reservations(status)').order('starts_at', { ascending: false });
  return (
    <div>
      <h1 className="mb-6 text-5xl font-bold">Réservations</h1>
      {data?.length ? (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy text-white"><tr><th className="p-3">Événement</th><th className="p-3">Date</th><th className="p-3">Confirmées</th><th className="p-3">Attente</th><th className="p-3">Présents</th><th className="p-3"></th></tr></thead>
            <tbody>{data.map((e: any) => {
              const c = (s: string) => e.reservations.filter((r: any) => r.status === s).length;
              return (<tr key={e.id} className="border-t"><td className="p-3 font-semibold">{e.title}</td><td className="p-3">{fmt(e.starts_at)}</td><td className="p-3">{c('confirmed') + c('checked_in')} / {e.capacity}</td><td className="p-3">{c('waitlisted')}</td><td className="p-3">{c('checked_in')}</td><td className="p-3"><Link href={`/gestionnaire/${e.id}`} className="font-semibold text-royal">Détail & scan</Link></td></tr>);
            })}</tbody>
          </table>
        </div>
      ) : <Empty text="Aucun événement pour le moment." />}
    </div>
  );
}
