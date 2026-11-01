import Image from 'next/image';
export default function Logo({ size = 44 }: { size?: number }) {
  return (
    <span className="flex items-center gap-3">
      <Image src="/logo.png" alt="Logo ASES" width={size} height={size} className="rounded-full" />
      <span className="font-display text-2xl uppercase leading-none tracking-wide">
        ASES<span className="block text-[10px] font-sans tracking-widest text-white/70">ENCG SETTAT</span>
      </span>
    </span>
  );
}
