// ECO-NETTOYEUR 3D : runner à 3 voies (Three.js)
// ☢ Barils jaunes = à ramasser | Poubelles, sacs, branches, barrières = à éviter
const LW = 2; // largeur d'une voie (unités 3D)

const NIVEAUX = {
  facile:    { multi: 5,  but: 1000, temps: 180, vies: 5, spawn: 1.1,  v: 9,  blocs: [1, 1] },
  moyen:     { multi: 10, but: 2000, temps: 120, vies: 3, spawn: 0.85, v: 12, blocs: [1, 2] },
  difficile: { multi: 20, but: 3000, temps: 90,  vies: 2, spawn: 0.65, v: 15, blocs: [2, 2] }
};

// aimant = zone de ramassage des barils | solide = zone de collision des obstacles (en voies)
const PERSOS = {
  simple: { nom: "Léo",  seuil: 0,    bonus: "Standard",        aimant: 0.5,  solide: 0.45, peau: 0xf6c7a4, cheveux: 0xe8652b, haut: 0xf1f5f9, bas: 0x1e40af, chaus: 0x2563eb, casq: 0x2563eb, sac: 0x2d4a2e, accent: 0x22c55e },
  moyen:  { nom: "Maya", seuil: 1000, bonus: "Aimant à barils", aimant: 0.95, solide: 0.45, peau: 0xf5c9a8, cheveux: 0x7b3f26, haut: 0xf97316, bas: 0x1f2937, chaus: 0xf8fafc, casq: 0x22c55e, sac: 0x15803d, accent: 0xffffff },
  expert: { nom: "Max",  seuil: 2000, bonus: "Résistant",       aimant: 0.5,  solide: 0.3,  peau: 0x6b4226, cheveux: 0x111827, haut: 0x7c3aed, bas: 0x1e1b3a, chaus: 0xe9d5ff, casq: 0x4c1d95, sac: 0x312e81, accent: 0x22d3ee }
};

const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
// Modèles 3D optionnels (VRoid / Sketchfab / Mixamo) : modeles/leo.glb, maya.glb, max.glb
// Si tu vois le VISAGE au lieu du DOS pendant la course, change ROTATION_MODELE (0 <-> Math.PI)
const ROTATION_MODELE = 0, HAUTEUR_MODELE = 2.4;
const FICHIERS = { simple: "leo", moyen: "maya", expert: "max" }, modeles = {};
let enCours = false, niv = "moyen", perso = "simple", cfg = NIVEAUX.moyen;
let score = 0, vies = 0, viesMax = 0, barils = 0, tEcoule = 0, tSpawn = 0, dernier = -1, temps = 0, secousse = 0;
let lane = 1, saut = -1, glisse = -1, trail = 0, trailLane = 1, cmd = "", d0 = null;
let objets = [], batiments = [], arbres = [], tirets = [], joueur;

// ---------- Monde 3D ----------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 220);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
$("jeu").appendChild(renderer.domElement);
function redim() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); if (uiPret) placerUI(); }
addEventListener("resize", redim); redim();

scene.background = new THREE.Color(0x7ccfff);
scene.fog = new THREE.Fog(0x9fdcff, 45, 150);
scene.add(new THREE.HemisphereLight(0xffffff, 0x88aa88, 0.9));
const soleil = new THREE.DirectionalLight(0xffffff, 0.9);
soleil.position.set(6, 12, 6); soleil.castShadow = true;
soleil.target.position.set(0, 0, -6); scene.add(soleil, soleil.target);
Object.assign(soleil.shadow.camera, { left: -10, right: 10, top: 16, bottom: -16 });
soleil.shadow.camera.updateProjectionMatrix(); soleil.shadow.mapSize.set(1024, 1024);
camera.position.set(0, 3.4, 6.2);

const M = (c, e) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, emissive: e || 0 });
const box = (w, h, d, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c)); m.castShadow = true; return m; };
const cyl = (r1, r2, h, c) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 14), M(c)); m.castShadow = true; return m; };
const sph = (r, c) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), M(c)); m.castShadow = true; return m; };
const placer = (m, x, y, z) => { m.position.set(x, y, z); return m; };

function sol() {
  const route = placer(new THREE.Mesh(new THREE.PlaneGeometry(6.6, 320), M(0x3b4252)), 0, 0, -100);
  route.rotation.x = -Math.PI / 2; route.receiveShadow = true; scene.add(route);
  for (const s of [-1, 1]) {
    const herbe = placer(new THREE.Mesh(new THREE.PlaneGeometry(60, 320), M(0x6fc46a)), s * 34.5, -0.02, -100);
    herbe.rotation.x = -Math.PI / 2; scene.add(herbe);
    const trottoir = placer(box(2.4, 0.12, 320, 0xdde3ea), s * 4.5, 0.05, -100); trottoir.castShadow = false; trottoir.receiveShadow = true; scene.add(trottoir);
    const ligne = placer(box(0.12, 0.02, 320, 0xfacc15), s * 3.2, 0.02, -100); ligne.castShadow = false; scene.add(ligne);
    const bord = placer(box(0.14, 0.02, 2.6, 0xffffff), 0, 0, 0); // modèle de tiret
    for (let i = 0; i < 26; i++) { const t = bord.clone(); t.position.set(s, 0.03, 8 - i * 6); scene.add(t); tirets.push(t); }
  }
}

