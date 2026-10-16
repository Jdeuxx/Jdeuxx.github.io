const L = 1920, H = 1080;
const ZL = 760, ZG = (L - ZL) / 2, ZD = ZG + ZL; // zone de jeu au milieu

const NIVEAUX = {
  facile:    { multi: 5,  but: 1000, temps: 180, vies: 5, delai: 1100, delaiMin: 450, vit: 160, vitMax: 380 },
  moyen:     { multi: 10, but: 2000, temps: 120, vies: 3, delai: 750,  delaiMin: 250, vit: 240, vitMax: 520 },
  difficile: { multi: 20, but: 3000, temps: 90,  vies: 2, delai: 450,  delaiMin: 160, vit: 360, vitMax: 680 }
};

const $ = id => document.getElementById(id);
let sc, robot, cur, keys;
let objets = [], arbres = [];
let enCours = false, niv = "moyen", cfg = NIVEAUX.moyen;
let score = 0, vies = 0, barils = 0, tEcoule = 0, tSpawn = 0, dernier = -1;

new Phaser.Game({
  type: Phaser.AUTO, width: L, height: H, parent: "jeu", backgroundColor: "#07131f",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: { create: create, update: update }
});

// ---------- Dessins ----------
const R = (s, x, y, w, h, c, b) => { const o = s.add.rectangle(x, y, w, h, c); if (b) o.setStrokeStyle(2, b); return o; };
const C = (s, x, y, r, c) => s.add.circle(x, y, r, c);

function creerRobot(s, x, y) {
  const c = s.add.container(x, y), l = 0x1e4a6e;
  c.add([
    R(s, 0, -8, 34, 27, 0x2aa0e0, l), R(s, 0, -9, 25, 14, 0x102333), C(s, -7, -9, 3, 0x7df9ff), C(s, 7, -9, 3, 0x7df9ff),
    C(s, 0, -24, 5, 0xff8c3a), R(s, 0, 18, 42, 28, 0x3ab0e0, l), R(s, 0, 18, 18, 13, 0xffd700, 0xb8860b),
    R(s, -26, 16, 9, 24, 0x2aa0e0, l), R(s, 26, 16, 9, 24, 0x2aa0e0, l),
    R(s, -11, 39, 9, 17, 0x2aa0e0, l), R(s, 11, 39, 9, 17, 0x2aa0e0, l),
    R(s, -12, 48, 16, 6, 0xb0c4de, l), R(s, 12, 48, 16, 6, 0xb0c4de, l)
  ]);
  return c.setScale(1.35);
}

function creerPoubelle(s, x, y) { // à ESQUIVER
  const c = s.add.container(x, y), l = 0x0d6e5a;
  c.add([
    R(s, 0, 3, 32, 39, 0x20c997, l), R(s, 0, -19, 38, 7, 0x4dd4b0, l),
    R(s, -10, 3, 3, 28, 0xa8f0e0), R(s, 10, 3, 3, 28, 0xa8f0e0),
    s.add.text(0, 2, "♻", { fontSize: "18px", color: "#ffffff" }).setOrigin(0.5)
  ]);
  return c.setScale(1.35);
}

function creerBaril(s, x, y) { // à ATTRAPER
  const c = s.add.container(x, y), l = 0xb8860b;
  c.add([
    R(s, 0, 1, 36, 39, 0xffb020, l),
    s.add.ellipse(0, -19, 40, 12, 0xffd54a).setStrokeStyle(2, l),
    s.add.ellipse(0, 20, 34, 9, 0xe69500).setStrokeStyle(2, l),
    R(s, 0, -7, 34, 3, l), R(s, 0, 10, 34, 3, l), C(s, 0, 1, 12, 0x2c3e50),
    s.add.text(0, 1, "☢", { fontSize: "24px", color: "#ffd700" }).setOrigin(0.5)
  ]);
  return c.setScale(1.35);
}

