# ASES – Home Of Champions ❤️🏅💙

Plateforme de l'Association Sportive de l'ENCG de Settat (Next.js 14 App Router · TypeScript · Tailwind · Supabase).

## Démarrage
1. `npm install`
2. Créez un projet Supabase, puis exécutez dans l'éditeur SQL : `supabase/migrations/001_schema.sql` puis `supabase/seed.sql`.
3. `cp .env.example .env.local` et renseignez l'URL + la clé anon.
4. `npm run dev` → http://localhost:3000
5. Créez un compte via /inscription, puis passez-le admin **une seule fois** dans l'éditeur SQL :
   `update profiles set role='admin', status='active' where email='vous@exemple.ma';`
6. Déploiement : importer le dépôt dans Vercel + variables d'environnement.

## Identité visuelle (extraite du logo)
Bleu nuit `#0A1450` · Bleu royal `#1F4FD8` · Rouge `#E3263B` · Blanc — voir `tailwind.config.ts` et `app/globals.css`. Polices : Barlow Condensed (titres) + Barlow (texte).

## Sécurité
- RLS activé sur toutes les tables ; rôle forcé à `member` à l'inscription (trigger) ; modification de rôle/statut réservée à l'admin (trigger).
- Réservations, annulations, liste d'attente et check-in QR via fonctions SQL transactionnelles (verrou de ligne, index unique anti-doublon).
- Contrôle serveur du rôle (`lib/auth.ts`, `middleware.ts`) en plus du RLS.

## Modules
- **Public** : accueil (stats, événements, actualités, sections, galerie, contact), à propos, Le Bureau (prévisualisation admin via `?preview=`), anciens bureaux, sections, événements (recherche, filtres, réservation, liste d'attente), galerie, contact et adhésion.
- **Membre** (`/membre`) : profil + avatar + sections, assiduité, réservations avec QR Code, demandes d'absence avec justificatif, notifications (compteur, historique).
- **RH** (`/rh`) : statistiques, absences (filtres statut/date, commentaires, justificatifs), annuaire et statut des membres, séances de présence (`/rh/presences`), appel, assiduité par période.
- **Responsable d'événements** (`/gestionnaire`) : ses événements (création, affiche, statut), participants, scan QR (caméra ou lecteur) et validation manuelle ; aucun accès aux données RH.
- **Admin** (`/admin`) : vue d'ensemble avec graphiques et activités, membres, bureau (création, édition, photos, activation/archivage), événements, réservations, actualités + annonces, galerie (photos/vidéos), sections, comptes et rôles, paramètres.

## Notes
- Fuseau horaire : les dates saisies sont interprétées en heure du Maroc (`lib/utils.ts`, décalage `+01:00`).
- Les comptes se créent via l'inscription publique ; seul l'admin attribue un rôle privilégié (création de comptes par l'admin avec mot de passe imposé nécessiterait la clé `service_role`, volontairement non utilisée).
- Le scanner par caméra utilise l'API `BarcodeDetector` (Chrome/Edge/Android) ; sinon, saisie manuelle ou lecteur USB.
- Pour les composants shadcn/ui : `npx shadcn@latest init` (le style actuel est en Tailwind pur).