function texFenetres() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"); g.fillStyle = "#ffffff"; g.fillRect(0, 0, 128, 128); g.fillStyle = "#6bb6e6";
  for (let x = 12; x < 128; x += 32) for (let y = 12; y < 128; y += 32) g.fillRect(x, y, 16, 20);
  return new THREE.CanvasTexture(c);
}
const COULS = [0xf4a261, 0xf6d186, 0xf1e3d3, 0xe76f51, 0x7fd1c7, 0xf7a8b8, 0x9ad0f5];

function placerBatiment(b, z) {
  const h = rnd(10, 26);
  b.scale.set(1, h / 10, 1); b.position.y = h / 2; b.position.z = z;
  b.material.color.setHex(COULS[Math.floor(rnd(0, COULS.length))]);
}

function placerArbre(t, z) { // plus tu nettoies, plus les arbres sont verts
  t.position.z = z;
  t.userData.feuille.material.color.setHex(Math.random() < (enCours ? Math.min(1, score / cfg.but) : 1) ? 0x2fb344 : 0x9b9b88);
}

function decor() {
  const fen = texFenetres();
  for (const s of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(7, 10, 8), new THREE.MeshStandardMaterial({ map: fen }));
      b.position.x = s * rnd(11, 13); placerBatiment(b, 10 - i * 14); scene.add(b); batiments.push(b);
    }
    for (let i = 0; i < 10; i++) {
      const t = new THREE.Group(), f = placer(sph(1.1, 0x2fb344), 0, 2.6, 0);
      t.add(placer(cyl(0.18, 0.25, 1.8, 0xa0522d), 0, 0.9, 0), f);
      t.userData.feuille = f; t.position.x = s * 5.4; placerArbre(t, 8 - i * 15); scene.add(t); arbres.push(t);
    }
  }
}

// ---------- Personnages (vus de dos) ----------
function creerDepuisModele(src) { // utilise un vrai modèle 3D .glb
  const m = THREE.SkeletonUtils.clone(src), g = new THREE.Group();
  m.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true; o.frustumCulled = false;
    o.material = Array.isArray(o.material) ? o.material.map(x => x.clone()) : o.material.clone();
  });
  const b = new THREE.Box3().setFromObject(m), sc = HAUTEUR_MODELE / (b.max.y - b.min.y);
  m.scale.setScalar(sc); m.position.y = -b.min.y * sc; m.rotation.y = ROTATION_MODELE;
  g.add(m); g.userData.estPerso = true; g.userData.corps = m;
  return g;
}

