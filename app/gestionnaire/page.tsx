import EventsManager from '@/components/EventsManager';
export default function Page({ searchParams }: { searchParams: { edit?: string } }) {
  return (
    <div className="container-ases py-12">
      <h1 className="mb-6 text-5xl font-bold">Mes événements</h1>
      <EventsManager base="/gestionnaire" edit={searchParams.edit} />
    </div>
  );
}
