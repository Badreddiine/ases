import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { requireRole } from '@/lib/auth';
import { logout } from '../connexion/actions';
import { submitAbsence } from './actions';
import { Empty } from '@/components/Title';
import Upload from '@/components/Upload';
import { fmt } from '@/lib/utils';

const RES: Record<string, string> = { confirmed: 'Confirmée', waitlisted: 'Liste d’attente', checked_in: 'Présence validée', cancelled: 'Annulée' };
export default async function Membre() {
  const { supabase, user, profile } = await requireRole(['admin', 'rh', 'member', 'event_manager']);
  const [{ data: res }, { data: abs }, { count: unread }, { data: att }, { data: upcoming }] = await Promise.all([
    supabase.from('reservations').select('id,status,qr_token,events(id,title,starts_at,location)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('absence_requests').select('*').eq('member_id', user.id).order('created_at', { ascending: false }),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
    supabase.from('attendance_records').select('status').eq('member_id', user.id),
    supabase.from('events').select('id,title,starts_at,location').eq('status', 'published').gte('starts_at', new Date().toISOString()).order('starts_at').limit(4),
  ]);
  const total = att?.length ?? 0;
  const present = att?.filter((a) => a.status === 'present' || a.status === 'late').length ?? 0;
  const active = res?.filter((r: any) => r.status !== 'cancelled') ?? [];
  const L: Record<string, string> = { pending: 'En attente', approved: 'Approuvée', rejected: 'Refusée' };
  const S: Record<string, string> = { active: 'Actif', pending: 'En attente', suspended: 'Suspendu' };
  return (
    <div className="container-ases space-y-12 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile.avatar_url && <Image src={profile.avatar_url} alt="" width={72} height={72} className="h-18 w-18 rounded-full object-cover" />}
          <div><h1 className="text-5xl font-bold">Bienvenue, {profile.full_name ?? 'champion'}</h1>
            <p className="mt-1">Statut : <b>{S[profile.status]}</b>{profile.student_id && <> · CNE {profile.student_id}</>}</p></div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/membre/profil" className="btn-outline !py-2 !text-base">Mon profil</Link>
          {profile.role === 'admin' && <Link href="/admin" className="btn-royal !py-2 !text-base">Administration</Link>}
          {['admin', 'rh'].includes(profile.role) && <Link href="/rh" className="btn-royal !py-2 !text-base">Espace RH</Link>}
          {['admin', 'event_manager'].includes(profile.role) && <Link href="/gestionnaire" className="btn-royal !py-2 !text-base">Mes événements</Link>}
          <form action={logout}><button className="btn-outline !py-2 !text-base">Déconnexion</button></form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card"><p className="text-sm">Assiduité</p><p className="font-display text-5xl font-bold text-royal">{total ? Math.round((present / total) * 100) : 0}%</p><p className="text-sm">{present} présences sur {total} séances</p></div>
        <div className="card"><p className="text-sm">Réservations actives</p><p className="font-display text-5xl font-bold text-royal">{active.length}</p></div>
        <Link href="/membre/notifications" className="card hover:border-royal"><p className="text-sm">Notifications non lues</p><p className="font-display text-5xl font-bold text-ases-red">{unread ?? 0}</p></Link>
      </div>

      <section>
        <h2 className="text-3xl font-bold">Prochains événements</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {upcoming?.length ? upcoming.map((e) => <Link key={e.id} href={`/evenements/${e.id}`} className="card hover:border-royal"><p className="text-sm font-semibold text-ases-red">{fmt(e.starts_at)}</p><h3 className="text-xl font-bold">{e.title}</h3><p className="text-sm">{e.location}</p></Link>) : <Empty text="Aucun événement à venir." />}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold">Mes réservations</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {res?.length ? res.map((r: any) => (
            <div key={r.id} className={`card flex items-center justify-between gap-4 ${r.status === 'cancelled' ? 'opacity-60' : ''}`}>
              <div><Link href={`/evenements/${r.events?.id}`} className="text-xl font-bold hover:text-royal">{r.events?.title}</Link><p className="text-sm">{r.events && fmt(r.events.starts_at)}</p><p className="text-sm font-semibold">{RES[r.status]}</p></div>
              {r.status === 'confirmed' && <div className="text-center"><QRCodeSVG value={r.qr_token} size={96} /><p className="mt-1 text-[10px] text-navy/60">QR d’entrée</p></div>}
            </div>
          )) : <Empty text="Aucune réservation. Découvrez les événements à venir." />}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold">Mes demandes d’absence</h2>
        <form action={submitAbsence} className="card mt-4 grid gap-3 md:grid-cols-4">
          <div><label className="label" htmlFor="s">Début</label><input id="s" type="date" name="start_date" required className="input" /></div>
          <div><label className="label" htmlFor="e">Fin</label><input id="e" type="date" name="end_date" required className="input" /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="r">Motif</label><input id="r" name="reason" required className="input" /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="d">Description</label><input id="d" name="description" className="input" /></div>
          <div className="md:col-span-2"><Upload name="document_url" bucket="documents" label="Justificatif (PDF ou image, si requis)" accept="application/pdf,image/*" /></div>
          <button className="btn-royal md:col-span-4">Envoyer la demande</button>
        </form>
        <ul className="mt-4 space-y-2">
          {abs?.map((a) => <li key={a.id} className="card !p-4 text-sm">{a.start_date} → {a.end_date} · {a.reason} · <b>{L[a.status]}</b>{a.rh_comment && <> · « {a.rh_comment} »</>}</li>)}
        </ul>
      </section>
    </div>
  );
}