function creerPerso(p) {
  const cle = Object.keys(PERSOS).find(q => PERSOS[q] === p);
  if (modeles[cle]) return creerDepuisModele(modeles[cle]); // style manga : grands yeux brillants, cheveux en pointes, contours noirs
  const g = new THREE.Group(), n = p.nom, add = (m, x, y, z) => { g.add(placer(m, x, y, z)); return m; };
  const bas = c => new THREE.MeshBasicMaterial({ color: c });
  const pivot = (x, y) => { const q = new THREE.Group(); q.position.set(x, y, 0); g.add(q); return q; };
  const iris = { "Léo": 0x3b82f6, "Maya": 0x16a34a, "Max": 0xd97706 }[n];
  const pic = (x, y, z, rx, rz, r, h, c) => { // mèche de cheveux en pointe
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), M(c)); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); g.add(m); return m;
  };
  const jl = pivot(-0.14, 0.85), jr = pivot(0.14, 0.85), bl = pivot(-0.36, 1.58), br = pivot(0.36, 1.58);
  for (const j of [jl, jr]) j.add(placer(cyl(0.1, 0.085, 0.78, p.bas), 0, -0.39, 0), placer(box(0.26, 0.16, 0.42, p.chaus), 0, -0.77, -0.07), placer(box(0.28, 0.04, 0.44, 0xffffff), 0, -0.84, -0.07));
  for (const b of [bl, br]) b.add(placer(cyl(0.075, 0.065, 0.62, p.haut), 0, -0.31, 0), placer(sph(0.08, p.peau), 0, -0.66, 0));
  add(cyl(0.27, 0.22, 0.8, p.haut), 0, 1.25, 0);                                  // torse fin
  add(cyl(0.07, 0.07, 0.14, p.peau), 0, 1.7, 0);                                  // cou
  const capuche = add(sph(0.2, p.haut), 0, 1.62, 0.2); capuche.scale.set(1.2, 0.7, 0.6);
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), bas(p.accent)); logo.position.set(0.1, 1.38, -0.275); logo.rotation.y = Math.PI; g.add(logo);
  add(box(0.44, 0.58, 0.22, p.sac), 0, 1.3, 0.3);                                 // sac à dos
  add(sph(0.4, p.peau), 0, 2.0, 0);                                               // tête
  for (const s of [-1, 1]) {                                                       // yeux de manga
    add(sph(0.12, 0xffffff), s * 0.17, 1.94, -0.33).scale.set(1, 1.35, 0.35);
    add(sph(0.085, iris), s * 0.17, 1.93, -0.365).scale.set(1, 1.35, 0.3);
    add(sph(0.045, 0x111827), s * 0.17, 1.93, -0.385).scale.set(1, 1.35, 0.3);
    const reflet = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), bas(0xffffff)); reflet.position.set(s * 0.17 + 0.03, 1.99, -0.395); g.add(reflet);
    add(box(0.24, 0.035, 0.03, 0x111827), s * 0.17, 2.08, -0.35).rotation.z = -s * 0.25;       // cils
    add(box(0.18, 0.03, 0.03, p.cheveux), s * 0.17, 2.16, -0.33).rotation.z = -s * 0.15;       // sourcils
    const joue = new THREE.Mesh(new THREE.CircleGeometry(0.06, 10), new THREE.MeshBasicMaterial({ color: 0xff8fa3, transparent: true, opacity: 0.5 }));
    joue.position.set(s * 0.25, 1.83, -0.3); joue.rotation.y = Math.PI; g.add(joue);
  }
  const bouche = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 10, Math.PI), bas(0x8a3b3b));
  bouche.rotation.z = Math.PI; bouche.position.set(0, 1.81, -0.385); g.add(bouche);
  const coiffe = (r, y, sy) => { // demi-sphère : casquette ou bonnet
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(p.casq));
    m.position.set(0, y, 0.04); m.scale.y = sy || 1; m.castShadow = true; g.add(m);
  };
  if (n === "Max") {                                                               // bonnet + casque audio + mèches noires
    coiffe(0.43, 2.2, 1.15); add(cyl(0.435, 0.435, 0.12, 0x2e1065), 0, 2.24, 0.04);
    for (const s of [-1, 1]) {
      add(cyl(0.14, 0.14, 0.1, p.accent), s * 0.42, 1.98, 0).rotation.z = Math.PI / 2;
      for (let i = 0; i < 2; i++) pic(s * (0.08 + i * 0.14), 2.13, -0.31, Math.PI + 0.35, 0, 0.07, 0.26, p.cheveux);
    }
  } else {                                                                         // casquette + frange en pointes
    add(sph(0.42, p.cheveux), 0, 2.06, 0.1);
    coiffe(0.45, 2.22); add(box(0.5, 0.05, 0.36, p.casq), 0, 2.23, -0.4);
    for (let i = -2; i <= 2; i++) pic(i * 0.1, 2.2, -0.31, Math.PI + 0.3, 0, 0.065, 0.24, p.cheveux);
    if (n === "Léo") {
      for (const s of [-1, 1]) pic(s * 0.39, 2.0, -0.02, 0, Math.PI + s * 0.3, 0.08, 0.5, p.cheveux);
      for (const x of [-0.2, 0, 0.2]) pic(x, 2.2, 0.4, 1.2, 0, 0.1, 0.4, p.cheveux);
    } else {                                                                       // Maya : longs cheveux
      for (const s of [-1, 1]) add(cyl(0.09, 0.04, 0.8, p.cheveux), s * 0.37, 1.72, -0.04);
      add(cyl(0.24, 0.1, 1.0, p.cheveux), 0, 1.62, 0.34).rotation.x = -0.1;
    }
  }
  const ms = []; g.traverse(o => { if (o.isMesh) ms.push(o); });                 // rendu "dessin animé" + contour noir
  ms.forEach(o => {
    if (o.material.isMeshStandardMaterial) o.material = new THREE.MeshToonMaterial({ color: o.material.color.getHex() });
    if (o.material.isMeshToonMaterial) {
      const c = new THREE.Mesh(o.geometry, new THREE.MeshBasicMaterial({ color: 0x15151f, side: THREE.BackSide }));
      c.scale.setScalar(1.07); o.add(c);
    }
  });
  g.userData.membres = [jl, jr, bl, br]; g.userData.estPerso = true;
  return g;
}

function appliquerPerso() {
  if (joueur) scene.remove(joueur);
  const x = joueur ? joueur.position.x : 0;
  joueur = creerPerso(PERSOS[perso]); joueur.position.x = x; joueur.visible = enCours; scene.add(joueur);
}

