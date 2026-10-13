// ==================================================
// ECO-NETTOYEUR
// Jeu Phaser : 3 niveaux, scores, vies et chronomètre
// ==================================================

const LARGEUR = 1920;
const HAUTEUR = 1080;

const ZONE_LARGEUR = 760;
const ZONE_GAUCHE = (LARGEUR - ZONE_LARGEUR) / 2;
const ZONE_DROITE = ZONE_GAUCHE + ZONE_LARGEUR;

const config = {
    type: Phaser.AUTO,
    width: LARGEUR,
    height: HAUTEUR,
    backgroundColor: "#102333",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        create,
        update
    }
};

new Phaser.Game(config);

// ==================================================
// VARIABLES
// ==================================================

let player;
let cursors;
let objets = [];

let score = 0;
let vies = 3;
let tempsEcoule = 0;
let tempsLimite = 120;
let tempsApparition = 0;
let delaiApparition = 750;
let vitesse = 240;

let scoreVictoire = 2000;
let multiplicateur = 10;
let difficulte = "moyen";

let scoreTexte;
let viesTexte;
let tempsTexte;
let niveauTexte;
let multiTexte;
let message;
let bouton;
let titreJeu;
let reglesTexte;
let legendeTexte;
let objectifTexte;

let termine = false;
let jeuDemarre = false;
let scoreSauvegarde = false;

let arbres = [];
let arbresAffiches = [];
let elementsVictoire = [];
let boutonsMenu = [];

let historiqueScores = chargerHistorique();

// ==================================================
// HISTORIQUE DES SCORES
// ==================================================

function chargerHistorique() {
    try {
        const donnees = JSON.parse(
            localStorage.getItem("ecoScores") || "[]"
        );

        return Array.isArray(donnees) ? donnees.slice(0, 8) : [];
    } catch (erreur) {
        return [];
    }
}

function sauvegarderScore() {
    if (scoreSauvegarde) return;

    scoreSauvegarde = true;

    historiqueScores.unshift({
        score: score,
        niveau: difficulte,
        date: new Date().toLocaleString("fr-FR")
    });

    historiqueScores = historiqueScores.slice(0, 8);

    try {
        localStorage.setItem(
            "ecoScores",
            JSON.stringify(historiqueScores)
        );
    } catch (erreur) {
        console.warn("Impossible de sauvegarder les scores.");
    }
}

function afficherHistorique(scene) {
    const lignes = historiqueScores.length
        ? historiqueScores.map((partie, index) =>
            `${index + 1}. ${String(partie.niveau).toUpperCase()} — ` +
            `${partie.score} pts — ${partie.date}`
        )
        : ["Aucune partie jouée pour le moment."];

    const texte = scene.add.text(
        LARGEUR / 2,
        785,
        "HISTORIQUE DES SCORES\n\n" + lignes.join("\n"),
        {
            fontSize: "22px",
            color: "#e2e8f0",
            align: "center",
            lineSpacing: 5
        }
    ).setOrigin(0.5, 0);

    boutonsMenu.push(texte);
}

// ==================================================
// CRÉATION DU ROBOT
// ==================================================

