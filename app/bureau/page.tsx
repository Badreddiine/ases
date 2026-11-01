import { createClient } from '@/lib/supabase/server';
import Title, { Empty } from '@/components/Title';
import BoardView from '@/components/BoardView';

export default async function Bureau({ searchParams }: { searchParams: { preview?: string } }) {
  const supabase = createClient();
  let board: any = null; let preview = false;
  if (searchParams.preview) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: me } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
    if (me?.role === 'admin') { board = (await supabase.from('boards').select('*').eq('id', searchParams.preview).maybeSingle()).data; preview = !!board; }
  }
  if (!board) board = (await supabase.from('boards').select('*').eq('is_active', true).maybeSingle()).data;
  return (
    <div className="container-ases py-16">
      {preview && <p role="status" className="mb-6 rounded bg-yellow-100 p-3 text-sm font-semibold">Aperçu administrateur — ce bureau n’est peut-être pas encore publié.</p>}
      <Title sub="Découvrez l’équipe qui fait vivre l’Association Sportive de l’ENCG de Settat.">Le Bureau ASES</Title>
      {board ? <BoardView board={board} /> : <Empty text="Aucun bureau actif pour le moment." />}
    </div>
  );
}
