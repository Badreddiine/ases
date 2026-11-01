import EventsManager from '@/components/EventsManager';
export default function Page({ searchParams }: { searchParams: { edit?: string } }) {
  return (<div><h1 className="mb-6 text-5xl font-bold">Gestion des événements</h1><EventsManager base="/admin/evenements" edit={searchParams.edit} /></div>);
}
