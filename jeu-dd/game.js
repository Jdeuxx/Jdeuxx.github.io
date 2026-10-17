// ECO-NETTOYEUR : runner à 3 voies (inspiré de Bus Rush)
// ☢ Barils toxiques = à ramasser  |  Déchets verts (poubelle, sac, branche) = à éviter
const L = 1920, H = 1080, HZ = 300, PY = 860, LW = 330; // horizon, ligne du joueur, largeur d'une voie

const NIVEAUX = {
  facile:    { multi: 5,  but: 1000, temps: 180, vies: 5, spawn: 1100, v: 0.45, blocs: [1, 1] },
  moyen:     { multi: 10, but: 2000, temps: 120, vies: 3, spawn: 850,  v: 0.6,  blocs: [1, 2] },
  difficile: { multi: 20, but: 3000, temps: 90,  vies: 2, spawn: 650,  v: 0.8,  blocs: [2, 2] }
};

// Personnages : débloqués selon ton MEILLEUR score
const PERSOS = {
  simple: { nom: "Léo",  seuil: 0,    bonus: 0, peau: 0xf2b38c, cheveux: 0xe8552b, haut: 0xffffff, raie: 0xef4444, bas: 0x7c3aed, chaus: 0x2563eb, acc: "casque" },
  moyen:  { nom: "Maya", seuil: 1000, bonus: 1, peau: 0xd49a73, cheveux: 0x2b1b12, haut: 0xf97316, raie: 0xfde047, bas: 0x1e3a8a, chaus: 0xffffff, acc: "casquette" },
  expert: { nom: "Max",  seuil: 2000, bonus: 2, peau: 0x8d5a3b, cheveux: 0x111827, haut: 0x1e293b, raie: 0x22d3ee, bas: 0x0f172a, chaus: 0x22d3ee, acc: "sac" }
};

const $ = id => document.getElementById(id);
let sc, robot, ombre, rayG, cur, keys;
let objets = [], enCours = false, niv = "moyen", perso = "simple", cfg = NIVEAUX.moyen;
let score = 0, vies = 0, viesMax = 0, barils = 0, tEcoule = 0, tSpawn = 0, tDeco = 0, dernier = -1;
let lane = 1, saut = -1, defil = 0, trail = 0, trailLane = 1;

new Phaser.Game({
  type: Phaser.AUTO, width: L, height: H, parent: "jeu", backgroundColor: "#7cc8ff",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: { create: create, update: update }
});

// ---------- Dessins ----------
const R = (s, x, y, w, h, c, b) => { const o = s.add.rectangle(x, y, w, h, c); if (b) o.setStrokeStyle(2, b); return o; };
const C = (s, x, y, r, c) => s.add.circle(x, y, r, c);

function creerPerso(s, x, y, p) { // personnage vu de dos, comme dans un runner
  const c = s.add.container(x, y), o = 0x1f2937;
  const jambe = dx => { const g = s.add.container(dx, 38); g.add([R(s, 0, 0, 13, 28, p.bas), R(s, 0, 16, 16, 8, p.chaus)]); return g; };
  const bras = dx => { const g = s.add.container(dx, 4); g.add([R(s, 0, 0, 11, 32, p.haut), C(s, 0, 18, 6, p.peau)]); return g; };
  const jl = jambe(-9), jr = jambe(9), bl = bras(-24), br = bras(24);
  c.add([jl, jr, R(s, 0, 2, 36, 42, p.haut, o), R(s, 0, 10, 36, 6, p.raie), bl, br, R(s, 0, -22, 10, 8, p.peau)]);
  if (p.acc === "sac") c.add([R(s, 0, 4, 38, 44, 0x374151, o), R(s, -11, 4, 10, 38, 0x22c55e), R(s, 11, 4, 10, 38, 0x22c55e), C(s, -11, 28, 5, 0xfacc15), C(s, 11, 28, 5, 0xfacc15)]);
  c.add([C(s, -18, -38, 4, p.peau), C(s, 18, -38, 4, p.peau), C(s, 0, -40, 18, p.cheveux)]);
  if (p.acc === "casque") c.add([C(s, -10, -56, 7, p.cheveux), C(s, 3, -60, 8, p.cheveux), C(s, 14, -54, 7, p.cheveux), R(s, 0, -46, 40, 5, 0x1d4ed8), C(s, -20, -38, 7, 0x1d4ed8), C(s, 20, -38, 7, 0x1d4ed8)]);
  if (p.acc === "casquette") c.add([C(s, 0, -46, 18, 0x16a34a), R(s, 0, -37, 30, 6, 0x15803d), s.add.ellipse(0, -18, 12, 26, p.cheveux)]);
  if (p.acc === "sac") c.add(R(s, 0, -40, 38, 6, 0x22d3ee));
  c.anim = [[jl, 38, 1], [jr, 38, -1], [bl, 4, -1], [br, 4, 1]]; // course : jambes et bras alternent
  return c.setScale(1.6).setDepth(20);
}

