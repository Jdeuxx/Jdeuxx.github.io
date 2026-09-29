<?php
$page  = 'tp';
$titre = 'TP';

// Pour ajouter un TP : copier un bloc et modifier les valeurs.
// 'termine' et 'note' peuvent être laissés à null tant que le TP n'est pas fini.
$tps = [
  [
    'titre'   => 'TP Test',
    'ouvert'  => '07/09/2026',
    'termine' => '08/09/2026',
    'note'    => 6,
    'pdf'     => 'documents/tp/tp-S01-aide-stationnement-corrige.pdf',
  ],
];

include 'includes/entete.php';
?>

  <main>
    <h2>Mes travaux pratiques</h2>
    <p>Je conserve ici mes sujets, résultats et comptes rendus.</p>

    <div class="tp-liste">
      <?php foreach ($tps as $tp):
        $fini = !empty($tp['termine']); ?>
        <article class="tp-carte">
          <div class="tp-entete">
            <h3><?= htmlspecialchars($tp['titre']) ?></h3>
            <?php if ($fini): ?>
              <span class="badge badge-disponible">Terminé</span>
            <?php else: ?>
              <span class="badge badge-avenir">En cours</span>
            <?php endif; ?>
          </div>

          <p class="tp-dates">
            Ouvert le <?= htmlspecialchars($tp['ouvert']) ?>
            <?php if ($fini): ?> · terminé le <?= htmlspecialchars($tp['termine']) ?><?php endif; ?>
          </p>

          <?php if ($tp['note'] !== null): ?>
            <p class="tp-note">Note : <strong><?= htmlspecialchars($tp['note']) ?> / 20</strong></p>
          <?php endif; ?>

          <?php if (is_file(__DIR__ . '/' . $tp['pdf'])): ?>
            <a class="sequence-lien" href="<?= htmlspecialchars($tp['pdf']) ?>" target="_blank" rel="noopener">
              <?= $fini ? 'Ouvrir le TP corrigé' : 'Ouvrir le sujet' ?>
            </a>
          <?php else: ?>
            <span class="sequence-lien sequence-lien-desactive">Document non disponible</span>
          <?php endif; ?>
        </article>
      <?php endforeach; ?>
    </div>

    <p><a href="index.php">Revenir à l'accueil</a></p>
  </main>

<?php include 'includes/pied.php'; ?>
