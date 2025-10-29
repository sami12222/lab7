# Laboratoire 7 — SQL avec Express + gestion de session

Ce dépôt contient une implémentation complète, minimaliste et très commentée pour répondre au sujet **Laboratoire 7**.

## Contenu

- `app.js` : serveur Express + sessions + routes (login, home, logout, updates)
- `db.js` : pool de connexion MySQL/MariaDB (mysql2/promise)
- `views/*.ejs` : templates EJS (login + home)
- `public/styles.css` : CSS simple
- `sql/schema.sql` : création et remplissage de la base
- `.env.example` : variables d’environnement à copier en `.env`
- `package.json` : dépendances et scripts

## Pré-requis

- Node.js 18+
- MySQL/MariaDB
- (Optionnel) nodemon pour le mode `npm run dev`

## Installation

1. Créez la base et les données d’exemple :

```sql
-- Dans votre client MySQL/MariaDB
SOURCE sql/schema.sql;
```

2. Configurez vos variables d’environnement :

```
cp .env.example .env
# Éditez .env pour vos identifiants et port
```

3. Installez et démarrez :

```bash
npm install
npm start
# ou en dev: npm run dev
```

4. Ouvrez le navigateur : [http://localhost:3000](http://localhost:3000)

## Explications rapides

- **Login**: `POST /login` vérifie `login/password` dans la table `users`. En cas de succès, on remplit `req.session.user` comme demandé dans l’énoncé (ID, login, type/level).
- **Droits**:
  - **0** : lecture seule du message d’accueil.
  - **1** : peut modifier son `welcome_text` via `/update-message`.
  - **2** : peut aussi modifier son `password` via `/update-password`.
  - **3** : peut voir **tous** les comptes et modifier `welcome_text` et `password` de chacun via `/admin/update/:id`.
- **Sessions**: gérées par `cookie-session`, initialisées avant les routes. Déconnexion par `POST /logout`.

> NB sécurité: mots de passe en clair pour coller au sujet du lab. En vrai projet: utiliser `bcrypt`, CSRF tokens, validations, etc.

Bon travail!