function creerBaril(s, x, y) { // à RAMASSER
  const c = s.add.container(x, y), l = 0xb8860b;
  c.add([
    R(s, 0, 1, 36, 39, 0xffb020, l),
    s.add.ellipse(0, -19, 40, 12, 0xffd54a).setStrokeStyle(2, l),
    s.add.ellipse(0, 20, 34, 9, 0xe69500).setStrokeStyle(2, l),
    R(s, 0, -7, 34, 3, l), R(s, 0, 10, 34, 3, l), C(s, 0, 1, 12, 0x2c3e50),
    s.add.text(0, 1, "☢", { fontSize: "24px", color: "#ffd700" }).setOrigin(0.5)
  ]);
  return c;
}

function creerPoubelle(s, x, y) { // déchet vert HAUT : change de voie
  const c = s.add.container(x, y), l = 0x0d6e5a;
  c.add([
    R(s, 0, 3, 32, 39, 0x20c997, l), R(s, 0, -19, 38, 7, 0x4dd4b0, l),
    R(s, -10, 3, 3, 28, 0xa8f0e0), R(s, 10, 3, 3, 28, 0xa8f0e0),
    s.add.text(0, 2, "♻", { fontSize: "18px", color: "#ffffff" }).setOrigin(0.5)
  ]);
  return c;
}

function creerSac(s, x, y) { // sac de tonte : saute dessus
  const c = s.add.container(x, y);
  c.add([s.add.ellipse(0, 6, 56, 40, 0x3f9b3a).setStrokeStyle(2, 0x1f5f1f), R(s, 0, -16, 10, 8, 0x1f5f1f), C(s, -10, 6, 6, 0x7bd96f), C(s, 12, 10, 5, 0x7bd96f)]);
  return c;
}

function creerBranche(s, x, y) { // branche coupée : saute dessus
  const c = s.add.container(x, y);
  c.add([R(s, 0, 4, 84, 12, 0x8b5a2b, 0x5b3a1b), C(s, -28, -4, 12, 0x22c55e), C(s, 4, -8, 14, 0x16a34a), C(s, 30, -3, 11, 0x4ade80)]);
  return c;
}

function creerArbre(s, x, y, vivant) { // arbre vert si la nature revient, gris sinon
  const c = s.add.container(x, y), k = vivant ? [0x22c55e, 0x4ade80, 0x16a34a, 0x86efac] : [0x8a8a76, 0x9b9b88, 0x7a7a68, 0xaaaa98];
  c.add([R(s, 0, 0, 18, 65, 0xa0522d), C(s, -15, -35, 25, k[0]), C(s, 15, -35, 25, k[1]), C(s, 0, -58, 28, k[2]), C(s, 0, -35, 18, k[3])]);
  return c;
}

