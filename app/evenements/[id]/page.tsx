import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { reserveEvent, cancelReservation } from './actions';

export default async function EventPage({ params, searchParams }: { params: { id: string }; searchParams: { msg?: string } }) {
  const supabase = createClient();
  const { data: e } = await supabase.from('events').select('*').eq('id', params.id).single();
  if (!e || e.status === 'draft') notFound();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: left } = await supabase.rpc('event_remaining', { p_event: e.id });
  const { data: mine } = user ? await supabase.from('reservations').select('id,status').eq('event_id', e.id).eq('user_id', user.id).neq('status', 'cancelled').maybeSingle() : { data: null };
  return (
    <div className="container-ases max-w-3xl py-16">
      {e.poster_url && <Image src={e.poster_url} alt={`Affiche : ${e.title}`} width={900} height={600} className="mb-6 w-full rounded-2xl object-cover" />}
      <p className="font-semibold text-ases-red">{e.category}</p>
      <h1 className="text-5xl font-bold">{e.title}</h1>
      <p className="mt-2">{e.location} — {new Date(e.starts_at).toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca', dateStyle: 'full', timeStyle: 'short' })}</p>
      <p className="mt-6 whitespace-pre-line">{e.description}</p>
      {e.conditions && <p className="mt-4 rounded bg-royal-100 p-3 text-sm"><b>Conditions :</b> {e.conditions}</p>}
      {e.registration_deadline && <p className="mt-2 text-sm">Inscriptions jusqu’au {new Date(e.registration_deadline).toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca', dateStyle: 'long', timeStyle: 'short' })}</p>}
      <div className="card mt-8">
        <p className="font-display text-2xl">Places restantes : {left ?? '—'} / {e.capacity}</p>
        {searchParams.msg && <p role="status" className="mt-2 rounded bg-royal-100 p-2 text-sm">{searchParams.msg}</p>}
        {!user ? <a href="/connexion" className="btn-royal mt-4">Se connecter pour réserver</a>
          : mine ? (
            <form action={cancelReservation} className="mt-4">
              <input type="hidden" name="id" value={mine.id} /><input type="hidden" name="event" value={e.id} />
              <p className="mb-2 text-sm">Votre réservation : <b>{mine.status === 'waitlisted' ? 'liste d’attente' : 'confirmée'}</b></p>
              <button className="btn-outline">Annuler ma réservation</button>
            </form>
          ) : (
            <form action={reserveEvent} className="mt-4"><input type="hidden" name="event" value={e.id} /><button className="btn-red">Réserver ma place</button></form>
          )}
      </div>
    </div>
  );
}
