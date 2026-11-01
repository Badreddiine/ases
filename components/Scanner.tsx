'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { checkInToken, type CheckInResult } from '@/lib/actions/checkin';

export default function Scanner() {
  const video = useRef<HTMLVideoElement>(null);
  const [res, setRes] = useState<CheckInResult | null>(null);
  const [cam, setCam] = useState(false);
  const [manual, setManual] = useState('');
  const [pending, start] = useTransition();
  const last = useRef('');

  const submit = (t: string) => start(async () => setRes(await checkInToken(t)));

  useEffect(() => {
    if (!cam) return;
    let stream: MediaStream; let timer: any;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (video.current) { video.current.srcObject = stream; await video.current.play(); }
        // @ts-ignore BarcodeDetector n'est pas encore dans les types DOM
        const det = new BarcodeDetector({ formats: ['qr_code'] });
        timer = setInterval(async () => {
          if (!video.current) return;
          const codes = await det.detect(video.current).catch(() => []);
          if (codes[0] && codes[0].rawValue !== last.current) { last.current = codes[0].rawValue; submit(codes[0].rawValue); }
        }, 600);
      } catch { setRes({ ok: false, message: 'Caméra ou lecteur QR indisponible : utilisez la saisie manuelle.' }); setCam(false); }
    })();
    return () => { clearInterval(timer); stream?.getTracks().forEach((t) => t.stop()); };
  }, [cam]);

  return (
    <div className="card space-y-4">
      <h2 className="text-2xl font-bold">Scanner un QR Code</h2>
      <button onClick={() => { last.current = ''; setCam(!cam); }} className="btn-royal !py-2 !text-base">{cam ? 'Arrêter la caméra' : 'Activer la caméra'}</button>
      {cam && <video ref={video} muted playsInline className="w-full max-w-sm rounded-xl bg-black" />}
      <form onSubmit={(e) => { e.preventDefault(); if (manual) submit(manual); setManual(''); }} className="flex gap-2">
        <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Code du QR (lecteur USB ou saisie)" className="input" aria-label="Code QR" />
        <button className="btn-outline !py-2 !text-base" disabled={pending}>Valider</button>
      </form>
      {res && (
        <div role="status" className={`rounded-xl p-4 ${res.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-ases-red'}`}>
          <p className="font-bold">{res.message}</p>
          {res.ok && <p className="text-sm">{res.member} · CNE {res.student_id ?? '—'} · {res.event}</p>}
        </div>
      )}
    </div>
  );
}
