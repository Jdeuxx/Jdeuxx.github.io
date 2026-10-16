
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#040a12">
  <meta name="description" content="ECO-NETTOYEUR : un jeu écologique où tu nettoies la planète.">

  <title>ECO-NETTOYEUR</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --vert: #4ade80;
      --bleu: #38bdf8;
      --fond: #040a12;
      --panneau: rgba(8, 20, 32, .92);
      --bordure: rgba(148, 197, 230, .28);
      --texte: #e6f3ff;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      width: 100%;
      min-height: 100%;
      background: var(--fond);
      color: var(--texte);
      font-family: 'Rajdhani', sans-serif;
    }

    body {
      overflow: hidden;
    }

    button {
      font: inherit;
    }

    #jeu {
      position: fixed;
      inset: 0;
      overflow: hidden;
      background: var(--fond);
    }

    #jeu canvas {
      display: block;
      max-width: 100%;
    }

    .cache {
      display: none !important;
    }

    h1,
    h2,
    b,
    .gros,
    .sec {
      font-family: 'Orbitron', sans-serif;
    }

    .titre {
      margin: 0;
      font-weight: 900;
      line-height: .95;
      letter-spacing: .04em;
      text-shadow: 0 0 28px rgba(56, 189, 248, .45);
    }

    .titre b {
      display: block;
      color: var(--vert);
    }

    small {
      display: block;
      color: #93b4cc;
      letter-spacing: .12em;
      text-transform: uppercase;
      font-size: 13px;
    }

    em {
      display: block;
      color: #93b4cc;
      font-size: 14px;
      font-style: normal;
    }

    .pan {
      padding: 10px 16px;
      background: var(--panneau);
      border: 1px solid var(--bordure);
      border-radius: 6px;
      backdrop-filter: blur(4px);
    }

    .ligne {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin: 4px 0;
      font-size: 15px;
    }

    .barre {
      height: 6px;
      overflow: hidden;
      background: rgba(255, 255, 255, .12);
      border-radius: 3px;
    }

    .barre i {
      display: block;
      width: 0;
      height: 100%;
      background: var(--vert);
      transition: width .3s;
    }

    button {
      color: inherit;
      cursor: pointer;
    }

    .gros {
      padding: 16px;
      color: #04201a;
      background: #7dfbd2;
      border: 0;
      border-radius: 4px;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: .3em;
    }

    .sec {
      padding: 16px;
      background: var(--panneau);
      border: 1px solid var(--bordure);
      border-radius: 4px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: .15em;
    }

    #chargement {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background: var(--fond);
      text-align: center;
      transition: opacity .5s;
    }

    #chargement .titre {
      font-size: clamp(40px, 7vw, 80px);
    }

    #chargement small {
      color: var(--bleu);
      font-size: 15px;
      letter-spacing: .25em;
    }

    .charge {
      width: 240px;
      height: 4px;
      overflow: hidden;
      background: rgba(255, 255, 255, .12);
    }

    .charge i {
      display: block;
      width: 100%;
      height: 100%;
      background: var(--bleu);
      animation: rempli 1.6s linear;
    }

    @keyframes rempli {
      from { width: 0; }
      to { width: 100%; }
    }

    #menu {
      position: fixed;
      inset: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      padding: 0 7vw;
      background: linear-gradient(
        90deg,
        rgba(4, 10, 18, .93),
        rgba(4, 10, 18, .45) 55%,
        transparent
      );
    }

    .col {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: min(520px, 92vw);
    }

    .col .titre {
      margin-bottom: 6px;
      font-size: clamp(32px, 4.2vw, 64px);
    }

    .niv {
      display: flex;
      gap: 8px;
    }

    .niv button {
      flex: 1;
      padding: 10px 4px;
      background: var(--panneau);
      border: 1px solid var(--bordure);
      border-radius: 4px;
      font-family: 'Orbitron', sans-serif;
      font-size: 13px;
      font-weight: 700;
    }

    .niv small {
      margin-top: 4px;
      font-family: 'Rajdhani', sans-serif;
      font-size: 11px;
      letter-spacing: .02em;
    }

    .niv .actif {
      background: rgba(74, 222, 128, .2);
      border-color: var(--vert);
    }

    .g2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .g2 .pan {
      text-align: left;
      font-size: 17px;
    }

    #panneau {
      white-space: pre-line;
      font-size: 17px;
    }

    a {
      color: var(--bleu);
      cursor: pointer;
      font-family: 'Orbitron', sans-serif;
      font-size: 13px;
      letter-spacing: .1em;
    }

    #hud .haut {
      position: fixed;
      top: 14px;
      right: 0;
      left: 0;
      z-index: 8;
      display: flex;
      justify-content: center;
      gap: 14px;
      pointer-events: none;
    }

    .haut .pan {
      min-width: 140px;
      text-align: center;
    }

    .haut b {
      font-size: 30px;
    }

    .haut .centre b {
      font-size: 38px;
    }

    .rouge {
      color: #f87171;
      letter-spacing: .2em;
    }

    .bas-g {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 8;
      width: 300px;
    }

    .bas-d {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 8;
      text-align: right;
    }

    .bas-d b {
      color: #ffd54a;
      font-size: 48px;
    }

    #fin {
      position: fixed;
      inset: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(4, 10, 18, .75);
    }

    .boite {
      width: min(540px, 92vw);
      padding: 30px;
      text-align: center;
    }

    .boite h2 {
      font-size: clamp(26px, 3.4vw, 44px);
    }

    .boite p {
      margin: 10px 0;
      font-size: 20px;
    }

    .rang {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }

    .rang button {
      flex: 1;
      font-size: 14px;
      letter-spacing: .1em;
    }

    .ok { color: var(--vert); }
    .ko { color: #f87171; }

    @media (max-width: 650px) {
      #menu {
        padding: 16px;
        overflow-y: auto;
        background: rgba(4, 10, 18, .86);
      }

      .col {
        width: 100%;
        gap: 8px;
      }

      .col .titre {
        font-size: clamp(28px, 9vw, 44px);
      }

      .pan {
        padding: 8px 10px;
      }

      .niv {
        gap: 4px;
      }

      .niv button {
        font-size: 10px;
      }

      .niv small {
        font-size: 9px;
      }

      .gros {
        padding: 12px;
        font-size: 17px;
      }

      #hud .haut {
        top: 5px;
        gap: 4px;
      }

      .haut .pan {
        min-width: 0;
        padding: 6px 9px;
      }

      .haut b,
      .haut .centre b {
        font-size: 20px;
      }

      .bas-g {
        bottom: 8px;
        left: 8px;
        width: 45%;
      }

      .bas-d {
        right: 8px;
        bottom: 8px;
      }

      .bas-d b {
        font-size: 32px;
      }

      .rang {
        flex-direction: column;
      }
    }
  </style>
