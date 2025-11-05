-- phpMyAdmin SQL Dump
-- Version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : db:3306
-- Généré le : mar. 11 fév. 2025 à 15:44
-- Version du serveur : 8.0.30
-- Version de PHP : 8.0.27




SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET NAMES utf8mb4 */;
/*!40101 SET CHARACTER_SET_CLIENT=utf8mb4 */;
/*!40101 SET CHARACTER_SET_RESULTS=utf8mb4 */;

SET FOREIGN_KEY_CHECKS = 0;

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS `db_gestionnaireLivre`;
USE `db_gestionnaireLivre`;

-- Création de la table des utilisateurs
CREATE TABLE t_user(
  `user_id` INT AUTO_INCREMENT,
  `pseudo` VARCHAR(50),
  `mdp` VARCHAR(50),
  `date_entre` DATE,
  `admin` BOOLEAN,
  PRIMARY KEY(`user_id`),
  UNIQUE(`pseudo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Création de la table des écrivains
CREATE TABLE `t_ecrivain` (
  `ecrivain_id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  PRIMARY KEY (`ecrivain_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Correction de la table des catégories
CREATE TABLE t_categorie(
  `categorie_id` INT AUTO_INCREMENT,
  `nom` VARCHAR(50),
  PRIMARY KEY(`categorie_id`)
);




-- Correction de la table des ouvrages
CREATE TABLE t_ouvrage(
  `ouvrage_id` INT AUTO_INCREMENT,
  `titre` VARCHAR(50),
  `nb_pages` VARCHAR(50),
  `extrait` VARCHAR(50),
  `resume` VARCHAR(50),
  `annee_edition` DATE,
  `nom_editeur` VARCHAR(50),
  `img_couverture` BLOB,
  `categorie_fk` INT NOT NULL,
  `user_fk` INT NOT NULL,
  `ecrivain_fk` INT NOT NULL,
  PRIMARY KEY(`ouvrage_id`),
  UNIQUE(`titre`),
  UNIQUE(`extrait`),
  FOREIGN KEY(`categorie_fk`) REFERENCES `t_categorie`(`categorie_id`),
  FOREIGN KEY(`user_fk`) REFERENCES `t_user`(`user_id`),
  FOREIGN KEY(`ecrivain_fk`) REFERENCES `t_ecrivain`(`ecrivain_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table des évaluations
CREATE TABLE `evaluer` (
  `ouvrage_fk` int NOT NULL,
  `user_fk` int NOT NULL,
  `commentaire` varchar(255) NOT NULL,
  `note` tinyint NOT NULL CHECK (`note` BETWEEN 0 AND 5),
  PRIMARY KEY (`ouvrage_fk`, `user_fk`),
  FOREIGN KEY (`ouvrage_fk`) REFERENCES `t_ouvrage`(`ouvrage_id`),
  FOREIGN KEY (`user_fk`) REFERENCES `t_user`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*
-- Insertion des catégories
INSERT INTO t_categorie (nom) VALUES
('Thriller'),
('Fantasy'),
('Manga'),
('Développement personnel'),
('Science-fiction'),
('Aventure'),
('Policier'),
('Bande dessinée'),
('Drame'),
('Dystopie');

-- Insertion des utilisateurs
INSERT INTO t_user (pseudo, mdp, date_entre, admin) VALUES 
('AliceBiblio', 'hashed_password', '2022-06-15', 0),
('MaxLecteur', 'hashed_password', '2023-03-10', 1),
('ClaraBook', 'hashed_password', '2021-09-25', 0),
('LeoRoman', 'hashed_password', '2022-12-01', 0),
('EmmaPassion', 'hashed_password', '2023-07-07', 1),
('TomAventure', 'hashed_password', '2020-11-18', 0),
('NinaManga', 'hashed_password', '2021-04-21', 0),
('JulienPlume', 'hashed_password', '2022-08-30', 0),
('SophieEcrit', 'hashed_password', '2023-01-05', 1),
('LucasPages', 'hashed_password', '2021-11-12', 0);

-- Insertion des écrivains
INSERT INTO t_ecrivain (nom, prenom) VALUES 
('Martin', 'Jean'),
('Dubois', 'Sophie'),
('Lemoine', 'Alexandre'),
('Morel', 'Camille'),
('Girard', 'Lucas'),
('Rousseau', 'Emma'),
('Leclerc', 'Julien'),
('Bertrand', 'Marie'),
('Robin', 'Thomas'),
('Dupont', 'Laura');



-- Insertion des ouvrages
INSERT INTO t_ouvrage (titre, nb_pages, extrait, categorie_fk, resume, annee_edition, nom_editeur, user_fk, ecrivain_fk) VALUES 
('Les Ombres du Passé', 320, 'extrait_livre_1.pdf', 1, 'Un thriller captivant où un détective redécouvre son passé troublant.', '2018-04-10', 'Gallimard', 3, 5),
('La Quête des Cinq Royaumes', 420, 'extrait_livre_2.pdf', 2, 'Un jeune héros doit réunir les fragments d’une épée légendaire pour sauver son monde.', '2020-07-15', 'Bragelonne', 1, 8),
('Tokyo Nocturne', 250, 'extrait_livre_3.pdf', 3, 'Un récit émouvant sur un adolescent perdu dans les rues de Tokyo.', '2019-02-20', 'Kana', 7, 2),
('L’Art de Persuader', 180, 'extrait_livre_4.pdf', 4, 'Un guide fascinant sur les techniques de persuasion et leur impact.', '2015-09-25', 'Flammarion', 9, 4),
('Vers les Étoiles', 500, 'extrait_livre_5.pdf', 5, 'Un équipage d’astronautes découvre un secret menaçant l’humanité.', '2017-05-30', 'Pocket SF', 2, 6),
('L’Île Oubliée', 310, 'extrait_livre_6.pdf', 1, 'Une femme échouée sur une île mystérieuse doit découvrir la vérité sur son passé.', '2022-01-12', 'Actes Sud', 6, 9),
('Le Masque de l’Assassin', 280, 'extrait_livre_7.pdf', 2, 'Un inspecteur traque un tueur en série qui laisse des énigmes sur ses scènes de crime.', '2021-06-18', 'Albin Michel', 4, 3),
('Les Mémoires Perdues', 350, 'extrait_livre_8.pdf', 3, 'Une bande dessinée poignante sur un homme tentant de récupérer ses souvenirs.', '2016-03-05', 'Delcourt', 8, 1),
('Le Dernier Hiver', 270, 'extrait_livre_9.pdf', 3, 'Un roman bouleversant sur une catastrophe climatique imminente.', '2014-12-22', 'Seuil', 10, 7),
('CyberNexus', 400, 'extrait_livre_10.pdf', 1, 'Dans un futur dystopique, une intelligence artificielle menace l’humanité.', '2013-10-10', 'Denoël', 5, 10);

-- Insertion des évaluations
INSERT INTO evaluer (ouvrage_fk, user_fk, commentaire, note) VALUES 
(1, 3, 'Un roman captivant, impossible à lâcher !', 5),
(2, 1, 'Un peu cliché, mais agréable à lire.', 3),
(3, 7, 'L’histoire est immersive, j’ai adoré.', 4),
(4, 9, 'Un essai intéressant, mais un peu dense.', 4),
(5, 2, 'Un des meilleurs livres de science-fiction que j’ai lus.', 5),
(6, 6, 'Le suspense est génial, je recommande !', 5),
(7, 4, 'Un polar haletant, mais quelques longueurs.', 4),
(8, 8, 'Le dessin et l’histoire sont magnifiques.', 5),
(9, 10, 'Un sujet passionnant, mais un style un peu lourd.', 3),
(10, 5, 'Un must-read pour les amateurs de dystopie.', 5);
*/

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
