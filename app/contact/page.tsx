import Title from '@/components/Title';
import { sendContact, applyMembership } from './actions';

export default function Contact({ searchParams }: { searchParams: { ok?: string; section?: string } }) {
  return (
    <div className="container-ases py-16">
      <Title>Contact & adhésion</Title>
      {searchParams.ok && <p role="status" className="mb-6 rounded bg-royal-100 p-3">Merci ! Votre message a bien été envoyé.</p>}
      <div className="grid gap-10 md:grid-cols-2">
        <form action={sendContact} className="card space-y-4">
          <h3 className="text-2xl font-bold">Nous écrire</h3>
          <div><label className="label" htmlFor="n">Nom</label><input id="n" name="name" required className="input" /></div>
          <div><label className="label" htmlFor="e">Email</label><input id="e" name="email" type="email" required className="input" /></div>
          <div><label className="label" htmlFor="m">Message</label><textarea id="m" name="message" required rows={5} className="input" /></div>
          <button className="btn-royal">Envoyer</button>
        </form>
        <form id="adhesion" action={applyMembership} className="card space-y-4">
          <h3 className="text-2xl font-bold">Rejoindre le club</h3>
          <div><label className="label" htmlFor="fn">Nom complet</label><input id="fn" name="full_name" required className="input" /></div>
          <div><label className="label" htmlFor="em">Email</label><input id="em" name="email" type="email" required className="input" /></div>
          <div><label className="label" htmlFor="sid">Numéro étudiant (CNE)</label><input id="sid" name="student_id" required className="input" /></div>
          <div><label className="label" htmlFor="sp">Sport(s) souhaité(s)</label><input id="sp" name="sports" defaultValue={searchParams.section} className="input" /></div>
          <button className="btn-red">Envoyer ma candidature</button>
        </form>
      </div>
    </div>
  );
}