// ---------- Objets ----------
function creerObjet3d(type) {
  const g = new THREE.Group();
  if (type === "baril") {
    const b = cyl(0.4, 0.4, 0.8, 0xffb020); b.material.emissive.setHex(0x6b3d00);
    g.add(placer(b, 0, 0.6, 0), placer(cyl(0.43, 0.43, 0.08, 0xb8860b), 0, 0.3, 0), placer(cyl(0.43, 0.43, 0.08, 0xb8860b), 0, 0.9, 0));
    g.add(placer(new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), new THREE.MeshBasicMaterial({ color: 0x1f2937 })), 0, 0.6, 0.41));
  } else if (type === "poubelle") {
    g.add(placer(box(0.9, 1.0, 0.8, 0x1f9d55), 0, 0.5, 0), placer(box(1, 0.12, 0.9, 0x167a42), 0, 1.06, 0));
    g.add(placer(new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), new THREE.MeshBasicMaterial({ color: 0xffffff })), 0, 0.55, 0.41));
  } else if (type === "sac") {
    const s = placer(sph(0.5, 0x2e7d32), 0, 0.42, 0); s.scale.set(1.1, 0.85, 1);
    g.add(s, placer(cyl(0.05, 0.16, 0.3, 0x1b5e20), 0, 0.98, 0));
  } else if (type === "branche") {
    for (let i = 0; i < 4; i++) { const l = placer(cyl(0.08, 0.08, 1.6, 0x8b5a2b), rnd(-0.2, 0.2), 0.12 + i * 0.12, rnd(-0.2, 0.2)); l.rotation.z = Math.PI / 2; l.rotation.y = rnd(-0.5, 0.5); g.add(l); }
    for (const x of [-0.5, 0, 0.5]) g.add(placer(sph(0.28, 0x22c55e), x, 0.5, 0));
  } else { // barrière : on glisse dessous
    for (const x of [-1.05, 1.05]) g.add(placer(box(0.14, 1.6, 0.14, 0x6b4f3a), x, 0.8, 0));
    g.add(placer(box(2.3, 0.35, 0.2, 0xf97316), 0, 1.45, 0), placer(box(0.5, 0.36, 0.22, 0xffffff), -0.6, 1.45, 0), placer(box(0.5, 0.36, 0.22, 0xffffff), 0.6, 1.45, 0));
  }
  return g;
}

function ajouter(type, voie) {
  const g = creerObjet3d(type), x = (voie - 1) * LW;
  g.position.set(x, 0, -100); scene.add(g);
  objets.push({ g, type, x, z: -100, bas: type === "sac" || type === "branche", haut: type === "barriere" });
}

function retirer(o) {
  scene.remove(o.g);
  o.g.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); });
}

function faireApparaitre() {
  if (trail > 0) { trail--; ajouter("baril", trailLane); return; } // file de barils
  if (Math.random() < 0.18) { trailLane = Math.floor(Math.random() * 3); trail = 1; ajouter("baril", trailLane); return; }
  const [a, b] = (enCours ? cfg : NIVEAUX.facile).blocs, T = ["poubelle", "sac", "branche", "barriere"];
  const n = a + Math.floor(Math.random() * (b - a + 1)), voies = [0, 1, 2].sort(() => Math.random() - 0.5);
  for (let i = 0; i < n; i++) ajouter(T[Math.floor(Math.random() * 4)], voies[i]);
  if (n < 3 && Math.random() < 0.5) ajouter("baril", voies[n]);
}

// ---------- Boucle de jeu ----------
function maj(dt) {
  majUI(dt);
  const P = PERSOS[perso], p = enCours ? Math.min(1, score / cfg.but) : 0;
  const v = enCours ? cfg.v * (1 + 0.4 * p) : 6;
  const spawn = enCours ? cfg.spawn * (1 - 0.35 * p) : 1.1;
  let hauteur = 0;

  tirets.forEach(t => { t.position.z += v * dt; if (t.position.z > 10) t.position.z -= 156; });
  batiments.forEach(b => { b.position.z += v * dt; if (b.position.z > 14) placerBatiment(b, b.position.z - 168); });
  arbres.forEach(t => { t.position.z += v * dt; if (t.position.z > 12) placerArbre(t, t.position.z - 150); });

  if (enCours) {
    tEcoule += dt;
    if (Math.floor(tEcoule) !== dernier) { dernier = Math.floor(tEcoule); majHud(); }
    if (cmd === "g") lane = Math.max(0, lane - 1);
    if (cmd === "d") lane = Math.min(2, lane + 1);
    if (cmd === "h" && saut < 0) saut = 0;
    if (cmd === "b" && glisse < 0 && saut < 0) glisse = 0;
    if (tEcoule >= cfg.temps) { cmd = ""; return fin("TEMPS ÉCOULÉ", false); }
  }
  cmd = "";

  joueur.position.x += ((lane - 1) * LW - joueur.position.x) * Math.min(1, dt * 14);
  if (saut >= 0) { saut += dt; if (saut >= 0.75) saut = -1; else hauteur = 1.6 * Math.sin(Math.PI * saut / 0.75); }
  if (glisse >= 0) { glisse += dt; if (glisse >= 0.65) glisse = -1; }
  joueur.position.y = hauteur;
  joueur.scale.y = glisse >= 0 ? 0.55 : 1;
  const a = Math.sin(temps * 13) * 0.9, mb = joueur.userData.membres;
  if (mb) { mb[0].rotation.x = a; mb[1].rotation.x = -a; mb[2].rotation.x = -a; mb[3].rotation.x = a; }
  else if (joueur.userData.corps) { // modèle .glb : petit rebond de course
    joueur.userData.corps.position.y = Math.abs(Math.sin(temps * 13)) * 0.08; joueur.userData.corps.rotation.z = Math.sin(temps * 6.5) * 0.05;
  }

  secousse = Math.max(0, secousse - dt);
  camera.position.x += (joueur.position.x * 0.5 - camera.position.x) * Math.min(1, dt * 5);
  camera.position.y = 3.4 + Math.sin(temps * 60) * secousse * 0.6;
  camera.lookAt(camera.position.x * 0.5, 1.3, -6);

  tSpawn += dt;
  if (tSpawn >= spawn) { tSpawn = 0; faireApparaitre(); }

  for (let i = objets.length - 1; i >= 0; i--) {
    const o = objets[i];
    o.z += v * dt; o.g.position.z = o.z;
    if (o.type === "baril") o.g.rotation.y += dt * 2.5;
    const touche = enCours && o.z > -0.8 && o.z < 0.8 &&
      Math.abs(o.x - joueur.position.x) < (o.type === "baril" ? P.aimant : P.solide) * LW &&
      !(o.bas && hauteur > 0.8) && !(o.haut && glisse >= 0);
    if (touche) {
      retirer(o); objets.splice(i, 1);
      if (o.type === "baril") { score += 10 * cfg.multi; barils++; } else { vies--; secousse = 0.25; }
      majHud();
      if (vies <= 0) return fin("GAME OVER", false);
      if (score >= cfg.but) return fin("PLANÈTE SAUVÉE", true);
    } else if (o.z > 5) { retirer(o); objets.splice(i, 1); }
  }
}

