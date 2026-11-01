import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import Title, { Empty } from '@/components/Title';
import { fmt } from '@/lib/utils';

export default async function Home() {
  const supabase = createClient();
  const [{ count: members }, { count: events }, { count: sections }, { data: upcoming }, { data: news }, { data: secs }, { data: gal }, { data: set }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('events').select('*', { count: 'exact', head: true }).neq('status', 'draft'),
    supabase.from('sports_sections').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('id,title,starts_at,location').eq('status', 'published').gte('starts_at', new Date().toISOString()).order('starts_at').limit(3),
    supabase.from('news').select('id,title,excerpt').eq('is_published', true).order('published_at', { ascending: false }).limit(3),
    supabase.from('sports_sections').select('id,name,description').order('name').limit(4),
    supabase.from('gallery').select('id,url,title,media_type').eq('media_type', 'image').order('created_at', { ascending: false }).limit(4),
    supabase.from('site_settings').select('key,value'),
  ]);
  const s = Object.fromEntries((set ?? []).map((r) => [r.key, r.value]));
  const stats = [[members ?? 0, 'Membres actifs'], [events ?? 0, 'Événements'], [sections ?? 0, 'Sections sportives'], [26, 'Ans d’héritage']];
  return (
    <>
      <section className="relative overflow-hidden bg-ases-night text-white">
        <div className="container-ases grid items-center gap-10 py-20 md:grid-cols-2 md:py-28">
          <div className="hero-in">
            <p className="font-display text-xl uppercase text-ases-red">❤️🏅💙 Association Sportive de l’ENCG de Settat</p>
            <h1 className="mt-3 text-6xl font-extrabold leading-[0.9] md:text-8xl">Home<br />of Champions</h1>
            <p className="mt-5 font-display text-3xl uppercase text-white/80">26 Years of Legacy</p>
            <div className="mt-8 flex flex-wrap gap-4"><Link href="/a-propos" className="btn-red">Découvrir ASES</Link><Link href="/contact#adhesion" className="btn-ghost">Rejoindre le club</Link></div>
          </div>
          <div className="hero-in flex justify-center"><Image src="/logo.png" alt="Logo ASES" width={380} height={380} priority className="rounded-full shadow-2xl ring-4 ring-white/10" /></div>
        </div>
      </section>

      <section className="container-ases grid grid-cols-2 gap-6 py-14 md:grid-cols-4">
        {stats.map(([n, l]) => (<div key={String(l)} className="border-l-4 border-ases-red pl-4"><div className="font-display text-5xl font-bold text-royal">{n}</div><div className="text-sm font-semibold">{l}</div></div>))}
      </section>

      <section className="container-ases py-10">
        <Title sub="Association sportive étudiante de l’ENCG Settat : compétitions, tests de sélection et vie de club depuis 26 ans.">Bienvenue chez ASES</Title>
      </section>

      <section className="container-ases py-10">
        <Title sub="Réservez votre place avant qu’il n’y en ait plus.">Prochains événements</Title>
        {upcoming?.length ? (
          <div className="grid gap-6 md:grid-cols-3">{upcoming.map((e) => (
            <Link key={e.id} href={`/evenements/${e.id}`} className="card hover:border-royal"><p className="text-sm font-semibold text-ases-red">{fmt(e.starts_at)}</p><h3 className="mt-1 text-2xl font-bold">{e.title}</h3><p className="text-sm text-navy/70">{e.location}</p></Link>))}</div>
        ) : <Empty text="Aucun événement à venir pour le moment." />}
      </section>

      <section className="container-ases py-10">
        <Title>Actualités</Title>
        {news?.length ? <div className="grid gap-6 md:grid-cols-3">{news.map((n) => (<article key={n.id} className="card"><h3 className="text-2xl font-bold">{n.title}</h3><p className="mt-2 text-navy/70">{n.excerpt}</p></article>))}</div> : <Empty text="Aucune actualité publiée." />}
      </section>

      <section className="container-ases py-10">
        <Title>Sections sportives</Title>
        {secs?.length ? <div className="grid gap-6 md:grid-cols-4">{secs.map((x) => (<Link key={x.id} href="/sections" className="card border-t-4 border-t-royal hover:border-ases-red"><h3 className="text-2xl font-bold">{x.name}</h3><p className="text-sm text-navy/70">{x.description}</p></Link>))}</div> : <Empty text="Aucune section pour le moment." />}
      </section>

      <section className="container-ases py-10">
        <Title>Galerie</Title>
        {gal?.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{gal.map((g) => <Image key={g.id} src={g.url} alt={g.title ?? 'Photo ASES'} width={400} height={400} className="h-48 w-full rounded-xl object-cover" />)}</div> : <Empty text="La galerie sera bientôt alimentée." />}
        <Link href="/galerie" className="btn-outline mt-6">Voir toute la galerie</Link>
      </section>

      <section className="bg-navy-900 py-14 text-white">
        <div className="container-ases flex flex-wrap items-center justify-between gap-6">
          <div><h2 className="text-4xl font-bold">Une question ? Envie de nous rejoindre ?</h2>
            <p className="mt-2 text-white/80">{[s.contact_email, s.phone, s.address].filter(Boolean).join(' · ') || 'ENCG Settat'}</p></div>
          <Link href="/contact" className="btn-red">Nous contacter</Link>
        </div>
      </section>
    </>
  );
}