// ---------- Scène ----------
function create() {
  sc = this;
  const g = sc.add.graphics();
  g.fillStyle(0x7cc8ff).fillRect(0, 0, L, HZ);
  g.fillStyle(0xb9e4ff).fillRect(0, HZ - 90, L, 90);
  for (let i = 0; i < 16; i++) { // immeubles à l'horizon
    const h = Phaser.Math.Between(70, 190);
    g.fillStyle([0xf4a261, 0xe9c46a, 0xf1e3d3, 0xd98e73][i % 4]).fillRect(i * 125, HZ - h, 120, h);
  }
  g.fillStyle(0x5bbf5b).fillRect(0, HZ, L, H - HZ);
  g.fillStyle(0x4a5568); // route
  g.fillTriangle(L / 2 - 74, HZ, L / 2 + 74, HZ, L / 2 + 650, H);
  g.fillTriangle(L / 2 - 74, HZ, L / 2 + 650, H, L / 2 - 650, H);
  rayG = sc.add.graphics().setDepth(1);
  ombre = sc.add.ellipse(L / 2, PY + 100, 130, 30, 0x000000, 0.3).setDepth(5);
  cur = sc.input.keyboard.createCursorKeys();
  keys = sc.input.keyboard.addKeys("Z,Q,S,D");
  appliquerPerso(); majPersos(); majCarte();
  Promise.all([document.fonts.ready, new Promise(r => setTimeout(r, 1600))]).then(() => {
    const c = $("chargement"); c.style.opacity = 0; setTimeout(() => c.remove(), 600);
  });
}

function rayures() { // tirets blancs qui défilent entre les voies
  rayG.clear(); rayG.fillStyle(0xffffff, 0.85);
  for (let i = 0; i < 9; i++) {
    const t = (((i / 9) + defil) % 1) * 1.37, s = 0.15 + 0.85 * t, y = HZ + (PY - HZ) * t;
    for (const d of [-0.5, 0.5]) rayG.fillRect(L / 2 + d * LW * s - 4 * s, y, 8 * s, 60 * s);
  }
}

function update(time, dt) {
  if (!sc) return;
  const c = enCours ? cfg : NIVEAUX.facile;
  const p = enCours ? Math.min(1, score / cfg.but) : 0;
  const v = c.v * (1 + 0.5 * p) * (enCours ? 1 : 0.7); // vitesse (progression de 0 à 1 par seconde)
  const spawn = c.spawn * (1 - 0.4 * p);
  let hauteur = 0;
  defil = (defil + v * dt / 1000 / 1.37) % 1;
  rayures();
  if (robot.anim) { const a = Math.sin(time / 90) * 8; robot.anim.forEach(([o, y0, sg]) => { o.y = y0 + sg * a; }); }

  if (enCours) {
    tEcoule += dt / 1000;
    if (Math.floor(tEcoule) !== dernier) { dernier = Math.floor(tEcoule); majHud(); }
    const JD = Phaser.Input.Keyboard.JustDown;
    if (JD(cur.left) || JD(keys.Q)) lane = Math.max(0, lane - 1);
    if (JD(cur.right) || JD(keys.D)) lane = Math.min(2, lane + 1);
    if ((JD(cur.up) || JD(keys.Z) || JD(cur.space)) && saut < 0) saut = 0;
    robot.x += (L / 2 + (lane - 1) * LW - robot.x) * Math.min(1, dt / 70);
    if (saut >= 0) { saut += dt; if (saut >= 750) saut = -1; else hauteur = 170 * Math.sin(Math.PI * saut / 750); }
    robot.y = PY - hauteur;
    ombre.x = robot.x; ombre.setScale(1 - hauteur / 400);
    if (tEcoule >= cfg.temps) return fin("TEMPS ÉCOULÉ", false);
  }

  tSpawn += dt; tDeco += dt;
  if (tSpawn >= (enCours ? spawn : 900)) { tSpawn = 0; faireApparaitre(); }
  if (tDeco >= 450) { tDeco = 0; arbreDeco(); }

  for (let i = objets.length - 1; i >= 0; i--) {
    const o = objets[i];
    o.t += v * dt / 1000;
    const s = 0.15 + 0.85 * o.t;
    o.f.setPosition(L / 2 + o.dx * s, HZ + (PY - HZ) * o.t).setScale(s * o.k).setDepth(10 + o.t * 10);
    const touche = enCours && o.type !== "deco" && o.t > 0.9 && o.t < 1.1 &&
      Math.abs(o.dx - (robot.x - L / 2)) < LW * 0.45 && !(o.bas && hauteur > 70);
    if (touche) {
      o.f.destroy(); objets.splice(i, 1);
      if (o.type === "baril") { score += 10 * cfg.multi; barils++; }
      else { vies--; sc.cameras.main.shake(180, 0.01); }
      majHud();
      if (vies <= 0) return fin("GAME OVER", false);
      if (score >= cfg.but) return fin("PLANÈTE SAUVÉE", true);
    } else if (o.t > 1.4) { o.f.destroy(); objets.splice(i, 1); }
  }
}