let tPrec = 0;
function boucle(now) {
  requestAnimationFrame(boucle);
  const dt = Math.min(0.05, (now - tPrec) / 1000); tPrec = now; temps += dt;
  maj(dt);
  renderer.render(scene, camera);
}

// ---------- Parties ----------
var uiPret = false;
let etat = "chargement", fontsOk = false, survol = null, survPrec = null;
const ui = {}, hud = new THREE.Group(), menuG = new THREE.Group(), finG = new THREE.Group(), chargG = new THREE.Group();

function montrer(e) {
  etat = e; enCours = e === "jeu";
  hud.visible = enCours; menuG.visible = e === "menu"; finG.visible = e === "fin"; chargG.visible = e === "chargement";
  joueur.visible = enCours;
}

function lancer() {
  cfg = NIVEAUX[niv];
  objets.forEach(retirer); objets = [];
  viesMax = cfg.vies;
  score = 0; barils = 0; vies = viesMax; tEcoule = 0; tSpawn = 0; dernier = -1; lane = 1; saut = -1; glisse = -1; trail = 0;
  appliquerPerso(); majHud(); montrer("jeu");
}

function fin(titre, gagne) {
  const avant = meilleur(), hist = historique();
  hist.unshift({ score, niveau: niv, date: new Date().toLocaleDateString("fr-FR") });
  localStorage.setItem("ecoScores", JSON.stringify(hist.slice(0, 8)));
  localStorage.setItem("ecoXP", xpTotal() + Math.round(score / 10));
  if (score > avant) localStorage.setItem("ecoMeilleur", score);
  const nouveaux = Object.values(PERSOS).filter(q => q.seuil > avant && q.seuil <= score).map(q => q.nom);
  ecrire(ui.fin, [[titre, 0.3, gagne ? "#8cf56a" : "#ff7b7b"], [score + " pts · " + barils + " barils nettoyés", 0.15], [
    nouveaux.length ? "🔓 Personnage débloqué : " + nouveaux.join(", ") : (gagne ? "Moins de pollution, plus de vie !" : "La planète a encore besoin de toi."), 0.13, "#cfe9ff"]]);
  majPersos(); montrer("fin");
}

const historique = () => JSON.parse(localStorage.getItem("ecoScores") || "[]");
const xpTotal = () => +localStorage.getItem("ecoXP") || 0;
const meilleur = () => +localStorage.getItem("ecoMeilleur") || 0;

// ---------- Interface 3D : plaques, boutons, HUD, menu ----------
function plaque(w, h, coul) { // plaque 3D : épaisseur + face avant dessinée sur un canvas
  const c = document.createElement("canvas"); c.width = Math.round(w * 160); c.height = Math.round(h * 160);
  const tex = new THREE.CanvasTexture(c), cote = new THREE.MeshStandardMaterial({ color: coul, roughness: 0.5 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.14), [cote, cote, cote, cote, new THREE.MeshBasicMaterial({ map: tex }), cote]);
  m.userData = { c, tex, fond: "#" + new THREE.Color(coul).getHexString() };
  return m;
}

