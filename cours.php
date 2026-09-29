<?php
$page  = 'cours';
$titre = 'Cours';

// Pour ajouter une séquence : copier un bloc et modifier les valeurs.
// La carte passe en "Disponible" dès que le PDF existe dans documents/cours/.
$sequences = [
  [
    'numero' => 'S01',
    'titre'  => 'De la grandeur physique à la donnée numérique',
    'texte'  => 'Capteurs, acquisition, valeurs analogiques et numériques, conversion et validation.',
    'tags'   => ['Capteurs', 'Arduino', 'Acquisition'],
    'pdf'    => 'documents/cours/cours-S01-acquerir-traiter-commander.pdf',
  ],
  [
    'numero' => 'S02',
    'titre'  => 'Communication et échange de données',
    'texte'  => "Cette séquence apparaîtra ici lorsqu'elle aura été commencée.",
    'tags'   => ['Réseau', 'Protocoles'],
    'pdf'    => 'documents/cours/cours-S02.pdf',
  ],
];

include 'includes/entete.php';
?>

  <main>
    <h2>Mes séquences</h2>
    <p>Les documents de cours sont classés par séquence.</p>

    <div class="sequences">
      <?php foreach ($sequences as $s):
        $dispo = is_file(__DIR__ . '/' . $s['pdf']); ?>
        <article class="sequence-carte<?= $dispo ? '' : ' sequence-avenir' ?>">
          <div class="sequence-entete">
            <span class="sequence-numero"><?= htmlspecialchars($s['numero']) ?></span>
            <?php if ($dispo): ?>
              <span class="badge badge-disponible">Disponible</span>
            <?php else: ?>
              <span class="badge badge-avenir">À venir</span>
            <?php endif; ?>
          </div>
          <h3><?= htmlspecialchars($s['titre']) ?></h3>
          <p><?= htmlspecialchars($s['texte']) ?></p>
          <div class="sequence-tags">
            <?php foreach ($s['tags'] as $tag): ?>
              <span class="tag"><?= htmlspecialchars($tag) ?></span>
            <?php endforeach; ?>
          </div>
          <?php if ($dispo): ?>
            <a class="sequence-lien" href="<?= htmlspecialchars($s['pdf']) ?>" target="_blank" rel="noopener">Ouvrir le cours</a>
          <?php else: ?>
            <span class="sequence-lien sequence-lien-desactive">Pas encore disponible</span>
          <?php endif; ?>
        </article>
      <?php endforeach; ?>
    </div>

    <p><a href="index.php">Revenir à l'accueil</a></p>
  </main>

<?php include 'includes/pied.php'; ?>