// ---------- Apparition des objets ----------
function ajouter(type, voie) {
  const mk = { baril: creerBaril, poubelle: creerPoubelle, sac: creerSac, branche: creerBranche }[type];
  objets.push({ f: mk(sc, 0, 0), type, dx: (voie - 1) * LW, t: 0, k: 2.2, bas: type === "sac" || type === "branche" });
}

function faireApparaitre() {
  if (trail > 0) { trail--; ajouter("baril", trailLane); return; } // file de barils comme les pièces de Bus Rush
  if (Math.random() < 0.18) { trailLane = Math.floor(Math.random() * 3); trail = 1; ajouter("baril", trailLane); return; }
  const [a, b] = (enCours ? cfg : NIVEAUX.facile).blocs, T = ["poubelle", "sac", "branche"];
  const n = a + Math.floor(Math.random() * (b - a + 1)), voies = [0, 1, 2].sort(() => Math.random() - 0.5);
  for (let i = 0; i < n; i++) ajouter(T[Math.floor(Math.random() * 3)], voies[i]);
  if (n < 3 && Math.random() < 0.5) ajouter("baril", voies[n]);
}

function arbreDeco() { // plus tu nettoies, plus les arbres sont verts
  const p = enCours ? Math.min(1, score / cfg.but) : 1;
  objets.push({ f: creerArbre(sc, 0, 0, Math.random() < p), type: "deco", dx: (Math.random() < 0.5 ? -1 : 1) * (760 + Math.random() * 200), t: 0, k: 2.8 });
}

// ---------- Parties ----------
function appliquerPerso() {
  if (robot) robot.destroy();
  robot = creerPerso(sc, L / 2, PY, PERSOS[perso]);
}

function lancer() {
  cfg = NIVEAUX[niv];
  objets.forEach(o => o.f.destroy()); objets = [];
  viesMax = cfg.vies + PERSOS[perso].bonus;
  score = 0; barils = 0; vies = viesMax; tEcoule = 0; tSpawn = 0; dernier = -1; lane = 1; saut = -1; trail = 0;
  appliquerPerso();
  $("menu").classList.add("cache"); $("fin").classList.add("cache"); $("hud").classList.remove("cache");
  majHud();
  enCours = true;
}

function fin(titre, gagne) {
  enCours = false;
  const avant = meilleur();
  const hist = historique();
  hist.unshift({ score, niveau: niv, date: new Date().toLocaleDateString("fr-FR") });
  localStorage.setItem("ecoScores", JSON.stringify(hist.slice(0, 8)));
  localStorage.setItem("ecoXP", xpTotal() + Math.round(score / 10));
  if (score > avant) localStorage.setItem("ecoMeilleur", score);
  const nouveaux = Object.values(PERSOS).filter(p => p.seuil > avant && p.seuil <= score).map(p => p.nom);
  $("fTitre").textContent = titre;
  $("fTitre").className = "titre " + (gagne ? "ok" : "ko");
  $("fScore").textContent = score + " pts  ·  " + barils + " barils nettoyés";
  $("fMsg").textContent = nouveaux.length ? "🔓 Personnage débloqué : " + nouveaux.join(", ") + " !" :
    (gagne ? "Moins de pollution, plus de vie !" : "La planète a encore besoin de toi.");
  $("hud").classList.add("cache"); $("fin").classList.remove("cache");
}

