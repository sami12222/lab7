-- sql/schema.sql — Création et données de démonstration

DROP DATABASE IF EXISTS lab7;
CREATE DATABASE lab7 CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE lab7;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(63) NOT NULL UNIQUE,
  password VARCHAR(63) NOT NULL,
  level TINYINT NOT NULL CHECK (level BETWEEN 0 AND 3),
  welcome_text VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

INSERT INTO users (login, password, level, welcome_text) VALUES
  ('niveau0', 'pass0', 0, 'Bienvenue niveau 0 — lecture seule.'),
  ('niveau1', 'pass1', 1, 'Bienvenue niveau 1 — vous pouvez éditer votre message.'),
  ('niveau2', 'pass2', 2, 'Bienvenue niveau 2 — vous pouvez aussi changer votre mot de passe.'),
  ('admin3',  'admin', 3, 'Bienvenue niveau 3 — droits administrateur.');
