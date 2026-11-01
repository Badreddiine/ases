import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { markRead, markAllRead } from '../actions';
import { Empty } from '@/components/Title';
import { fmt } from '@/lib/utils';

export default async function Notifications() {
  const { supabase, user } = await requireRole(['admin', 'rh', 'member', 'event_manager']);
  const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200);
  const unread = data?.filter((n) => !n.is_read).length ?? 0;
  return (
    <div className="container-ases max-w-3xl py-12">
      <Link href="/membre" className="text-sm font-semibold text-royal">← Mon espace</Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><h1 className="text-5xl font-bold">Notifications <span className="text-ases-red">({unread})</span></h1>
        {unread > 0 && <form action={markAllRead}><button className="btn-outline !py-2 !text-base">Tout marquer comme lu</button></form>}</div>
      <ul className="space-y-2">
        {data?.length ? data.map((n) => (
          <li key={n.id} className={`card flex justify-between gap-3 !p-4 ${n.is_read ? 'opacity-60' : 'border-l-4 border-l-ases-red'}`}>
            <span><b>{n.title}</b> — {n.body}<br /><span className="text-xs text-navy/60">{fmt(n.created_at)}</span></span>
            {!n.is_read && <form action={markRead}><input type="hidden" name="id" value={n.id} /><button className="shrink-0 text-sm font-semibold text-royal">Marquer comme lu</button></form>}
          </li>)) : <Empty text="Aucune notification." />}
      </ul>
    </div>
  );
}
