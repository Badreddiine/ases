import Link from 'next/link';
import { login } from './actions';
export default function Connexion({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="container-ases max-w-md py-20">
      <h1 className="text-5xl font-bold">Connexion</h1>
      <form action={login} className="card mt-6 space-y-4">
        {searchParams.error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-ases-red">{searchParams.error}</p>}
        <div><label className="label" htmlFor="e">Email</label><input id="e" name="email" type="email" required className="input" /></div>
        <div><label className="label" htmlFor="p">Mot de passe</label><input id="p" name="password" type="password" required className="input" /></div>
        <button className="btn-royal w-full">Se connecter</button>
        <p className="text-sm">Pas de compte ? <Link href="/inscription" className="font-semibold text-royal">Créer un compte</Link></p>
      </form>
    </div>
  );
}