function creerArbre(s, x, y, t) {
  const c = s.add.container(x, y);
  c.add([R(s, 0, 0, 18, 65, 0xa0522d), C(s, -15, -35, 25, 0x22c55e), C(s, 15, -35, 25, 0x4ade80), C(s, 0, -58, 28, 0x16a34a), C(s, 0, -35, 18, 0x86efac)]);
  return c.setScale(t);
}

// ---------- Scène ----------
function create() {
  sc = this;
  R(sc, L / 2, H / 2, L, H, 0x07131f);
  for (let i = 0; i < 18; i++) { // skyline de la ville
    const h = Phaser.Math.Between(250, 650);
    R(sc, i * 110 + 40, 875 - h / 2, Phaser.Math.Between(90, 160), h, 0x0e2236).setAlpha(0.8);
  }
  R(sc, L / 2, H / 2, ZL, H, 0x1b4560).setAlpha(0.45);
  R(sc, ZG, H / 2, 4, H, 0x4ade80).setAlpha(0.8);
  R(sc, ZD, H / 2, 4, H, 0x4ade80).setAlpha(0.8);
  R(sc, L / 2, 900, L, 50, 0x245447);
  R(sc, L / 2, 875, L, 4, 0x4ade80).setAlpha(0.6);
  robot = creerRobot(sc, L / 2, 820);
  cur = sc.input.keyboard.createCursorKeys();
  keys = sc.input.keyboard.addKeys("Z,Q,S,D");

  majCarte();
  // Écran de chargement : polices prêtes + 1,6 s minimum
  Promise.all([document.fonts.ready, new Promise(r => setTimeout(r, 1600))]).then(() => {
    const c = $("chargement");
    c.style.opacity = 0;
    setTimeout(() => c.remove(), 600);
  });
}

function update(t, dt) {
  if (!sc) return;
  const c = enCours ? cfg : NIVEAUX.facile;
  const p = enCours ? Math.min(1, score / cfg.but) : 0;
  const delai = c.delai - (c.delai - c.delaiMin) * p;
  const vit = c.vit + (c.vitMax - c.vit) * p;

  if (enCours) {
    tEcoule += dt / 1000;
    if (Math.floor(tEcoule) !== dernier) { dernier = Math.floor(tEcoule); majHud(); }
    const d = 600 * dt / 1000;
    if (cur.left.isDown || keys.Q.isDown) robot.x -= d;
    if (cur.right.isDown || keys.D.isDown) robot.x += d;
    if (cur.up.isDown || keys.Z.isDown) robot.y -= d;
    if (cur.down.isDown || keys.S.isDown) robot.y += d;
    robot.x = Phaser.Math.Clamp(robot.x, ZG + 45, ZD - 45);
    robot.y = Phaser.Math.Clamp(robot.y, 160, 810);
    if (tEcoule >= cfg.temps) return fin("TEMPS ÉCOULÉ", false);
  }

  tSpawn += dt;
  if (tSpawn >= (enCours ? delai : 900)) { tSpawn = 0; creerObjet(); }

  for (let i = objets.length - 1; i >= 0; i--) {
    const o = objets[i];
    o.f.y += (enCours ? vit : 180) * dt / 1000;
    if (enCours && Phaser.Geom.Intersects.RectangleToRectangle(robot.getBounds(), o.f.getBounds())) {
      o.f.destroy(); objets.splice(i, 1);
      if (o.baril) { score += 10 * cfg.multi; barils++; arbresNature(); } else vies--;
      majHud();
      if (vies <= 0) return fin("GAME OVER", false);
      if (score >= cfg.but) return fin("PLANÈTE SAUVÉE", true);
    } else if (o.f.y > H + 100) {
      o.f.destroy(); objets.splice(i, 1);
    }
  }
}

function creerObjet() {
  const baril = Math.random() < 0.3, x = Phaser.Math.Between(ZG + 40, ZD - 40);
  objets.push({ f: baril ? creerBaril(sc, x, -40) : creerPoubelle(sc, x, -40), baril });
}