function ecrire(m, lignes, fond) { // lignes : [texte, taille (part de la hauteur), couleur]
  const u = m.userData, c = u.c, g = c.getContext("2d"), W = c.width, Hc = c.height;
  u.lignes = lignes; if (fond) u.fond = fond;
  g.clearRect(0, 0, W, Hc); g.fillStyle = u.fond; g.fillRect(0, 0, W, Hc);
  g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, Hc - 6);
  const tot = lignes.reduce((a, l) => a + l[1], 0); let y = (1 - tot) / 2;
  g.textAlign = "center"; g.textBaseline = "middle";
  for (const [t, s, col] of lignes) {
    g.font = "800 " + Math.round(s * Hc * 0.8) + "px 'Baloo 2', Arial, sans-serif";
    g.fillStyle = col || "#ffffff"; g.fillText(t, W / 2, (y + s / 2) * Hc); y += s;
  }
  u.tex.needsUpdate = true;
}

function bouton(parent, w, h, x, y, coul, lignes, action) {
  const m = plaque(w, h, coul); ecrire(m, lignes);
  m.position.set(x, y, 0); m.userData.action = action; parent.add(m);
  return m;
}

function coeurGeo() {
  const s = new THREE.Shape(); s.moveTo(0, -0.5); s.bezierCurveTo(-0.9, 0.1, -0.45, 0.8, 0, 0.35); s.bezierCurveTo(0.45, 0.8, 0.9, 0.1, 0, -0.5);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 });
  g.center(); return g;
}

function construireHud() {
  const mk = (w, h) => { const m = plaque(w, h, 0x14407a); hud.add(m); return m; };
  ui.score = mk(1.9, 0.75); ui.temps = mk(1.5, 0.75); ui.vies = mk(2.6, 0.8); ui.planete = mk(2.6, 0.95); ui.barils = mk(2.1, 0.85);
  const gc = coeurGeo(); ui.mCoeur = new THREE.MeshStandardMaterial({ color: 0xff3b4e, emissive: 0x55000a }); ui.mVide = M(0x555b66);
  ui.coeurs = [];
  for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(gc, ui.mCoeur); c.scale.setScalar(0.3); c.position.set(0, -0.12, 0.16); ui.vies.add(c); ui.coeurs.push(c); }
  const gb = new THREE.BoxGeometry(2.0, 0.14, 0.1); gb.translate(1.0, 0, 0);
  const fond = new THREE.Mesh(gb, M(0x0a1630)); fond.position.set(-1.0, -0.3, 0.09); ui.planete.add(fond);
  ui.barre = new THREE.Mesh(gb, new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x1c6b36 })); ui.barre.position.set(-1.0, -0.3, 0.14); ui.planete.add(ui.barre);
  ui.globe = new THREE.Group(); ui.globe.add(sph(0.2, 0x2b8be8), placer(sph(0.1, 0x3fbf5a), 0.1, 0.06, 0.12));
  ui.globe.position.set(-1.05, 0.12, 0.2); ui.planete.add(ui.globe);
  ui.iconeBaril = creerObjet3d("baril"); ui.iconeBaril.scale.setScalar(0.5); ui.iconeBaril.position.set(-0.8, -0.3, 0.2); ui.barils.add(ui.iconeBaril);
}

function majHud() {
  const reste = Math.max(0, Math.ceil(cfg.temps - tEcoule)), q = Math.min(100, score / cfg.but * 100);
  ecrire(ui.score, [["SCORE", 0.2, "#9fd3ff"], [String(score), 0.42], ["/ " + cfg.but + " pts", 0.2, "#9fd3ff"]]);
  ecrire(ui.temps, [[Math.floor(reste / 60) + ":" + String(reste % 60).padStart(2, "0"), 0.5], [niv.toUpperCase() + " ×" + cfg.multi, 0.2, "#9fd3ff"]]);
  ecrire(ui.vies, [["VIES", 0.24, "#9fd3ff"], ["", 0.5]]);
  ui.coeurs.forEach((c, i) => { c.visible = i < viesMax; c.position.x = (i - (viesMax - 1) / 2) * 0.46; c.material = i < vies ? ui.mCoeur : ui.mVide; });
  ecrire(ui.planete, [["HÉROS · " + PERSOS[perso].nom.toUpperCase(), 0.2, "#7dfbd2"], ["PLANÈTE SAUVÉE  " + Math.round(q) + "%", 0.24], ["", 0.3]]);
  ui.barre.scale.x = Math.max(0.001, q / 100);
  ecrire(ui.barils, [["BARILS NETTOYÉS", 0.2, "#9fd3ff"], [barils + " / " + cfg.but / (10 * cfg.multi), 0.42]]);
}

function info(lignes) {
  const n = lignes.length, t = Math.min(0.14, 0.9 / n);
  ecrire(ui.info, lignes.map(l => [l, t]), "#0b2a5e"); ui.info.visible = true;
}