function creerRobot(scene, x, y) {
    const robot = scene.add.container(x, y);

    robot.add(
        scene.add.line(0, -24, 0, 0, 0, -8, 0x1e4a6e)
            .setLineWidth(3)
    );

    robot.add(
        scene.add.circle(0, -24, 5, 0xff8c3a)
            .setStrokeStyle(2, 0x1e4a6e)
    );

    robot.add(
        scene.add.rectangle(0, -8, 34, 27, 0x2aa0e0)
            .setStrokeStyle(3, 0x1e4a6e)
    );

    robot.add(
        scene.add.rectangle(0, -9, 25, 14, 0x102333)
    );

    robot.add([
        scene.add.circle(-7, -9, 3, 0x7df9ff),
        scene.add.circle(7, -9, 3, 0x7df9ff)
    ]);

    robot.add(
        scene.add.rectangle(0, 18, 42, 28, 0x3ab0e0)
            .setStrokeStyle(3, 0x1e4a6e)
    );

    robot.add(
        scene.add.rectangle(0, 18, 18, 13, 0xffd700)
            .setStrokeStyle(2, 0xb8860b)
    );

    robot.add([
        scene.add.rectangle(-26, 16, 9, 24, 0x2aa0e0)
            .setStrokeStyle(2, 0x1e4a6e),
        scene.add.rectangle(26, 16, 9, 24, 0x2aa0e0)
            .setStrokeStyle(2, 0x1e4a6e),
        scene.add.circle(-26, 29, 5, 0xb0c4de)
            .setStrokeStyle(2, 0x1e4a6e),
        scene.add.circle(26, 29, 5, 0xb0c4de)
            .setStrokeStyle(2, 0x1e4a6e)
    ]);

    robot.add([
        scene.add.rectangle(-11, 39, 9, 17, 0x2aa0e0)
            .setStrokeStyle(2, 0x1e4a6e),
        scene.add.rectangle(11, 39, 9, 17, 0x2aa0e0)
            .setStrokeStyle(2, 0x1e4a6e),
        scene.add.rectangle(-12, 48, 16, 6, 0xb0c4de)
            .setStrokeStyle(2, 0x1e4a6e),
        scene.add.rectangle(12, 48, 16, 6, 0xb0c4de)
            .setStrokeStyle(2, 0x1e4a6e)
    ]);

    robot.setScale(1.35);

    return robot;
}

// ==================================================
// OBJETS À ÉVITER : POUBELLE RECYCLABLE
// ==================================================

