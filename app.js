/*
--------------------------------------------------------------
  Laboratoire 7 — Serveur Web Express avec SQL et Sessions
  Cours : 247-GFH-LG Intégration logicielle
  Étudiant : Sami Abdelkhalek
  Date : Automne 2025

  Description :
  Ce serveur Express met en œuvre un système complet de connexion
  avec gestion de droits d'accès (niveaux 0 à 3). L'application
  permet à chaque utilisateur de :
    - Se connecter via un formulaire (login / mot de passe)
    - Conserver sa session avec cookie-session
    - Modifier son message d’accueil selon son niveau
    - Modifier son mot de passe (niveau 2 et +)
    - Administrer les autres comptes (niveau 3)
--------------------------------------------------------------
*/

require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('cookie-session');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Middleware -----
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sessions (cookies) et initialisation de req.session.user
app
  .use(session({
    name: 'lab7sid',
    secret: process.env.SESSION_SECRET || 'todotopsecret',
  }))
  .use(function (req, res, next) {
    if (typeof req.session.user === 'undefined') {
      req.session.user = { id: 0, login: '', level: 0 };
    }
    next();
  });

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ----- Helpers -----
function requireAuth(req, res, next) {
  if (!req.session.user || !req.session.user.id) {
    return res.redirect('/');
  }
  next();
}

// ----- Routes -----
// Page d'accueil: formulaire de login
app.get('/', (req, res) => {
  // Si déjà connecté, aller directement à /home
  if (req.session.user && req.session.user.id) {
    return res.redirect('/home');
  }
  res.render('login', { error: null });
});

// Traitement du login
app.post('/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE login = ? AND password = ?',
      [login, password]
    );
    if (rows.length === 1) {
      const u = rows[0];
      // Remplir la session selon la BDD (comme dans l’énoncé)
      req.session.user.id = u.id;
      req.session.user.login = u.login;
      req.session.user.level = u.level;
      return res.redirect('/home');
    }
    return res
      .status(401)
      .render('login', { error: 'Login ou mot de passe invalide.' });
  } catch (err) {
    console.error('ERREUR SQL /login:', err);
    return res
      .status(500)
      .render('login', { error: 'Erreur serveur : ' + err.message });
  }
});

// Déconnexion
app.post('/logout', (req, res) => {
  req.session.user = { id: 0, login: '', level: 0 };
  res.redirect('/');
});

// Page principale après login
app.get('/home', requireAuth, async (req, res) => {
  const me = req.session.user;
  try {
    // Récupérer mon enregistrement
    const [mineRows] = await db.query(
      'SELECT id, login, level, welcome_text, password FROM users WHERE id = ?',
      [me.id]
    );
    const mine = mineRows[0];

    let allUsers = [];
    if (me.level >= 3) {
      const [rows] = await db.query(
        'SELECT id, login, level, welcome_text, password FROM users ORDER BY id'
      );
      allUsers = rows;
    }

    res.render('home', { me, mine, allUsers });
  } catch (err) {
    console.error('ERREUR SQL /home:', err);
    res.status(500).send('Erreur SQL : ' + err.message);
  }
});

// Mise à jour de mon welcome_text (level >= 1)
app.post('/update-message', requireAuth, async (req, res) => {
  const { welcome_text } = req.body;
  const me = req.session.user;
  if (me.level < 1) return res.status(403).send('Accès refusé');
  try {
    await db.query('UPDATE users SET welcome_text = ? WHERE id = ?', [
      welcome_text,
      me.id,
    ]);
    res.redirect('/home');
  } catch (err) {
    console.error('ERREUR SQL /update-message:', err);
    res.status(500).send('Erreur SQL : ' + err.message);
  }
});

// Mise à jour de mon mot de passe (level >= 2)
app.post('/update-password', requireAuth, async (req, res) => {
  const { password } = req.body;
  const me = req.session.user;
  if (me.level < 2) return res.status(403).send('Accès refusé');
  try {
    await db.query('UPDATE users SET password = ? WHERE id = ?', [
      password,
      me.id,
    ]);
    res.redirect('/home');
  } catch (err) {
    console.error('ERREUR SQL /update-password:', err);
    res.status(500).send('Erreur SQL : ' + err.message);
  }
});

// Admin (level 3): peut voir/éditer messages & passwords de tous
app.post('/admin/update/:id', requireAuth, async (req, res) => {
  const me = req.session.user;
  if (me.level < 3) return res.status(403).send('Accès refusé');
  const { id } = req.params;
  const { welcome_text, password } = req.body;
  try {
    if (typeof welcome_text !== 'undefined') {
      await db.query('UPDATE users SET welcome_text = ? WHERE id = ?', [
        welcome_text,
        id,
      ]);
    }
    if (typeof password !== 'undefined') {
      await db.query('UPDATE users SET password = ? WHERE id = ?', [
        password,
        id,
      ]);
    }
    res.redirect('/home');
  } catch (err) {
    console.error('ERREUR SQL /admin/update:', err);
    res.status(500).send('Erreur SQL : ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Lab 7 en marche sur http://localhost:${PORT}`);
});
