export const TZ = 'Africa/Casablanca';
const OFFSET = '+01:00'; // heure du Maroc (adapter pendant le Ramadan si besoin)

/** "2026-11-02T18:30" (saisie datetime-local) -> ISO UTC */
export const toIso = (v?: string | null) => (v ? new Date(`${v}:00${OFFSET}`).toISOString() : null);
/** ISO UTC -> valeur pour <input type="datetime-local"> en heure du Maroc */
export function toInput(iso?: string | null) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)).replace(' ', 'T');
}
export const fmt = (iso: string) => new Date(iso).toLocaleString('fr-FR', { timeZone: TZ, dateStyle: 'long', timeStyle: 'short' });
export const clean = (o: Record<string, any>) => Object.fromEntries(Object.entries(o).filter(([k, v]) => v !== '' && v != null && !k.startsWith('$ACTION')));