function montrerMenu() {
  enCours = false;
  $("fin").classList.add("cache"); $("hud").classList.add("cache"); $("menu").classList.remove("cache");
  majPersos(); majCarte();
}

// ---------- Interface (HTML) ----------
const historique = () => JSON.parse(localStorage.getItem("ecoScores") || "[]");
const xpTotal = () => +localStorage.getItem("ecoXP") || 0;
const meilleur = () => +localStorage.getItem("ecoMeilleur") || 0;

function majCarte() {
  const xp = xpTotal(), r = xp % 400;
  $("niveauJ").textContent = "Niveau " + (Math.floor(xp / 400) + 1);
  $("xpJ").textContent = r + " / 400 XP";
  $("xpBarre").style.width = r / 4 + "%";
}

function majPersos() {
  document.querySelectorAll("[data-perso]").forEach(b => {
    const k = b.dataset.perso, p = PERSOS[k], ouvert = meilleur() >= p.seuil;
    b.innerHTML = p.nom.toUpperCase() + "<small>" + (ouvert ? (p.bonus ? "+" + p.bonus + " vie" + (p.bonus > 1 ? "s" : "") : "Standard") : "🔒 " + p.seuil + " pts") + "</small>";
    b.classList.toggle("lock", !ouvert);
    b.classList.toggle("actif", k === perso);
  });
}

function majHud() {
  const reste = Math.max(0, Math.ceil(cfg.temps - tEcoule));
  $("hTemps").textContent = Math.floor(reste / 60) + ":" + String(reste % 60).padStart(2, "0");
  $("hNiveau").textContent = niv + " ×" + cfg.multi;
  $("hPerso").textContent = "Héros · " + PERSOS[perso].nom;
  $("hScore").textContent = score;
  $("hBut").textContent = "/ " + cfg.but + " pts";
  $("hVies").textContent = "◆".repeat(Math.max(vies, 0)) + "◇".repeat(Math.max(viesMax - vies, 0));
  $("hBarils").textContent = barils;
  $("hBarilsMax").textContent = "/ " + cfg.but / (10 * cfg.multi);
  const p = Math.min(100, score / cfg.but * 100);
  $("hPlanete").style.width = p + "%";
  $("hPct").textContent = Math.round(p) + "%";
}

function panneau(txt) { const p = $("panneau"); p.textContent = txt; p.classList.remove("cache"); }

$("jouer").onclick = lancer;
$("rejouer").onclick = lancer;
$("versMenu").onclick = montrerMenu;
$("panneau").onclick = () => $("panneau").classList.add("cache");
$("plein").onclick = () => document.documentElement.requestFullscreen();
$("cCommandes").onclick = () => panneau("← → ou Q D : changer de voie\n↑ ou Z ou ESPACE : sauter\n☢ Baril jaune : RAMASSE-LE (+points × niveau)\n♻ Poubelle verte : change de voie\nSac et branche : saute par-dessus\nRemplis la jauge PLANÈTE avant la fin du temps !");
$("cRecords").onclick = () => {
  const h = historique();
  panneau(h.length ? h.map((p, i) => (i + 1) + ". " + p.score + " pts · " + p.niveau + " · " + p.date).join("\n") : "Aucune partie jouée");
};
document.querySelectorAll("[data-niv]").forEach(b => b.onclick = () => {
  niv = b.dataset.niv;
  document.querySelectorAll("[data-niv]").forEach(x => x.classList.toggle("actif", x === b));
});
document.querySelectorAll("[data-perso]").forEach(b => b.onclick = () => {
  const k = b.dataset.perso;
  if (meilleur() < PERSOS[k].seuil) return panneau("Personnage verrouillé : fais un score de " + PERSOS[k].seuil + " points dans une partie pour le débloquer.");
  perso = k; if (sc) appliquerPerso(); majPersos();
});
