<?php
$page = 'cours';
$titre = 'Cours';
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cours - Mon classeur numérique</title>
    <link rel="stylesheet" href="style.css">
</head>

<body class="page-cours">

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
    <h2>📘 Cours SIN</h2>

    <h3>Acquérir → Traiter → Communiquer / Commander</h3>

    <p>
        La chaîne d'information est la partie du système qui capte les données,
        les analyse et donne des ordres.
    </p>

    <h3>1. La chaîne d'information</h3>

    <ul>
        <li><strong>Acquérir :</strong> recevoir une information avec un capteur ou un bouton.</li>
        <li><strong>Traiter :</strong> analyser l'information avec un microcontrôleur.</li>
        <li><strong>Communiquer / Commander :</strong> transmettre une information ou commander un actionneur.</li>
    </ul>

    <p><strong>Exemple :</strong></p>

    <ul>
        <li>Capteur de distance → Acquérir</li>
        <li>Arduino Uno R3 → Traiter</li>
        <li>LED / buzzer → Communiquer</li>
    </ul>

    <h3>2. Les informations</h3>

    <ul>
        <li><strong>Valeur numérique :</strong> 27 cm, 21,4 °C, 612 lux...</li>
        <li><strong>État logique / TOR :</strong> appuyé / relâché, ouvert / fermé.</li>
    </ul>

    <p>
        TOR signifie <strong>Tout Ou Rien</strong>.
    </p>

    <h3>3. La condition IF</h3>

    <pre><code>if (distance &lt;= 30)
{
    digitalWrite(LED, HIGH);
}</code></pre>

    <p>
        <strong>if</strong> signifie « si ». Le programme exécute le bloc
        uniquement si la condition est vraie.
    </p>

    <h3>4. Plusieurs conditions</h3>

    <pre><code>if (distance &lt;= 15)
{
    // Danger
}
else if (distance &lt;= 30)
{
    // Zone intermédiaire
}
else
{
    // Zone éloignée
}</code></pre>

    <h3>5. Commander une sortie</h3>

    <ul>
        <li><code>digitalWrite(LED, HIGH);</code> → allumer la LED</li>
        <li><code>digitalWrite(LED, LOW);</code> → éteindre la LED</li>
        <li><code>tone(BUZZER, 1000);</code> → faire sonner le buzzer</li>
        <li><code>noTone(BUZZER);</code> → arrêter le buzzer</li>
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
