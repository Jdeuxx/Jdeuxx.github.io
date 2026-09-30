<?php
$page = 'tp';
$titre = 'TP';
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TP - Mon classeur numérique</title>
    <link rel="stylesheet" href="style.css">
</head>

<body class="page-tp">

<header>
    <h1>Mon classeur numérique</h1>
    <p>Mes ressources de SIN</p>

    <nav>
        <a href="index.php">Accueil</a>
        <a href="cours.php">Cours</a>
        <a href="tp.php">TP</a>
        <a href="projets.php">Projets</a>
        <a href="documents.php">Révisions</a>
    </nav>
</header>

<main>
    <h2>🧪 TP — Aide au stationnement Grove</h2>

    <h3>A1 — Les éléments du système</h3>

    <ul>
        <li><strong>Acquisition :</strong> capteur de distance Grove</li>
        <li><strong>Traitement :</strong> Arduino Uno R3</li>
        <li><strong>Communication :</strong> LED Grove et buzzer Grove</li>
        <li><strong>Action du conducteur :</strong> bouton Grove</li>
    </ul>

    <h3>A2 — Chaîne d'information</h3>

    <p>
        <strong>ACQUÉRIR :</strong> capteur de distance Grove + bouton Grove
    </p>

    <p>
        <strong>TRAITER :</strong> Arduino Uno R3
    </p>

    <p>
        <strong>COMMUNIQUER :</strong> LED Grove + buzzer Grove
    </p>

    <h3>A3 — Nature des informations</h3>

    <ul>
        <li>Capteur de distance : valeur numérique de distance.</li>
        <li>Bouton : état logique / TOR.</li>
    </ul>

    <h3>B2 / B3 — Mesures</h3>

    <table>
        <tr>
            <th>Distance de référence</th>
            <th>Distance mesurée</th>
        </tr>
        <tr><td>50 cm</td><td>0</td></tr>
        <tr><td>40 cm</td><td>0</td></tr>
        <tr><td>30 cm</td><td>0</td></tr>
        <tr><td>20 cm</td><td>0</td></tr>
        <tr><td>15 cm</td><td>0</td></tr>
        <tr><td>10 cm</td><td>0</td></tr>
    </table>

    <p>
        Le capteur affichait 0 pour toutes les mesures. Il fallait vérifier
        le câblage, le port D7, la bibliothèque et le moniteur série.
    </p>

    <h3>C1 — Programme</h3>

    <pre><code>distance = ultrasonic.MeasureInCentimeters();

Serial.println(distance);

digitalWrite(LED, HIGH);</code></pre>

    <h3>C2 — Condition</h3>

    <pre><code>if (distance &lt;= 30)</code></pre>

    <p>
        Cela signifie : si la distance est inférieure ou égale à 30 cm,
        le bloc suivant est exécuté.
    </p>

    <h3>C3 — Exemples</h3>

    <ul>
        <li>45 cm → LED éteinte</li>
        <li>25 cm → LED allumée</li>
        <li>10 cm → LED allumée</li>
    </ul>

    <h3>D1 — Fonctionnement</h3>

    <ul>
        <li><strong>Distance ≤ 15 cm :</strong> LED ON + buzzer ON</li>
        <li><strong>Distance ≤ 30 cm :</strong> LED ON + buzzer OFF</li>
        <li><strong>Sinon :</strong> LED OFF + buzzer OFF</li>
    </ul>

    <p>
        <a href="index.php">← Retour à l'accueil</a>
    </p>
</main>

<footer>
    <p>Mon classeur numérique — Ressources de SIN</p>
</footer>

</body>
</html>
