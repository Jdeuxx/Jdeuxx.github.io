# BARIL RUNNER

## JEAN-DANIEL AZOWA TSTI2D

## Thème de développement durable
Dans le jeu, on ramasse des barils jaunes pour protéger la planète.
Le joueur nettoie la ville en les récoltant.
La ville contient aussi des éléments écologiques : tramway, bus, éolienne, bacs de tri et bancs.

## Principe du jeu
Le joueur est un personnage qui court sans s'arrêter sur 3 voies (gauche, milieu, droite).
- Il ramasse les barils jaunes pour gagner des points et des pièces.
- Il évite les obstacles : il change de voie, saute ou glisse.
- Les véhicules verts, écologiques, sont des obstacles : on ne peut pas monter dessus, il faut les éviter.
- Il peut monter sur les bus pour ramasser plus de barils.
- Après un choc, un gorille lui fonce dessus.

Il y a 5 niveaux (Facile, Moyen, Difficile, Expert, Extrême) et un mode Infini sans fin.
Avec les pièces, on peut acheter des tenues et des améliorations dans la boutique.
Il y a aussi des missions, des bonus et 9 personnages à débloquer.

## Moteur choisi et justification
Le moteur choisi est Three.js. C'est une bibliothèque JavaScript qui permet de faire de la 3D directement dans le navigateur.
Le jeu fonctionne avec un simple lien, sans rien installer.
[Ajouter ici la vraie raison du choix si elle est différente.]

## Commandes
- Flèches gauche / droite (ou Q / D) : changer de voie
- Flèche haut (ou Z ou Espace) : sauter
- Flèche bas (ou S) : glisser sous les barrières
- M : couper ou remettre le son
- Sur téléphone : glisser le doigt

## Victoire / Défaite
- Victoire : atteindre le score demandé avant la fin du temps (niveaux 1 à 5).
- Défaite : n'avoir plus de vies, être attrapé par l'inspecteur ou manquer de temps.
- Mode Infini : il n'y a pas de victoire, le but est de battre son record.

## Répartition du travail
Projet réalisé seul(e) : idée, tests et choix du jeu.
L'IA Claude m'a aidé à écrire et à améliorer le code.

## Bug ou difficulté principale
Le jeu ne ressemblait pas à un vrai jeu de course comme Bus Rush.
Il était simple et peu vivant, et il fallait trouver comment le rendre aussi plaisant à jouer.

## Solution trouvée
Bus Rush a servi d'exemple. Des éléments ont été ajoutés pour se rapprocher d'un vrai jeu de course : des bus sur lesquels on peut monter, des bonus, un gorille, une boutique, des missions et plusieurs personnages.
Ces améliorations ont été faites avec l'aide de Claude.

## Amélioration après le test croisé
Des camarades ont testé mon jeu. Ils m'ont conseillé de ramasser et stocker les barils jaunes, pour que la planète soit sauvée.
Au départ, le jeu avait été fait avec des barils verts.
Le jeu a donc été modifié : on ramasse maintenant des barils jaunes pour sauver la planète.

## Sources des médias et ressources
- Idée de départ : le jeu Bus Rush
- Code écrit avec l'aide de Claude (IA)
- Three.js : https://threejs.org
- Sons et musique : créés par le navigateur, aucun fichier audio