function arbresNature() { // la nature revient à 20 / 40 / 60 / 80 % de l'objectif
  [[0.2, 120, 820, 1.2], [0.4, 260, 825, 1.5], [0.6, 1660, 820, 1.3], [0.8, 1800, 825, 1.6]].forEach(([p, x, y, t], i) => {
    if (score >= p * cfg.but && !arbres[i]) arbres[i] = creerArbre(sc, x, y, t);
  });
}

// ---------- Parties ----------
function lancer() {
  cfg = NIVEAUX[niv];
  objets.forEach(o => o.f.destroy()); objets = [];
  arbres.forEach(a => a.destroy()); arbres = [];
  score = 0; barils = 0; vies = cfg.vies; tEcoule = 0; tSpawn = 0; dernier = -1;
  robot.setPosition(L / 2, 820);
  $("menu").classList.add("cache");
  $("fin").classList.add("cache");
  $("hud").classList.remove("cache");
  majHud();
  enCours = true;
}

function fin(titre, gagne) {
  enCours = false;
  const hist = historique();
  hist.unshift({ score, niveau: niv, date: new Date().toLocaleDateString("fr-FR") });
  localStorage.setItem("ecoScores", JSON.stringify(hist.slice(0, 8)));
  localStorage.setItem("ecoXP", xpTotal() + Math.round(score / 10));
  if (gagne) { // forêt complète
    for (let i = 0; i < 22; i++) arbres.push(creerArbre(sc, 30 + i * 88, Phaser.Math.Between(760, 850), Phaser.Math.FloatBetween(1.2, 2.1)));
  }
  $("fTitre").textContent = titre;
  $("fTitre").className = "titre " + (gagne ? "ok" : "ko");
  $("fScore").textContent = score + " pts  ·  " + barils + " barils nettoyés";
  $("fMsg").textContent = gagne ? "Moins de pollution, plus de vie !" : "La planète a encore besoin de toi.";
  $("hud").classList.add("cache");
  $("fin").classList.remove("cache");
}

function montrerMenu() {
  enCours = false;
  $("fin").classList.add("cache");
  $("hud").classList.add("cache");
  $("menu").classList.remove("cache");
  majCarte();
}

// ---------- Interface (HTML) ----------
const historique = () => JSON.parse(localStorage.getItem("ecoScores") || "[]");
const xpTotal = () => +localStorage.getItem("ecoXP") || 0;

function majCarte() {
  const xp = xpTotal(), r = xp % 400;
  $("niveauJ").textContent = "Niveau " + (Math.floor(xp / 400) + 1);
  $("xpJ").textContent = r + " / 400 XP";
  $("xpBarre").style.width = r / 4 + "%";
}

function majHud() {
  const reste = Math.max(0, Math.ceil(cfg.temps - tEcoule));
  $("hTemps").textContent = Math.floor(reste / 60) + ":" + String(reste % 60).padStart(2, "0");
  $("hNiveau").textContent = niv + " ×" + cfg.multi;
  $("hScore").textContent = score;
  $("hBut").textContent = "/ " + cfg.but + " pts";
  $("hVies").textContent = "◆".repeat(Math.max(vies, 0)) + "◇".repeat(Math.max(cfg.vies - vies, 0));
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
$("cCommandes").onclick = () => panneau("Flèches ou ZQSD : se déplacer\n☢ Baril jaune : ATTRAPE-LE (+points × niveau)\n♻ Poubelle verte : ESQUIVE-LA (-1 vie)\nRemplis la jauge PLANÈTE avant la fin du temps !");
$("cRecords").onclick = () => {
  const h = historique();
  panneau(h.length ? h.map((p, i) => (i + 1) + ". " + p.score + " pts · " + p.niveau + " · " + p.date).join("\n") : "Aucune partie jouée");
};
document.querySelectorAll("[data-niv]").forEach(b => b.onclick = () => {
  niv = b.dataset.niv;
  document.querySelectorAll("[data-niv]").forEach(x => x.classList.toggle("actif", x === b));
});
