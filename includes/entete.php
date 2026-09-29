<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title><?= htmlspecialchars($titre) ?> - Mon classeur numérique</title>

    <link rel="stylesheet" href="style.css">
</head>

<body class="page-<?= htmlspecialchars($page) ?>">

<header class="bandeau">

    <div class="eclairs" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>

    <div class="bandeau-contenu">

        <h1>Mon classeur numérique</h1>

        <p>Mes ressources de SIN</p>

        <nav class="menu">

            <a href="index.php"
               <?= $page === 'accueil' ? 'aria-current="page"' : '' ?>>
                Accueil
            </a>

            <a href="cours.php"
               <?= $page === 'cours' ? 'aria-current="page"' : '' ?>>
                Cours
            </a>

            <a href="tp.php"
               <?= $page === 'tp' ? 'aria-current="page"' : '' ?>>
                TP
            </a>

            <a href="projets.php"
               <?= $page === 'projets' ? 'aria-current="page"' : '' ?>>
                Projets
            </a>

            <a href="documents.php"
               <?= $page === 'documents' ? 'aria-current="page"' : '' ?>>
                Révisions
            </a>

        </nav>

    </div>

</header>