function choisir(k) {
  if (meilleur() < PERSOS[k].seuil) return info(["Personnage verrouillé", "", "Fais un score de " + PERSOS[k].seuil + " points", "dans une partie pour le débloquer."]);
  perso = k; appliquerPerso(); majPersos();
}

function majMenu() {
  for (const k in ui.niveaux) ecrire(ui.niveaux[k], ui.niveaux[k].userData.lignes, k === niv ? "#d79a00" : "#14407a");
}

function majPersos() { // les 3 personnages en 3D sur leurs socles
  ui.d.clear();
  ["simple", "moyen", "expert"].forEach((k, i) => {
    const p = PERSOS[k], ouvert = meilleur() >= p.seuil, x = (i - 1) * 1.45, actif = k === perso;
    const m = creerPerso(p); m.position.set(x, -1.0, 0); m.scale.setScalar(0.85);
    m.userData.base = 0.85; m.userData.action = () => choisir(k);
    if (!ouvert) m.traverse(o => { if (o.isMesh) [].concat(o.material).forEach(q => { if (q.color) q.color.multiplyScalar(0.35); }); });
    const socle = placer(cyl(0.6, 0.66, 0.18, actif ? 0x4ade80 : 0x334155), x, -1.1, 0);
    bouton(ui.d, 1.4, 0.62, x, -1.6, actif ? 0x1fa83a : 0x14407a, [[p.nom.toUpperCase(), 0.4], [ouvert ? p.bonus : "🔒 " + p.seuil + " pts", 0.24, "#cfe9ff"]], () => choisir(k));
    ui.d.add(m, socle);
  });
}

function construireMenu() {
  ui.g = new THREE.Group(); ui.d = new THREE.Group(); menuG.add(ui.g, ui.d);
  ui.jouer = bouton(ui.g, 3.6, 0.9, 0, 0.15, 0x1fa83a, [["JOUER", 0.6]], lancer);
  ui.niveaux = {};
  ["facile", "moyen", "difficile"].forEach((k, i) => {
    ui.niveaux[k] = bouton(ui.g, 1.15, 0.85, (i - 1) * 1.22, -0.95, 0x14407a, [[k.toUpperCase(), 0.26], ["×" + NIVEAUX[k].multi + " · " + NIVEAUX[k].but, 0.2, "#cfe9ff"]], () => { niv = k; majMenu(); });
  });
  bouton(ui.g, 1.75, 0.62, -0.92, -1.85, 0x14407a, [["CARRIÈRE", 0.34]], () => {
    const h = historique();
    info(["SCORES DES PARTIES", ""].concat(h.length ? h.map((q, i) => (i + 1) + ". " + q.score + " pts · " + q.niveau + " · " + q.date) : ["Aucune partie jouée"]));
  });
  bouton(ui.g, 1.75, 0.62, 0.92, -1.85, 0x14407a, [["COMMANDES", 0.34]], () => info(["COMMANDES", "", "← → ou Q D : changer de voie", "↑ ou Z ou ESPACE : sauter", "↓ ou S : glisser sous les barrières", "Téléphone : glisse le doigt", "Baril jaune : ramasse-le !", "Poubelle, sac, branche : évite-les"]));
  ui.info = bouton(menuG, 5, 3, 0, 0, 0x0b2a5e, [], () => { ui.info.visible = false; });
  ui.info.position.z = 0.8; ui.info.visible = false;
  if (THREE.FontLoader && THREE.TextGeometry) { // titre en lettres 3D
    new THREE.FontLoader().load("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json", f => {
      [["ECO", 0xff7a1a, 1.85, 0.5], ["NETTOYEUR", 0x35d44a, 1.3, 0.4]].forEach(([t, coul, y, s]) => {
        const g = new THREE.TextGeometry(t, { font: f, size: s, height: 0.28, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
        g.center(); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: coul, roughness: 0.35 }));
        m.position.set(0, y, 0); m.castShadow = false; ui.g.add(m);
      });
    });
  }
}

function construireFin() {
  ui.fin = bouton(finG, 5, 2.4, 0, 0.6, 0x0b2a5e, [], () => {});
  bouton(finG, 2.3, 0.8, -1.3, -1.0, 0x1fa83a, [["REJOUER", 0.5]], lancer);
  bouton(finG, 2.3, 0.8, 1.3, -1.0, 0x14407a, [["MENU", 0.5]], () => { majPersos(); montrer("menu"); });
}

function construireCharg() {
  ui.cBaril = creerObjet3d("baril"); ui.cBaril.scale.setScalar(1.8); ui.cBaril.position.set(0, 0.5, 0); chargG.add(ui.cBaril);
  bouton(chargG, 3.8, 0.8, 0, -0.6, 0x0b2a5e, [["CHARGEMENT…", 0.5]], () => {});
  const gb = new THREE.BoxGeometry(3.6, 0.14, 0.12); gb.translate(1.8, 0, 0);
  ui.cBarre = new THREE.Mesh(gb, new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0x6b5200 })); ui.cBarre.position.set(-1.8, -1.2, 0); chargG.add(ui.cBarre);
}

