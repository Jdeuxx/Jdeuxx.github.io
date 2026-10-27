# BARIL RUNNER 3D

Runner 3D à 3 voies (Three.js) : ramasse les barils jaunes, évite les obstacles, monte sur les bus, échappe à l'inspecteur et à son chien.

## Lancer
Ouvre `index.html` (ou active GitHub Pages : Settings > Pages > branche `main`, dossier `/root`).

## Modes
- **Niveaux 1 à 5 (Facile, Moyen, Difficile, Expert, Extrême)** : atteins le score avant la fin du temps. Plus le niveau monte, plus il y a d'obstacles, de vitesse et moins de vies.
- **Infini** : course sans fin, la vitesse augmente, bats ton record.

## Commandes
- ← → ou Q D : changer de voie
- ↑ / Z / Espace : sauter
- ↓ / S : glisser sous les barrières
- M : couper / remettre le son
- Mobile : glisser le doigt

## Gameplay
- **Rampes et rames de bus** : prends la rampe pour courir sur le toit et ramasser les barils.
- **Poursuivant** : après un choc, l'inspecteur et son chien arrivent derrière toi. Un 2e choc rapproché = attrapé (-2 vies).
- **Bonus** : 🧲 aimant, ×2 points, ⬆ super-saut, ❤ vie.
- **Décor écolo** : tramway qui dépasse, camion-poubelle (obstacle), bancs, bacs de tri, panneaux, éolienne et ville au loin.
- **Décors** : jour, coucher de soleil, nuit, tunnels et ponts.
- **Sons et musique** générés par le navigateur (aucun fichier audio).

## Progression (sauvegardée dans le navigateur)
- Les barils ramassés deviennent des 🪙 pièces.
- **Boutique** : tenues (Doré, Forêt, Néon, Feu), améliorations de bonus (niveau 3 max), +1 vie permanente.
- **Missions** : 3 missions actives, récompense en pièces + 📦 coffre.
- **Coffres** : pièces, tenues ou améliorations. Un coffre offert tous les 2000 points dans une partie.

## Personnages
9 personnages : Léo, Maya, Max, Momo (momie), Jet (jetpack), Zip (casque audio), Lina (garde forestière), Sam (chantier) et Noa (cycliste). Ils se débloquent avec ton meilleur score (1000, 2000, 3000, 4500, 6000, 7500, 9000, 10500). Le bouton ◀ ▶ PERSOS du menu change de page.

## Modèles 3D optionnels
Tous les personnages, obstacles, bus, rampes, barils, immeubles, arbres et lampadaires peuvent être remplacés par des fichiers `.glb` placés dans `modeles/`. Voir `modeles/LISEZMOI.md` pour les noms de fichiers, les tailles et les sources gratuites.
