'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const back = (id: string, msg: string) => redirect(`/evenements/${id}?msg=${encodeURIComponent(msg)}`);

export async function reserveEvent(fd: FormData) {
  const id = String(fd.get('event'));
  const { data, error } = await createClient().rpc('reserve_event', { p_event: id });
  if (error) back(id, error.message);
  back(id, data === 'waitlisted' ? 'Événement complet : vous êtes sur liste d’attente.' : 'Réservation confirmée. Votre QR Code est dans Mon espace.');
}
export async function cancelReservation(fd: FormData) {
  const id = String(fd.get('event'));
  const { error } = await createClient().rpc('cancel_reservation', { p_reservation: String(fd.get('id')) });
  back(id, error ? error.message : 'Réservation annulée.');
}
