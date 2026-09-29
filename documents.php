<?php
$page  = 'documents';
$titre = 'Révisions';

// Liste automatiquement les PDF déposés dans documents/revisions/
$dossier  = 'documents/revisions';
$fichiers = glob(__DIR__ . '/' . $dossier . '/*.pdf') ?: [];
sort($fichiers);

include 'includes/entete.php';
?>

  <main>
    <h2>Révisions</h2>
    <?php if (!$fichiers): ?>
      <p>Aucun document pour le moment.</p>
    <?php else: ?>
      <ul>
        <?php foreach ($fichiers as $f): $nom = basename($f); ?>
          <li><a href="<?= $dossier ?>/<?= rawurlencode($nom) ?>" target="_blank" rel="noopener"><?= htmlspecialchars($nom) ?></a></li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
    <p><a href="index.php">Revenir à l'accueil</a></p>
  </main>

<?php include 'includes/pied.php'; ?>
