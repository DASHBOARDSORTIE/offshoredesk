# OffshoreDesk — Guide de déploiement

## Stack
- **Frontend** : React + Vite
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth
- **Stockage fichiers** : Supabase Storage
- **Hébergement** : Vercel (gratuit)
- **Emails** : Resend (gratuit jusqu'à 3000/mois)

---

## 1. Installer en local

```bash
cd offshore-dashboard
npm install
npm run dev
```

Ouvre http://localhost:5173

---

## 2. Créer le projet Supabase

1. Va sur https://supabase.com → New project
2. Copie l'URL et la clé `anon` dans un fichier `.env` :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxx
```

3. Installe le client :
```bash
npm install @supabase/supabase-js
```

---

## 3. Créer les tables SQL dans Supabase

```sql
-- Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now(),
  nom text not null,
  prenom text not null,
  email text unique not null,
  tel text,
  adresse text,
  type_compte text check (type_compte in ('Nominatif', 'Anonyme')),
  pays text,
  statut text default 'doc_manquant',
  progression int default 0
);

-- Documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  type text not null, -- cni, justif_dom, releve_banque, avis_impot, selfie
  nom_fichier text,
  url text,
  statut text default 'manquant', -- ok, manquant, expire
  uploaded_at timestamp
);

-- Tickets
create table tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now(),
  client_id uuid references clients(id) on delete cascade,
  titre text not null,
  message text,
  statut text default 'ouvert', -- ouvert, resolu
  priorite text default 'normal', -- normal, urgent
  auteur text default 'client' -- client, admin
);
```

---

## 4. Supabase Storage (pour les fichiers)

Dans Supabase → Storage → New bucket : `documents`
- Accès : Private (les fichiers sont protégés)
- RLS policy : seul l'admin peut lire/écrire

---

## 5. Déployer sur Vercel

```bash
npm install -g vercel
vercel
```

Ou connecte ton repo GitHub à Vercel (recommandé) :
1. Push le code sur GitHub
2. Va sur vercel.com → Import project
3. Ajoute les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
4. Deploy → URL publique générée automatiquement

---

## 6. Lien client (formulaire public)

Pour que tes clients remplissent eux-mêmes leur dossier :
- Crée une route `/onboarding/:token` dans l'app
- Génère un token unique par client à la création
- Envoie le lien par email avec Resend

```bash
npm install resend
```

```js
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@tondomaine.com',
  to: client.email,
  subject: 'Complétez votre dossier',
  html: `<p>Bonjour ${client.prenom}, <a href="https://tonapp.vercel.app/onboarding/${token}">cliquez ici</a> pour compléter votre dossier.</p>`
});
```

---

## Prochaines étapes suggérées
- [ ] Authentification admin (Supabase Auth)
- [ ] Notifications email automatiques quand un doc expire
- [ ] Espace client avec login
- [ ] Export PDF du dossier complet
- [ ] Signature électronique des documents