</head>

<body>
  <div id="jeu"></div>

  <div id="chargement">
    <h1 class="titre">ECO<b>NETTOYEUR</b></h1>
    <small>Chargement de la zone...</small>
    <div class="charge"><i></i></div>
  </div>

  <div id="menu">
    <div class="col">
      <h1 class="titre">ECO<b>NETTOYEUR</b></h1>

      <div class="pan">
        <b>Joueur</b>
        <small style="display:inline;margin-left:8px">
          Invité · éco-robot
        </small>
        <div class="ligne">
          <span id="niveauJ">Niveau 1</span>
          <span id="xpJ">0 / 400 XP</span>
        </div>
        <div class="barre"><i id="xpBarre"></i></div>
      </div>

      <button id="jouer" class="gros">JOUER</button>

      <div class="niv">
        <button data-niv="facile">
          FACILE
          <small>×5 · 1000 pts</small>
        </button>
        <button data-niv="moyen" class="actif">
          MOYEN
          <small>×10 · 2000 pts</small>
        </button>
        <button data-niv="difficile">
          DIFFICILE
          <small>×20 · 3000 pts</small>
        </button>
      </div>

      <div class="g2">
        <button id="cRecords" class="pan">
          <b>Carrière</b>
          <small>Scores des parties</small>
        </button>
        <button id="cCommandes" class="pan">
          <b>Commandes</b>
          <small>Comment jouer</small>
        </button>
      </div>

      <div id="panneau" class="pan cache"></div>

      <div><a id="plein">PLEIN ÉCRAN</a></div>
    </div>
  </div>

  <div id="hud" class="cache">
    <div class="haut">
      <div class="pan">
        <small>Score</small>
        <b id="hScore">0</b>
        <em id="hBut"></em>
      </div>

      <div class="pan centre">
        <b id="hTemps">0:00</b>
        <small id="hNiveau"></small>
      </div>

      <div class="pan">
        <small>Vies</small>
        <b id="hVies" class="rouge"></b>
      </div>
    </div>

    <div class="pan bas-g">
      <small>Eco-bot · Nettoyeur</small>
      <div class="ligne">
        <span>PLANÈTE SAUVÉE</span>
        <span id="hPct">0%</span>
      </div>
      <div class="barre"><i id="hPlanete"></i></div>
    </div>

    <div class="pan bas-d">
      <small>Barils nettoyés</small>
      <b id="hBarils">0</b>
      <em id="hBarilsMax"></em>
    </div>
  </div>

  <div id="fin" class="cache">
    <div class="pan boite">
      <h2 id="fTitre" class="titre"></h2>
      <p id="fScore"></p>
      <p id="fMsg"></p>
      <div class="rang">
        <button id="rejouer" class="gros">REJOUER</button>
        <button id="versMenu" class="sec">MENU</button>
      </div>
    </div>
  </div>

  <!-- Phaser doit être chargé avant game.js -->
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>

  <!-- Ton fichier de jeu -->
  <script src="./game.js"></script>

  <script>
    // Masque l'écran de chargement une fois la page chargée.
    window.addEventListener('load', function () {
      const chargement = document.getElementById('chargement');

      setTimeout(function () {
        chargement.style.opacity = '0';

        setTimeout(function () {
          chargement.classList.add('cache');
        }, 500);
      }, 500);
    });

    // Plein écran
    document.getElementById('plein').addEventListener('click', function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(function () {});
      } else {
        document.exitFullscreen?.();
      }
    });
  </script>
</body>
</html>
