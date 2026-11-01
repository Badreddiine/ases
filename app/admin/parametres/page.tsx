import { requireRole } from '@/lib/auth';
import { saveSettings } from '@/lib/actions/content';

const FIELDS: [string, string][] = [['contact_email', 'Email de contact'], ['phone', 'Téléphone'], ['address', 'Adresse'], ['instagram_url', 'Instagram (URL)'], ['facebook_url', 'Facebook (URL)'], ['linkedin_url', 'LinkedIn (URL)']];
export default async function Parametres() {
  const { supabase } = await requireRole(['admin']);
  const { data } = await supabase.from('site_settings').select('key,value');
  const s = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return (
    <div>
      <h1 className="mb-6 text-5xl font-bold">Paramètres</h1>
      <form action={saveSettings} className="card grid gap-3 md:grid-cols-2">
        {FIELDS.map(([k, l]) => <div key={k}><label className="label" htmlFor={k}>{l}</label><input id={k} name={k} defaultValue={s[k] ?? ''} className="input" /></div>)}
        <button className="btn-royal md:col-span-2">Enregistrer les paramètres</button>
      </form>
    </div>
  );
}
