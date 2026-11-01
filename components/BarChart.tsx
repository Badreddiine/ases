export default function BarChart({ title, data, color = 'bg-royal' }: { title: string; data: [string, number][]; color?: string }) {
  const max = Math.max(1, ...data.map(([, v]) => v));
  return (
    <figure className="card">
      <figcaption className="mb-4 font-display text-xl font-bold uppercase">{title}</figcaption>
      {data.length === 0 || data.every(([, v]) => v === 0) ? <p className="text-sm text-navy/60">Pas encore de données.</p> : (
        <div className="flex h-40 items-end gap-3" role="img" aria-label={title}>
          {data.map(([l, v]) => (
            <div key={l} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-semibold">{v}</span>
              <div className={`w-full rounded-t ${color}`} style={{ height: `${(v / max) * 100}%`, minHeight: v ? 4 : 0 }} />
              <span className="text-[11px] text-navy/70">{l}</span>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}
