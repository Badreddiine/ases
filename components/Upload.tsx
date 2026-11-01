'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Props = { name: string; bucket: 'avatars' | 'board' | 'posters' | 'documents' | 'gallery'; label: string; accept?: string; maxMB?: number; defaultValue?: string };

/** Envoie le fichier dans Supabase Storage et place l'URL (ou le chemin pour un bucket privé) dans un champ caché. */
export default function Upload({ name, bucket, label, accept = 'image/*', maxMB = 5, defaultValue = '' }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [msg, setMsg] = useState('');
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > maxMB * 1024 * 1024) return setMsg(`Fichier trop lourd (max ${maxMB} Mo).`);
    setMsg('Envoi en cours…');
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    const folder = bucket === 'avatars' || bucket === 'documents' ? user?.id : 'uploads';
    const path = `${folder}/${crypto.randomUUID()}-${f.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error } = await sb.storage.from(bucket).upload(path, f, { contentType: f.type });
    if (error) return setMsg(error.message);
    setValue(bucket === 'documents' ? path : sb.storage.from(bucket).getPublicUrl(path).data.publicUrl);
    setMsg('Fichier envoyé ✓');
  }
  const id = `up-${name}`;
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} type="file" accept={accept} onChange={onChange} className="input !py-1.5" />
      <input type="hidden" name={name} value={value} />
      <p role="status" className="mt-1 text-xs text-navy/70">{msg}</p>
    </div>
  );
}