function placerUI() { // adapte la position des éléments 3D à la taille de la fenêtre
  const a = camera.aspect, k = Math.tan(Math.PI / 6), s = Math.min(1, a / 1.8), t = Math.min(1, a / 1.5) * 0.85;
  menuG.position.z = -4; menuG.scale.setScalar(s); finG.position.z = -4; finG.scale.setScalar(s); chargG.position.z = -4;
  ui.g.position.x = -k * 4 * a / s + 2.1; ui.d.position.x = k * 4 * a / s - 2.2;
  hud.position.z = -3; hud.scale.setScalar(t);
  const X = k * 3 * a / t, Y = k * 3 / t;
  ui.score.position.set(-X + 1.1, Y - 0.45, 0); ui.temps.position.set(0, Y - 0.45, 0); ui.vies.position.set(X - 1.5, Y - 0.5, 0);
  ui.planete.position.set(-X + 1.5, -Y + 0.6, 0); ui.barils.position.set(X - 1.2, -Y + 0.55, 0);
}

function majUI(dt) {
  if (etat === "chargement") {
    const q = Math.min(1, temps / 1.6);
    ui.cBarre.scale.x = Math.max(0.001, q); ui.cBaril.rotation.y += dt * 3;
    if (q >= 1 && fontsOk) { redessiner(); montrer("menu"); }
  } else if (etat === "menu") ui.d.children.forEach(c => { if (c.userData.estPerso) c.rotation.y = Math.PI + Math.sin(temps * 1.2 + c.position.x) * 0.4; }); // face au joueur
  else if (etat === "jeu") {
    ui.iconeBaril.rotation.y += dt * 3; ui.globe.rotation.y += dt;
    ui.coeurs.forEach((c, i) => { c.rotation.y = Math.sin(temps * 2 + i) * 0.5; });
  }
  if (survol !== survPrec) {
    if (survPrec) survPrec.scale.setScalar(survPrec.userData.base || 1);
    if (survol) survol.scale.setScalar((survol.userData.base || 1) * 1.07);
    survPrec = survol;
  }
}

function redessiner() { // redessine tous les textes une fois la police chargée
  [hud, menuG, finG, chargG].forEach(g => g.traverse(o => { if (o.userData.lignes) ecrire(o, o.userData.lignes); }));
  majPersos(); majMenu(); majHud();
}

// ---------- Souris, clavier, doigt ----------
const ray = new THREE.Raycaster(), souris = new THREE.Vector2();
function viser(e) {
  souris.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  camera.updateMatrixWorld(true); ray.setFromCamera(souris, camera);
  const cibles = [], col = o => { if (!o.visible) return; if (o.isMesh) cibles.push(o); o.children.forEach(col); };
  if (etat === "menu") col(menuG); else if (etat === "fin") col(finG);
  const h = ray.intersectObjects(cibles, false)[0];
  let o = h && h.object;
  while (o && !(o.userData && o.userData.action)) o = o.parent;
  return o || null;
}
renderer.domElement.addEventListener("click", e => { const o = viser(e); if (o) o.userData.action(); });
renderer.domElement.addEventListener("pointermove", e => { survol = viser(e); renderer.domElement.style.cursor = survol ? "pointer" : "default"; });

addEventListener("keydown", e => {
  const c = { arrowleft: "g", q: "g", arrowright: "d", d: "d", arrowup: "h", z: "h", " ": "h", arrowdown: "b", s: "b" }[e.key.toLowerCase()];
  if (c && enCours) { cmd = c; e.preventDefault(); }
});
addEventListener("pointerdown", e => { d0 = [e.clientX, e.clientY]; });
addEventListener("pointerup", e => {
  if (!d0 || !enCours) { d0 = null; return; }
  const dx = e.clientX - d0[0], dy = e.clientY - d0[1];
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) cmd = dx < 0 ? "g" : "d";
  else if (dy < -40) cmd = "h"; else if (dy > 40) cmd = "b";
  d0 = null;
});

function chargerModeles() { // charge les .glb s'ils existent, sinon on garde les personnages du jeu
  if (!THREE.GLTFLoader || !THREE.SkeletonUtils) return;
  const gl = new THREE.GLTFLoader();
  for (const k in FICHIERS) gl.load("modeles/" + FICHIERS[k] + ".glb", r => {
    modeles[k] = r.scene; if (uiPret) { appliquerPerso(); majPersos(); }
  }, undefined, () => {});
}

// ---------- Démarrage ----------
sol(); decor(); appliquerPerso();
scene.add(camera); camera.add(hud, menuG, finG, chargG);
construireHud(); construireMenu(); construireFin(); construireCharg();
majPersos(); majMenu(); majHud(); placerUI(); uiPret = true;
montrer("chargement");
chargerModeles();
document.fonts.load("800 40px 'Baloo 2'").then(() => { fontsOk = true; }, () => { fontsOk = true; });
requestAnimationFrame(boucle);
