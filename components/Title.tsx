export default function Title({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-10">
      <div className="stripe mb-3" />
      <h2 className="text-4xl font-bold md:text-5xl">{children}</h2>
      {sub && <p className="mt-2 max-w-2xl text-navy/70">{sub}</p>}
    </div>
  );
}
export const Empty = ({ text }: { text: string }) => (
  <div className="card text-center text-navy/60">{text}</div>
);
