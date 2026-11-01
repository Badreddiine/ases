import { signup } from './actions';
export default function Inscription({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  return (
    <div className="container-ases max-w-md py-20">
      <h1 className="text-5xl font-bold">Créer un compte</h1>
      <form action={signup} className="card mt-6 space-y-4">
        {searchParams.ok && <p role="status" className="rounded bg-royal-100 p-2 text-sm">Compte créé. Vérifiez votre email pour confirmer.</p>}
        {searchParams.error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-ases-red">{searchParams.error}</p>}
        <div><label className="label" htmlFor="n">Nom complet</label><input id="n" name="full_name" required className="input" /></div>
        <div><label className="label" htmlFor="e">Email</label><input id="e" name="email" type="email" required className="input" /></div>
        <div><label className="label" htmlFor="p">Mot de passe (8 caractères min.)</label><input id="p" name="password" type="password" minLength={8} required className="input" /></div>
        <button className="btn-red w-full">Créer mon compte</button>
      </form>
    </div>
  );
}
