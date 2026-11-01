import { requireRole } from '@/lib/auth';
import MembersTable from '@/components/MembersTable';
export default async function Membres({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const { supabase } = await requireRole(['admin']);
  return (<div><h1 className="mb-6 text-5xl font-bold">Gestion des membres</h1><MembersTable supabase={supabase} q={searchParams.q} status={searchParams.status} /></div>);
}
