import Title from '@/components/Title';
const values = [['Esprit d’équipe', 'Gagner ensemble, progresser ensemble.'], ['Excellence', 'Exigence sur le terrain comme dans les études.'], ['Fair-play', 'Le respect avant le résultat.'], ['Engagement', 'Un club qui vit grâce à ses membres.']];
export default function About() {
  return (
    <div className="container-ases py-16">
      <Title sub="26 ans d’histoire sportive à l’ENCG de Settat.">À propos d’ASES</Title>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="card"><h3 className="text-2xl font-bold">Histoire</h3><p className="mt-2">Remplacez ce texte par l’histoire officielle de l’association : fondation, étapes clés, titres.</p></div>
        <div className="card"><h3 className="text-2xl font-bold">Mission & vision</h3><p className="mt-2">Faire du sport un levier de réussite et de cohésion pour les étudiants de l’ENCG Settat.</p></div>
      </div>
      <h3 className="mt-12 text-3xl font-bold">Nos valeurs</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {values.map(([t, d]) => <div key={t} className="card border-t-4 border-t-ases-red"><h4 className="font-display text-xl font-bold uppercase">{t}</h4><p className="text-sm">{d}</p></div>)}
      </div>
    </div>
  );
}