function creerPoubelle(scene, x, y) {
    const poubelle = scene.add.container(x, y);

    poubelle.add([
        scene.add.rectangle(0, 3, 32, 39, 0x20c997)
            .setStrokeStyle(2, 0x0d6e5a),
        scene.add.rectangle(0, -19, 38, 7, 0x4dd4b0)
            .setStrokeStyle(2, 0x0d6e5a),
        scene.add.rectangle(-10, 3, 3, 28, 0xa8f0e0),
        scene.add.rectangle(10, 3, 3, 28, 0xa8f0e0)
    ]);

    poubelle.add(
        scene.add.text(0, 2, "♻", {
            fontSize: "18px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5)
    );

    poubelle.add([
        scene.add.circle(-10, 25, 4, 0x7a8a9a),
        scene.add.circle(10, 25, 4, 0x7a8a9a)
    ]);

    poubelle.setScale(1.35);

    return poubelle;
}

// ==================================================
// OBJETS À RAMASSER : BARIL TOXIQUE
// ==================================================

function creerBarilToxique(scene, x, y) {
    const baril = scene.add.container(x, y);

    baril.add(
        scene.add.rectangle(0, 1, 36, 39, 0xffb020)
            .setStrokeStyle(2, 0xb8860b)
    );

    baril.add([
        scene.add.ellipse(0, -19, 40, 12, 0xffd54a)
            .setStrokeStyle(2, 0xb8860b),
        scene.add.ellipse(0, 20, 34, 9, 0xe69500)
            .setStrokeStyle(2, 0xb8860b)
    ]);

    baril.add([
        scene.add.rectangle(0, -7, 34, 3, 0xb8860b),
        scene.add.rectangle(0, 10, 34, 3, 0xb8860b)
    ]);

    baril.add(
        scene.add.circle(0, 1, 12, 0x2c3e50)
            .setStrokeStyle(1, 0xb8860b)
    );

    baril.add(
        scene.add.text(0, 1, "☢", {
            fontSize: "24px",
            color: "#ffd700"
        }).setOrigin(0.5)
    );

    baril.setScale(1.35);

    return baril;
}

// ==================================================
// ARBRES
// ==================================================

function creerArbre(scene, x, y, taille = 1) {
    const arbre = scene.add.container(x, y);

    arbre.add(
        scene.add.rectangle(0, 0, 18, 65, 0xa0522d)
    );

    arbre.add([
        scene.add.circle(-15, -35, 25, 0x22c55e),
        scene.add.circle(15, -35, 25, 0x4ade80),
        scene.add.circle(0, -58, 28, 0x16a34a),
        scene.add.circle(0, -35, 18, 0x86efac)
    ]);

    arbre.setScale(taille);

    return arbre;
}

function actualiserNature(scene) {
    const paliers = [
        { part: 0.2, x: 120, y: 820, taille: 1.2 },
        { part: 0.4, x: 260, y: 825, taille: 1.5 },
        { part: 0.6, x: 1660, y: 820, taille: 1.3 },
        { part: 0.8, x: 1800, y: 825, taille: 1.6 }
    ];

    for (const info of paliers) {
        if (
            score >= info.part * scoreVictoire &&
            !arbresAffiches.includes(info.part)
        ) {
            const arbre = creerArbre(
                scene, info.x, info.y, info.taille
            );

            arbre.setDepth(2);
            arbres.push(arbre);
            arbresAffiches.push(info.part);
        }
    }
}

// ==================================================
// MENU DE SÉLECTION
// ==================================================

function afficherMenu(scene) {
    const titre = scene.add.text(
        LARGEUR / 2, 125,
        "ECO-NETTOYEUR",
        {
            fontSize: "76px",
            color: "#4ade80",
            fontStyle: "bold"
        }
    ).setOrigin(0.5);

    boutonsMenu.push(titre);

    const sousTitre = scene.add.text(
        LARGEUR / 2, 220,
        "Sauve la nature ! Choisis ton niveau.",
        {
            fontSize: "34px",
            color: "#ffffff"
        }
    ).setOrigin(0.5);

    boutonsMenu.push(sousTitre);

    const niveaux = [
        {
            nom: "FACILE ×5",
            detail: "Objectif : 1 000 points | 5 vies | 180 secondes",
            cle: "facile",
            multi: 5,
            y: 325,
            couleur: "#16864b"
        },
        {
            nom: "MOYEN ×10",
            detail: "Objectif : 2 000 points | 3 vies | 120 secondes",
            cle: "moyen",
            multi: 10,
            y: 465,
            couleur: "#b77908"
        },
        {
            nom: "DIFFICILE ×20",
            detail: "Objectif : 3 000 points | 2 vies | 90 secondes",
            cle: "difficile",
            multi: 20,
            y: 605,
            couleur: "#c53030"
        }
    ];

    niveaux.forEach(niv => {
        const btn = scene.add.text(
            LARGEUR / 2, niv.y,
            niv.nom + "\n" + niv.detail,
            {
                fontSize: "31px",
                color: "#ffffff",
                align: "center",
                backgroundColor: niv.couleur,
                padding: { x: 35, y: 16 }
            }
        ).setOrigin(0.5).setInteractive({
            useHandCursor: true
        });

        btn.on("pointerover", () => btn.setAlpha(0.8));
        btn.on("pointerout", () => btn.setAlpha(1));

        btn.on("pointerdown", () => {
            demarrerJeu(scene, niv.cle, niv.multi);
        });

        boutonsMenu.push(btn);
    });

    afficherHistorique(scene);
}

// ==================================================
// DÉMARRAGE D'UNE PARTIE
// ==================================================

function demarrerJeu(scene, niveau, multi) {
    difficulte = niveau;
    multiplicateur = multi;

    score = 0;
    tempsEcoule = 0;
    tempsApparition = 0;
    termine = false;
    jeuDemarre = true;
    scoreSauvegarde = false;

    objets.forEach(objet => objet.forme.destroy());
    objets = [];

    arbres.forEach(arbre => arbre.destroy());
    arbres = [];
    arbresAffiches = [];

    if (niveau === "facile") {
        delaiApparition = 1100;
        vitesse = 160;
        scoreVictoire = 1000;
        tempsLimite = 180;
        vies = 5;
    } else if (niveau === "moyen") {
        delaiApparition = 750;
        vitesse = 240;
        scoreVictoire = 2000;
        tempsLimite = 120;
        vies = 3;
    } else {
        delaiApparition = 450;
        vitesse = 360;
        scoreVictoire = 3000;
        tempsLimite = 90;
        vies = 2;
    }

    boutonsMenu.forEach(element => element.setVisible(false));

    player.setPosition(LARGEUR / 2, 820);
    player.setVisible(true);

    scoreTexte.setVisible(true);
    viesTexte.setVisible(true);
    tempsTexte.setVisible(true);
    niveauTexte.setVisible(true);
    multiTexte.setVisible(true);
    objectifTexte.setVisible(true);
    titreJeu.setVisible(true);
    reglesTexte.setVisible(true);
    legendeTexte.setVisible(true);

    scoreTexte.setText(
        "POINTS : 0 / " + scoreVictoire
    );

    viesTexte.setText("VIES : " + vies);

    tempsTexte.setText(
        "TEMPS : 0 / " + tempsLimite + " s"
    );

    niveauTexte.setText(
        "NIVEAU : " + niveau.toUpperCase()
    );

    multiTexte.setText("MULTIPLICATEUR : ×" + multi);

    objectifTexte.setText(
        "OBJECTIF : " + scoreVictoire + " pts"
    );

    message.setVisible(false);
    bouton.setVisible(false);
}

// ==================================================
// CRÉATION DE LA SCÈNE
// ==================================================

function create() {
    const scene = this;

    objets = [];
    arbres = [];
    arbresAffiches = [];
    elementsVictoire = [];
    boutonsMenu = [];

    score = 0;
    vies = 3;
    tempsEcoule = 0;
    tempsApparition = 0;
    termine = false;
    jeuDemarre = false;
    scoreSauvegarde = false;

    // Fond lumineux
    scene.add.rectangle(
        LARGEUR / 2, HAUTEUR / 2,
        LARGEUR, HAUTEUR, 0x183c50
    );

    // Zone centrale
    scene.add.rectangle(
        LARGEUR / 2, HAUTEUR / 2,
        ZONE_LARGEUR, HAUTEUR,
        0x326987, 0.65
    );

    // Bordures vertes
    scene.add.rectangle(
        ZONE_GAUCHE, HAUTEUR / 2,
        5, HAUTEUR, 0x4ade80
    ).setAlpha(0.9);

    scene.add.rectangle(
        ZONE_DROITE, HAUTEUR / 2,
        5, HAUTEUR, 0x4ade80
    ).setAlpha(0.9);

    // Sol
    scene.add.rectangle(
        LARGEUR / 2, 900,
        LARGEUR, 50, 0x2d6a4f
    );

    scene.add.rectangle(
        LARGEUR / 2, 875,
        LARGEUR, 4, 0x4ade80
    ).setAlpha(0.8);

    // Robot
    player = creerRobot(
        scene, LARGEUR / 2, 820
    ).setVisible(false);

    cursors = scene.input.keyboard.createCursorKeys();

    // Interface à gauche
    scoreTexte = scene.add.text(
        35, 30, "POINTS : 0",
        {
            fontSize: "38px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    ).setVisible(false);

    viesTexte = scene.add.text(
        35, 90, "VIES : 3",
        {
            fontSize: "34px",
            color: "#ffb4b4",
            fontStyle: "bold"
        }
    ).setVisible(false);

    tempsTexte = scene.add.text(
        35, 145, "TEMPS : 0 s",
        {
            fontSize: "31px",
            color: "#ffd700",
            fontStyle: "bold"
        }
    ).setVisible(false);

    niveauTexte = scene.add.text(
        35, 200, "NIVEAU : MOYEN",
        {
            fontSize: "28px",
            color: "#4ade80",
            fontStyle: "bold"
        }
    ).setVisible(false);

    multiTexte = scene.add.text(
        35, 250, "MULTIPLICATEUR : ×10",
        {
            fontSize: "25px",
            color: "#ffd700",
            fontStyle: "bold"
        }
    ).setVisible(false);

    objectifTexte = scene.add.text(
        35, 300, "OBJECTIF : 2000 pts",
        {
            fontSize: "25px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    ).setVisible(false);

    // Interface en haut
    titreJeu = scene.add.text(
        LARGEUR / 2, 20, "ECO-NETTOYEUR",
        {
            fontSize: "38px",
            color: "#4ade80",
            fontStyle: "bold"
        }
    ).setOrigin(0.5, 0).setVisible(false);

    reglesTexte = scene.add.text(
        LARGEUR / 2, 75,
        "Flèches : bouger | Baril ☢ : gagner des points | Poubelle ♻ : perdre une vie",
        {
            fontSize: "20px",
            color: "#ffffff"
        }
    ).setOrigin(0.5, 0).setVisible(false);

    legendeTexte = scene.add.text(
        LARGEUR - 30, 30,
        "☢ RAMASSER\n♻ ÉVITER",
        {
            fontSize: "24px",
            color: "#4ade80",
            align: "right",
            fontStyle: "bold"
        }
    ).setOrigin(1, 0).setVisible(false);

    // Message de fin
    message = scene.add.text(
        LARGEUR / 2, 430, "",
        {
            fontSize: "48px",
            color: "#4ade80",
            align: "center",
            fontStyle: "bold",
            backgroundColor: "#102333",
            padding: { x: 24, y: 20 },
            lineSpacing: 12
        }
    ).setOrigin(0.5).setDepth(30).setVisible(false);

    // Bouton de redémarrage
    bouton = scene.add.text(
        LARGEUR / 2, 650, "RECOMMENCER",
        {
            fontSize: "34px",
            color: "#ffffff",
            backgroundColor: "#16864b",
            padding: { x: 35, y: 18 }
        }
    ).setOrigin(0.5).setDepth(31).setVisible(false);

    bouton.setInteractive({ useHandCursor: true });

    bouton.on("pointerover", () => bouton.setAlpha(0.8));
    bouton.on("pointerout", () => bouton.setAlpha(1));

    bouton.on("pointerdown", () => {
        scene.scene.restart();
    });

    afficherMenu(scene);
}

// ==================================================
// CRÉATION DES OBJETS QUI TOMBENT
// ==================================================

function creerObjet(scene) {
    const x = Phaser.Math.Between(
        ZONE_GAUCHE + 40,
        ZONE_DROITE - 40
    );

    // 30 % de barils toxiques, 70 % de poubelles
    const danger = Math.random() < 0.30;

    const forme = danger
        ? creerBarilToxique(scene, x, -50)
        : creerPoubelle(scene, x, -50);

    objets.push({
        forme: forme,
        danger: danger
    });
}

// ==================================================
// FIN DE PARTIE
// ==================================================

function finPartie(titre, sousTitre) {
    if (termine) return;

    termine = true;
    jeuDemarre = false;

    sauvegarderScore();

    message.setText(
        titre + "\n\n" +
        sousTitre +
        "\n\nSCORE FINAL : " + score + " POINTS"
    );

    message.setColor(
        titre.includes("VICTOIRE")
            ? "#86efac"
            : "#ff8a8a"
    );

    message.setVisible(true);
    bouton.setText("RECOMMENCER");
    bouton.setVisible(true);

    // Arrêter les objets restants
    objets.forEach(objet => objet.forme.destroy());
    objets = [];
}

// ==================================================
// ÉCRAN DE VICTOIRE
// ==================================================

function afficherForetVictoire(scene) {
    if (termine) return;

    termine = true;
    jeuDemarre = false;

    sauvegarderScore();

    const fond = scene.add.rectangle(
        LARGEUR / 2, HAUTEUR / 2,
        LARGEUR, HAUTEUR,
        0x071f18, 0.96
    ).setDepth(20);

    elementsVictoire.push(fond);

    for (let i = 0; i < 22; i++) {
        const x = 30 + i * 88;
        const y = Phaser.Math.Between(760, 850);
        const taille = Phaser.Math.FloatBetween(1.2, 2.1);

        const arbre = creerArbre(
            scene, x, y, taille
        );

        arbre.setDepth(21);
        elementsVictoire.push(arbre);
    }

    const herbe = scene.add.rectangle(
        LARGEUR / 2, 1000,
        LARGEUR, 160, 0x166534
    ).setDepth(22);

    elementsVictoire.push(herbe);

    const sousTitre = scene.add.text(
        LARGEUR / 2, 700,
        "Moins de pollution, plus de vie !",
        {
            fontSize: "30px",
            color: "#bbf7d0",
            fontStyle: "bold"
        }
    ).setOrigin(0.5).setDepth(30);

    elementsVictoire.push(sousTitre);

    message.setText(
        "VICTOIRE !\nLA NATURE EST SAUVÉE !\n\n" +
        "SCORE FINAL : " + score + " POINTS"
    );

    message.setColor("#86efac");
    message.setFontSize(48);
    message.setDepth(30);
    message.setY(420);
    message.setVisible(true);

    bouton.setDepth(31);
    bouton.setY(600);
    bouton.setVisible(true);
}

// ==================================================
// BOUCLE PRINCIPALE
// ==================================================

function update(time, delta) {
    if (!jeuDemarre || termine) return;

    // Chronomètre
    tempsEcoule += delta / 1000;

    const secondes = Math.floor(tempsEcoule);

    tempsTexte.setText(
        "TEMPS : " + secondes + " / " + tempsLimite + " s"
    );

    if (tempsEcoule >= tempsLimite) {
        finPartie(
            "TEMPS ÉCOULÉ !",
            "Le temps est terminé."
        );
        return;
    }

    // Déplacement du robot
    const deplacement = 600 * delta / 1000;

    if (cursors.left.isDown) player.x -= deplacement;
    if (cursors.right.isDown) player.x += deplacement;
    if (cursors.up.isDown) player.y -= deplacement;
    if (cursors.down.isDown) player.y += deplacement;

    // Limites de la zone centrale
    player.x = Phaser.Math.Clamp(
        player.x,
        ZONE_GAUCHE + 45,
        ZONE_DROITE - 45
    );

    player.y = Phaser.Math.Clamp(
        player.y, 160, 810
    );

    // Apparition des objets
    tempsApparition += delta;

    if (tempsApparition >= delaiApparition) {
        tempsApparition = 0;
        creerObjet(this);
    }

    // Difficulté progressive
    if (difficulte === "facile") {
        delaiApparition = Math.max(
            450, 1100 - score * 0.1
        );

        vitesse = Math.min(
            380, 160 + score * 0.08
        );
    } else if (difficulte === "moyen") {
        delaiApparition = Math.max(
            250, 750 - score * 0.05
        );

        vitesse = Math.min(
            520, 240 + score * 0.06
        );
    } else {
        delaiApparition = Math.max(
            160, 450 - score * 0.03
        );

        vitesse = Math.min(
            680, 360 + score * 0.06
        );
    }

    // Déplacement et collisions
    for (let i = objets.length - 1; i >= 0; i--) {
        const objet = objets[i];

        objet.forme.y += vitesse * delta / 1000;

        const collision =
            Phaser.Geom.Intersects.RectangleToRectangle(
                player.getBounds(),
                objet.forme.getBounds()
            );

        if (collision) {
            if (objet.danger) {
                // Baril toxique : gagner des points
                const pointsGagnes = 10 * multiplicateur;

                score += pointsGagnes;

                scoreTexte.setText(
                    "POINTS : " + score +
                    " / " + scoreVictoire
                );

                multiTexte.setText(
                    "+" + pointsGagnes +
                    " pts  (×" + multiplicateur + ")"
                );

                objectifTexte.setText(
                    "OBJECTIF : " + scoreVictoire +
                    " pts — " +
                    Math.min(
                        100,
                        Math.floor(score / scoreVictoire * 100)
                    ) + "%"
                );

                actualiserNature(this);
            } else {
                // Poubelle : perdre une vie
                vies--;

                viesTexte.setText("VIES : " + vies);
            }

            objet.forme.destroy();
            objets.splice(i, 1);

            // Défaite
            if (vies <= 0) {
                finPartie(
                    "GAME OVER",
                    "Tu n'as plus de vies !"
                );
                return;
            }

            // Victoire
            if (score >= scoreVictoire) {
                afficherForetVictoire(this);
                return;
            }
        } else if (objet.forme.y > HAUTEUR + 100) {
            objet.forme.destroy();
            objets.splice(i, 1);
        }
    }
}
