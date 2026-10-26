//BARIL RUNNER 3D : runner à 3 voies (Three.js)
// ☢ Barils jaunes = à ramasser | Poubelles, sacs, branches, barrières, bus = à éviter
const LW = 2; // largeur d'une voie (unités 3D)

const NIVEAUX = {
  facile:    { multi: 5,  but: 1000, temps: 180, vies: 5, spawn: 1.1,  v: 9,  blocs: [1, 1] },
  moyen:     { multi: 10, but: 2000, temps: 120, vies: 3, spawn: 0.85, v: 12, blocs: [1, 2] },
  difficile: { multi: 20, but: 3000, temps: 90,  vies: 2, spawn: 0.65, v: 15, blocs: [2, 2] },
  infini:    { multi: 10, but: Infinity, temps: Infinity, vies: 3, spawn: 0.85, v: 12, blocs: [1, 2], infini: true }
};

// aimant = zone de ramassage des barils | solide = zone de collision des obstacles (en voies)
const PERSOS = {
  simple: { nom: "Léo",  seuil: 0,    bonus: "Standard",        aimant: 0.5,  solide: 0.45, peau: 0xf6c7a4, cheveux: 0xe8652b, haut: 0xf1f5f9, bas: 0x1e40af, chaus: 0x2563eb, casq: 0x2563eb, sac: 0x2d4a2e, accent: 0x22c55e },
  moyen:  { nom: "Maya", seuil: 1000, bonus: "Aimant à barils", aimant: 0.95, solide: 0.45, peau: 0xf5c9a8, cheveux: 0x7b3f26, haut: 0xf97316, bas: 0x1f2937, chaus: 0xf8fafc, casq: 0x22c55e, sac: 0x15803d, accent: 0xffffff },
  momie:  { nom: "Momo", seuil: 3000, bonus: "Bandages",       aimant: 0.75, solide: 0.4,  style: "momie", peau: 0xc9d6c0, cheveux: 0x6b21a8, haut: 0xe7dcc3, bas: 0xd9cdb0, chaus: 0xb8a88a, casq: 0x7e22ce, sac: 0x92400e, accent: 0xfacc15 },
  jet:    { nom: "Jet",  seuil: 4500, bonus: "Super aimant",    aimant: 1.15, solide: 0.45, style: "jet",   peau: 0xe8b48f, cheveux: 0x5b3a1f, haut: 0xea580c, bas: 0x0e7490, chaus: 0x1f2937, casq: 0x0ea5e9, sac: 0x9ca3af, accent: 0x22d3ee },
  zip:    { nom: "Zip",  seuil: 6000, bonus: "Agile",           aimant: 0.6,  solide: 0.3,  style: "zip",   peau: 0xf2c09a, cheveux: 0x14b8a6, haut: 0xf8fafc, bas: 0xb45309, chaus: 0xfacc15, casq: 0xf59e0b, sac: 0x1f2937, accent: 0xfacc15 },
  expert: { nom: "Max",  seuil: 2000, bonus: "Résistant",       aimant: 0.5,  solide: 0.3,  peau: 0x6b4226, cheveux: 0x111827, haut: 0x7c3aed, bas: 0x1e1b3a, chaus: 0xe9d5ff, casq: 0x4c1d95, sac: 0x312e81, accent: 0x22d3ee }
};

const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
// ---------- Sauvegarde : pièces, tenues, améliorations, missions, coffres ----------
const SKINS = [
  { id: "def",   nom: "CLASSIQUE", prix: 0 },
  { id: "or",    nom: "DORÉ",      prix: 300, haut: 0xfacc15, casq: 0xf59e0b, bas: 0x92400e },
  { id: "foret", nom: "FORÊT",     prix: 400, haut: 0x16a34a, casq: 0x84cc16, bas: 0x14532d },
  { id: "neon",  nom: "NÉON",      prix: 500, haut: 0x22d3ee, casq: 0xec4899, bas: 0x0f172a },
  { id: "feu",   nom: "FEU",       prix: 600, haut: 0xef4444, casq: 0xf97316, bas: 0x1f2937 }
];
const AMELIO = [{ k: "aimant", nom: "AIMANT +" }, { k: "double", nom: "×2 +" }, { k: "saut", nom: "SAUT +" }];
const MISSIONS = [ // c = compteur suivi, n = objectif, r = récompense en pièces
  { t: "Ramasse 50 barils",     c: "baril",  n: 50,  r: 100 },
  { t: "Saute 30 fois",         c: "saut",   n: 30,  r: 80 },
  { t: "Glisse 20 fois",        c: "glisse", n: 20,  r: 80 },
  { t: "Monte sur 5 bus",       c: "toit",   n: 5,   r: 150 },
  { t: "Prends 5 bonus",        c: "bonus",  n: 5,   r: 120 },
  { t: "Ramasse 200 barils",    c: "baril",  n: 200, r: 250 },
  { t: "Termine 3 parties",     c: "partie", n: 3,   r: 100 },
  { t: "Monte sur 15 bus",      c: "toit",   n: 15,  r: 300 },
  { t: "Prends 15 bonus",       c: "bonus",  n: 15,  r: 250 },
  { t: "Saute 100 fois",        c: "saut",   n: 100, r: 200 },
  { t: "Ramasse 500 barils",    c: "baril",  n: 500, r: 500 },
  { t: "Termine 10 parties",    c: "partie", n: 10,  r: 300 }
];
function lireSauv() {
  let d = {}; try { d = JSON.parse(localStorage.getItem("barilSauv") || "{}") || {}; } catch (e) {}
  return { pieces: d.pieces || 0, coffres: d.coffres || 0, skins: d.skins || ["def"], skin: d.skin || "def",
    up: Object.assign({ aimant: 0, double: 0, saut: 0 }, d.up), vieBonus: !!d.vieBonus,
    miss: d.miss || [0, 1, 2], mNext: d.mNext || 3, prog: d.prog || {} };
}
const sauv = lireSauv();
const sauver = () => { try { localStorage.setItem("barilSauv", JSON.stringify(sauv)); } catch (e) {} };
const prixUp = k => 250 * (sauv.up[k] + 1);

function compter(c, n) { // fait avancer les missions actives
  sauv.miss.forEach((idx, slot) => {
    const m = MISSIONS[idx]; if (!m || m.c !== c) return;
    sauv.prog[idx] = (sauv.prog[idx] || 0) + (n || 1);
    if (sauv.prog[idx] >= m.n) {
      sauv.pieces += m.r; sauv.coffres++; delete sauv.prog[idx];
      let ni = sauv.mNext % MISSIONS.length; while (sauv.miss.includes(ni)) ni = (ni + 1) % MISSIONS.length;
      sauv.miss[slot] = ni; sauv.mNext = ni + 1;
      annoncer("MISSION +" + m.r + " 🪙", "#8cf56a"); son("coffre"); sauver();
    }
  });
}

// ---------- Sons et musique (générés par le navigateur, aucun fichier à ajouter) ----------
let audio = null, muet = false, mNext = 0, mStep = 0;
try { muet = localStorage.getItem("barilMuet") === "1"; } catch (e) {}
const ACC = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]; // La m, Fa, Do, Sol
const BASSE = [110, 87.3, 130.8, 98];
function initAudio() {
  try {
    if (!audio) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; audio = new AC(); mNext = audio.currentTime + 0.1; }
    if (audio.state === "suspended") audio.resume();
  } catch (e) { audio = null; }
}
function basculerSon() { muet = !muet; try { localStorage.setItem("barilMuet", muet ? "1" : "0"); } catch (e) {} majSon(); }
function majSon() { if (ui.son) ecrire(ui.son, [[muet ? "🔇" : "🔊", 0.6]]); }
function note(f, t, d, type, vol, f2) {
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + d + 0.02);
}
function bruit(t, d, vol, hz) {
  const n = Math.floor(audio.sampleRate * d), b = audio.createBuffer(1, n, audio.sampleRate), x = b.getChannelData(0);
  for (let i = 0; i < n; i++) x[i] = Math.random() * 2 - 1;
  const s = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
  s.buffer = b; f.type = "lowpass"; f.frequency.value = hz; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f); f.connect(g); g.connect(audio.destination); s.start(t);
}
function son(k) {
  if (!audio || muet || audio.state !== "running") return;
  const t = audio.currentTime;
  if (k === "baril") { note(880, t, 0.08, "square", 0.05); note(1320, t + 0.06, 0.1, "square", 0.05); }
  else if (k === "saut") note(280, t, 0.22, "square", 0.05, 640);
  else if (k === "glisse") bruit(t, 0.25, 0.07, 1800);
  else if (k === "choc") { bruit(t, 0.3, 0.2, 700); note(160, t, 0.3, "sawtooth", 0.1, 50); }
  else if (k === "bonus") [523, 659, 784, 1047].forEach((f, i) => note(f, t + i * 0.07, 0.12, "triangle", 0.08));
  else if (k === "toit") note(440, t, 0.1, "triangle", 0.07, 880);
  else if (k === "coffre") [523, 659, 784, 1047, 1319].forEach((f, i) => note(f, t + i * 0.09, 0.18, "square", 0.05));
  else if (k === "chute") { note(400, t, 0.8, "sawtooth", 0.1, 60); bruit(t + 0.5, 0.3, 0.15, 400); }
}
function musique() { // boucle musicale planifiée à l'avance (128 bpm)
  if (!audio || muet || audio.state !== "running") return;
  if (mNext < audio.currentTime - 0.3) mNext = audio.currentTime + 0.05;
  const pas = 60 / 128 / 2, vol = enCours ? 1 : 0.55;
  while (mNext < audio.currentTime + 0.3) {
    const c = Math.floor(mStep / 8) % 4, k = mStep % 8, A = ACC[c];
    if (k === 0 || k === 4) note(150, mNext, 0.12, "sine", 0.16 * vol, 45);
    if (k % 2 === 1) bruit(mNext, 0.04, 0.025 * vol, 7000);
    if ([0, 3, 4, 6].includes(k)) note(BASSE[c], mNext, pas * 0.9, "triangle", 0.13 * vol);
    note(A[[0, 1, 2, 1, 2, 1, 0, 1][k]] * 2, mNext, pas * 0.8, "square", 0.028 * vol);
    mNext += pas; mStep++;
  }
}

// Modèles 3D optionnels (VRoid / Sketchfab / Mixamo) : modeles/leo.glb, maya.glb, max.glb
// Si tu vois le VISAGE au lieu du DOS pendant la course, change ROTATION_MODELE (0 <-> Math.PI)
const ROTATION_MODELE = 0, HAUTEUR_MODELE = 2.4;
const FICHIERS = { simple: "leo", moyen: "maya", expert: "max", momie: "momo", jet: "jet", zip: "zip" }, modeles = {};
const texPersos = {};
function chargerImages() {
  const tl = new THREE.TextureLoader();
tl.load(FICHIERS[k] + ".png"    texPersos[k] = t; if (uiPret) { appliquerPerso(); majPersos(); }
  }, undefined, () => {});
}
function creerDepuisImage(tex) {
  const g = new THREE.Group(), corps = new THREE.Group(), h = HAUTEUR_MODELE;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(h * tex.image.width / tex.image.height, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide })
  );
  m.position.y = h / 2; corps.add(m); g.add(corps);
  g.userData.corps = corps;
  return g;
}
let enCours = false, niv = "moyen", perso = "simple", cfg = NIVEAUX.moyen;
let score = 0, vies = 0, viesMax = 0, barils = 0, tEcoule = 0, tSpawn = 0, dernier = -1, temps = 0, secousse = 0;
let lane = 1, vy = 0, glisse = -1, cmd = "", d0 = null, camBase = 3.4;
let fontJeu = null;
const BUS_H = 1.4, DUREES = { aimant: 8, double: 10, saut: 8 }, bonus = { aimant: 0, double: 0, saut: 0 };
const avancement = () => cfg.infini ? Math.min(1, score / 3000) : Math.min(1, score / cfg.but); // barre planète + arbres
const rythme = () => cfg.infini ? Math.min(1, tEcoule / 120) : avancement();                    // vitesse et fréquence des obstacles
let objets = [], batiments = [], arbres = [], tirets = [], herbes = [], lampes = [], nuages = [], structs = {}, joueur, poursuivant;
let trebuche = 0, invul = 0, mortT = -1, mortTitre = "", dChase = 30, dCible = 30, tMsg = 0, wasRoof = false, cPrec = 0;

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
const hemi = new THREE.HemisphereLight(0xffffff, 0x88aa88, 0.9); scene.add(hemi);
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
    herbe.rotation.x = -Math.PI / 2; scene.add(herbe); herbes.push(herbe);
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
function texFenetresNuit() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"); g.fillStyle = "#000000"; g.fillRect(0, 0, 128, 128); g.fillStyle = "#ffffff";
  for (let x = 12; x < 128; x += 32) for (let y = 12; y < 128; y += 32) g.fillRect(x, y, 16, 20);
  return new THREE.CanvasTexture(c);
}
const COULS = [0xe07b53, 0xf2a65a, 0xf6d186, 0xf1e3d3, 0xd9694a, 0xe9b872, 0xf4c7a1, 0xc65d3b];

function placerBatiment(b, z) {
  const h = rnd(10, 26);
  b.scale.set(1, h / 10, 1); b.position.y = h / 2; b.position.z = z;
  b.material.color.setHex(COULS[Math.floor(rnd(0, COULS.length))]);
}

function placerArbre(t, z) { // plus tu nettoies, plus les arbres sont verts
  t.position.z = z;
  t.userData.feuille.material.color.setHex(Math.random() < (enCours ? avancement() : 1) ? 0x2fb344 : 0x9b9b88);
}

function decor() {
  const fen = texFenetres(), fenNuit = texFenetresNuit();
  for (const s of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(7, 10, 8), new THREE.MeshStandardMaterial({ map: fen, emissiveMap: fenNuit, emissive: 0x000000 }));
      const toit = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.3, 8.6), M(0xfff7ed)); toit.position.y = 5.1; b.add(toit);
      b.position.x = s * rnd(11, 13); placerBatiment(b, 10 - i * 14); scene.add(b); batiments.push(b);
    }
    for (let i = 0; i < 10; i++) {
      const t = new THREE.Group(), f = placer(new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), new THREE.MeshStandardMaterial({ color: 0x2fb344, flatShading: true, roughness: 0.8 })), 0, 2.7, 0); f.castShadow = true;
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
  const sk = SKINS.find(q => q.id === sauv.skin); if (sk && sk.haut) p = Object.assign({}, p, { haut: sk.haut, casq: sk.casq, bas: sk.bas });
  const cle = Object.keys(PERSOS).find(q => PERSOS[q].nom === p.nom);
  if (texPersos[cle]) return creerDepuisImage(texPersos[cle]);
  if (modeles[cle]) return creerDepuisModele(modeles[cle]); // style manga : grands yeux brillants, cheveux en pointes, contours noirs
  const g = new THREE.Group(), n = p.nom, add = (m, x, y, z) => { g.add(placer(m, x, y, z)); return m; };
  const bas = c => new THREE.MeshBasicMaterial({ color: c });
  const pivot = (x, y) => { const q = new THREE.Group(); q.position.set(x, y, 0); g.add(q); return q; };
  const iris = { "Léo": 0x3b82f6, "Maya": 0x16a34a, "Max": 0xd97706, "Momo": 0xa3e635, "Jet": 0x92400e, "Zip": 0x8b5cf6 }[n];
  const pic = (x, y, z, rx, rz, r, h, c) => { // mèche de cheveux en pointe
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), M(c)); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); g.add(m); return m;
  };
  const jl = pivot(-0.14, 0.85), jr = pivot(0.14, 0.85), bl = pivot(-0.36, 1.58), br = pivot(0.36, 1.58);
  for (const j of [jl, jr]) j.add(placer(cyl(0.1, 0.085, 0.78, p.bas), 0, -0.39, 0), placer(box(0.26, 0.16, 0.42, p.chaus), 0, -0.77, -0.07), placer(box(0.28, 0.04, 0.44, 0xffffff), 0, -0.84, -0.07));
  for (const b of [bl, br]) b.add(placer(cyl(0.075, 0.065, 0.62, p.haut), 0, -0.31, 0), placer(sph(0.08, p.peau), 0, -0.66, 0));
  add(cyl(0.27, 0.22, 0.8, p.haut), 0, 1.25, 0);                                  // torse fin
  add(cyl(0.07, 0.07, 0.14, p.peau), 0, 1.7, 0);                                  // cou
  const capuche = add(sph(0.2, p.haut), 0, 1.62, 0.2); capuche.scale.set(1.2, 0.7, 0.6);
  const logo = placer(cyl(0.06, 0.06, 0.04, p.accent), 0.1, 1.38, -0.27); logo.rotation.x = Math.PI / 2; g.add(logo);
  add(box(0.44, 0.58, 0.22, p.sac), 0, 1.3, 0.3);                                 // sac à dos
  add(sph(0.4, p.peau), 0, 2.0, 0);                                               // tête
  for (const s of [-1, 1]) {                                                       // yeux de manga
    add(sph(0.12, 0xffffff), s * 0.17, 1.94, -0.33).scale.set(1, 1.35, 0.35);
    add(sph(0.085, iris), s * 0.17, 1.93, -0.365).scale.set(1, 1.35, 0.3);
    add(sph(0.045, 0x111827), s * 0.17, 1.93, -0.385).scale.set(1, 1.35, 0.3);
    const reflet = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), bas(0xffffff)); reflet.position.set(s * 0.17 + 0.03, 1.99, -0.395); g.add(reflet);
    add(box(0.24, 0.035, 0.03, 0x111827), s * 0.17, 2.08, -0.35).rotation.z = -s * 0.25;       // cils
    add(box(0.18, 0.03, 0.03, p.cheveux), s * 0.17, 2.16, -0.33).rotation.z = -s * 0.15;       // sourcils
    const joue = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), bas(0xff9aae)); joue.scale.z = 0.4; joue.position.set(s * 0.25, 1.83, -0.31); g.add(joue);
  }
  const bouche = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 10, Math.PI), bas(0x8a3b3b));
  bouche.rotation.z = Math.PI; bouche.position.set(0, 1.81, -0.385); g.add(bouche);
  const coiffe = (r, y, sy) => { // demi-sphère : casquette ou bonnet
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(p.casq));
    m.position.set(0, y, 0.04); m.scale.y = sy || 1; m.castShadow = true; g.add(m);
  };
  const band = (y, r, c) => { // arc de cercle sur l'arrière de la tête (bandage, sangle)
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.05, 14, 1, true, -Math.PI / 2, Math.PI), M(c)); m.material.side = THREE.DoubleSide; m.position.set(0, y, 0); g.add(m); return m;
  };
  if (p.style === "momie") {                                                       // momie : bandages + coiffe de pharaon violette et or
    for (let i = 0; i < 5; i++) { const y = 0.95 + i * 0.16; add(cyl(0.22 + (y - 0.85) / 0.8 * 0.05 + 0.012, 0.22 + (y - 0.85) / 0.8 * 0.05 + 0.012, 0.05, 0xf5efe0), 0, y, 0); }
    for (const [y, r] of [[1.75, 0.325], [1.95, 0.405], [2.1, 0.4]]) band(y, r, 0xf5efe0);
    add(sph(0.42, 0xf5efe0), 0, 2.02, 0.08);
    coiffe(0.46, 2.2, 1.0); add(cyl(0.465, 0.465, 0.07, 0xfacc15), 0, 2.26, 0.04); add(cyl(0.465, 0.465, 0.05, 0xfacc15), 0, 2.12, 0.04);
    for (const s of [-1, 1]) { add(box(0.16, 0.7, 0.34, p.casq), s * 0.4, 1.85, 0.12); add(box(0.165, 0.06, 0.35, 0xfacc15), s * 0.4, 1.7, 0.12); add(box(0.165, 0.06, 0.35, 0xfacc15), s * 0.4, 1.95, 0.12); }
    add(sph(0.05, 0x22d3ee), 0, 2.34, -0.42);
  } else if (p.style === "jet") {                                                  // garçon au jetpack : lunettes sur le front
    add(sph(0.42, p.cheveux), 0, 2.08, 0.08); pic(0, 2.42, 0, 0, 0, 0.12, 0.3, p.cheveux);
    band(2.22, 0.43, 0x111827);
    for (const s of [-1, 1]) { add(cyl(0.13, 0.13, 0.05, 0x111827), s * 0.15, 2.28, -0.38).rotation.x = Math.PI / 2; add(cyl(0.1, 0.1, 0.06, 0x38bdf8), s * 0.15, 2.28, -0.4).rotation.x = Math.PI / 2; }
    add(box(0.5, 0.3, 0.15, 0x6b7280), 0, 1.7, 0.4);
    for (const s of [-1, 1]) { add(cyl(0.12, 0.12, 0.7, 0x9ca3af), s * 0.17, 1.3, 0.45); const fl = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 8), bas(0xfb923c)); fl.position.set(s * 0.17, 0.78, 0.45); fl.rotation.x = Math.PI; g.add(fl); }
  } else if (p.style === "zip") {                                                  // cheveux turquoise en pointes + casque audio jaune
    add(sph(0.42, p.cheveux), 0, 2.06, 0.1);
    for (let i = -3; i <= 3; i++) pic(i * 0.1, 2.36, -0.02, 0, -i * 0.22, 0.1, 0.5, p.cheveux);
    for (let i = -2; i <= 2; i++) pic(i * 0.1, 2.2, -0.31, Math.PI + 0.3, 0, 0.065, 0.24, p.cheveux);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 8, 16, Math.PI), M(p.casq)); arc.position.set(0, 1.98, 0); g.add(arc);
    for (const s of [-1, 1]) add(cyl(0.14, 0.14, 0.12, p.casq), s * 0.46, 1.98, 0).rotation.z = Math.PI / 2;
  } else if (n === "Max") {                                                        // bonnet + casque audio + mèches noires
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
    g.add(placer(b, 0, 0.6, 0), placer(cyl(0.43, 0.43, 0.08, 0xb8860b), 0, 0.3, 0), placer(cyl(0.43, 0.43, 0.08, 0xb8860b), 0, 0.9, 0), placer(cyl(0.42, 0.42, 0.05, 0xb8860b), 0, 0.6, 0), placer(cyl(0.3, 0.3, 0.04, 0xfde68a), 0, 1.0, 0));
    const em = placer(cyl(0.2, 0.2, 0.06, 0x1f2937), 0, 0.6, 0.4); em.rotation.x = Math.PI / 2; g.add(em);
  } else if (type === "poubelle") {
    g.add(placer(box(0.9, 1.0, 0.8, 0x1f9d55), 0, 0.5, 0), placer(box(1, 0.12, 0.9, 0x167a42), 0, 1.06, 0));
    const em = placer(cyl(0.22, 0.22, 0.06, 0xffffff), 0, 0.55, 0.4); em.rotation.x = Math.PI / 2; g.add(em);
  } else if (type === "sac") {
    const s = placer(sph(0.5, 0x2e7d32), 0, 0.42, 0); s.scale.set(1.1, 0.85, 1);
    g.add(s, placer(cyl(0.05, 0.16, 0.3, 0x1b5e20), 0, 0.98, 0));
  } else if (type === "branche") {
    for (let i = 0; i < 4; i++) { const l = placer(cyl(0.08, 0.08, 1.6, 0x8b5a2b), rnd(-0.2, 0.2), 0.12 + i * 0.12, rnd(-0.2, 0.2)); l.rotation.z = Math.PI / 2; l.rotation.y = rnd(-0.5, 0.5); g.add(l); }
    for (const x of [-0.5, 0, 0.5]) g.add(placer(sph(0.28, 0x22c55e), x, 0.5, 0));
  } else if (type.startsWith("bonus")) { // bonus 3D : aimant, x2, super-saut, vie
    const k = type.slice(6), ic = new THREE.Group(), cols = { aimant: 0xef4444, double: 0xf59e0b, saut: 0x8b5cf6, vie: 0xec4899 };
    ic.add(new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), new THREE.MeshBasicMaterial({ color: cols[k], transparent: true, opacity: 0.28 })));
    if (k === "aimant") { // aimant en fer à cheval
      ic.add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 10, 18, Math.PI), M(0xef4444, 0x550000)));
      for (const sd of [-1, 1]) ic.add(placer(cyl(0.1, 0.1, 0.3, 0xef4444), sd * 0.3, -0.15, 0), placer(cyl(0.105, 0.105, 0.1, 0xe5e7eb), sd * 0.3, -0.33, 0));
    } else if (k === "double") { // "x2" en lettres 3D
      if (fontJeu) { const tg = new THREE.TextGeometry("x2", { font: fontJeu, size: 0.5, height: 0.2, curveSegments: 5, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }); tg.center(); ic.add(new THREE.Mesh(tg, M(0xf59e0b, 0x6b3d00))); }
      else ic.add(box(0.5, 0.5, 0.2, 0xf59e0b));
    } else if (k === "saut") { // flèche vers le haut
      ic.add(placer(new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.45, 12), M(0x8b5cf6, 0x2e1065)), 0, 0.2, 0), placer(cyl(0.12, 0.12, 0.4, 0x8b5cf6), 0, -0.15, 0));
    } else { // coeur
      const h = new THREE.Mesh(coeurGeo(), M(0xff3b4e, 0x55000a)); h.scale.setScalar(0.45); ic.add(h);
    }
    ic.position.y = 0.9; g.add(ic);
  } else if (type === "rampe") { // rampe qui mène au toit d'un bus (3,2 de long)
    const sh = new THREE.Shape(); sh.moveTo(-1.6, 0); sh.lineTo(1.6, 0); sh.lineTo(1.6, BUS_H); sh.lineTo(-1.6, 0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 1.5, bevelEnabled: false }); geo.translate(0, 0, -0.75);
    const r = new THREE.Mesh(geo, M(0x94a3b8)); r.rotation.y = Math.PI / 2; r.castShadow = true; g.add(r);
  } else if (type === "bus") { // gros obstacle : change de voie... ou saute sur le toit !
    const cb = [0xfacc15, 0xf97316, 0x38bdf8, 0x4ade80][Math.floor(Math.random() * 4)];
    g.add(placer(box(1.7, 1.2, 3.2, cb), 0, 0.8, 0));
    g.add(placer(box(1.74, 0.4, 3.0, 0x1e3a8a), 0, 1.0, 0));
    g.add(placer(box(1.5, 0.04, 2.9, 0xfde68a), 0, 1.41, 0));
    g.add(placer(box(1.2, 0.5, 0.06, 0x93c5fd), 0, 1.0, 1.62));
    for (const x of [-0.82, 0.82]) for (const z of [-1.0, 1.0]) { const r = placer(cyl(0.3, 0.3, 0.2, 0x111827), x, 0.3, z); r.rotation.z = Math.PI / 2; g.add(r); }
  } else { // barrière : on glisse dessous
    for (const x of [-1.05, 1.05]) g.add(placer(box(0.14, 1.6, 0.14, 0x6b4f3a), x, 0.8, 0));
    g.add(placer(box(2.3, 0.35, 0.2, 0xf97316), 0, 1.45, 0), placer(box(0.5, 0.36, 0.22, 0xffffff), -0.6, 1.45, 0), placer(box(0.5, 0.36, 0.22, 0xffffff), 0.6, 1.45, 0));
  }
  return g;
}

// ---------- Décor : ambiances, lampadaires, nuages, tunnel, pont ----------
const CIEL = {
  jour:     { ciel: 0x7ccfff, brume: 0x9fdcff, hemi: 0.9,  soleil: 0.9,  herbe: 0x6fc46a, lueur: 0x000000, nuage: 0xffffff, near: 45, far: 150 },
  couchant: { ciel: 0xff9a62, brume: 0xffb58a, hemi: 0.75, soleil: 0.8,  herbe: 0x6a9f55, lueur: 0x2a1c08, nuage: 0xffc9a8, near: 45, far: 150 },
  nuit:     { ciel: 0x0c1535, brume: 0x16204a, hemi: 0.45, soleil: 0.3,  herbe: 0x2c5a3a, lueur: 0xffd27a, nuage: 0x2a3560, near: 35, far: 130 },
  tunnel:   { ciel: 0x1a1a22, brume: 0x22222c, hemi: 0.55, soleil: 0.15, herbe: 0x4a7f46, lueur: 0x000000, nuage: 0x555566, near: 20, far: 100 },
  pont:     { ciel: 0x8fd8ff, brume: 0xb5e6ff, hemi: 0.95, soleil: 0.95, herbe: 0x2f9be0, lueur: 0x000000, nuage: 0xffffff, near: 45, far: 150 }
};
const EVENEMENTS = [[16, "tunnel"], [40, "pont"], [62, "tunnel"]]; // secondes dans un cycle de 90 s
const tmpC = new THREE.Color();
const matLampe = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0x000000 });
const matNuage = new THREE.MeshBasicMaterial({ color: 0xffffff });
const matAstre = new THREE.MeshBasicMaterial({ color: 0xfff2a8, fog: false });
const ASTRE = { jour: 0xfff2a8, couchant: 0xff8a3d, nuit: 0xdfe6ff, tunnel: 0xfff2a8, pont: 0xfff2a8 };
const matTunnel = new THREE.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xfff1b0 });

function decorPlus() {
  const astre = new THREE.Mesh(new THREE.SphereGeometry(7, 20, 14), matAstre); astre.position.set(45, 46, -190); scene.add(astre); // soleil / lune
  for (const s of [-1, 1]) for (let i = 0; i < 12; i++) { // lampadaires
    const l = new THREE.Group();
    l.add(placer(cyl(0.06, 0.08, 3.4, 0x475569), 0, 1.7, 0), placer(box(0.7, 0.07, 0.07, 0x475569), -s * 0.32, 3.4, 0), placer(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.28), matLampe), -s * 0.6, 3.32, 0));
    l.traverse(o => { o.castShadow = false; });
    l.position.set(s * 4.0, 0, 8 - i * 14); scene.add(l); lampes.push(l);
  }
  for (let i = 0; i < 10; i++) { // nuages
    const c = new THREE.Group();
    for (const [x, y, sc] of [[0, 0, 1], [3, 0.6, 0.8], [-3, 0.4, 0.9]]) { const m = new THREE.Mesh(new THREE.SphereGeometry(3 * sc, 10, 8), matNuage); m.position.set(x, y, 0); m.scale.y = 0.55; c.add(m); }
    c.position.set(rnd(-70, 70), rnd(26, 42), -rnd(40, 200)); scene.add(c); nuages.push(c);
  }
}

function creerStruct(n, esp, construire) { // pool de segments (tunnel, pont)
  const S = { n, esp, liste: [] };
  for (let i = 0; i < n; i++) { const g = new THREE.Group(); construire(g, i); g.traverse(o => { o.castShadow = false; }); g.visible = false; g.position.z = 200; scene.add(g); S.liste.push(g); }
  return S;
}
function creerStructs() {
  structs.tunnel = creerStruct(16, 8, g => {
    for (const s of [-1, 1]) { g.add(placer(box(0.4, 5, 8, 0x64748b), s * 3.7, 2.5, 0)); g.add(placer(box(0.42, 0.5, 8.02, 0xfacc15), s * 3.7, 0.9, 0)); }
    g.add(placer(box(8, 0.4, 8, 0x475569), 0, 5.2, 0));
    g.add(placer(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.6), matTunnel), 0, 4.95, 0));
  });
  structs.pont = creerStruct(30, 4, (g, i) => {
    for (const s of [-1, 1]) {
      g.add(placer(box(0.12, 1.1, 0.12, 0xe5e7eb), s * 3.45, 0.55, 1.5), placer(box(0.12, 1.1, 0.12, 0xe5e7eb), s * 3.45, 0.55, -1.5));
      g.add(placer(box(0.1, 0.1, 4, 0xf8fafc), s * 3.45, 1.1, 0), placer(box(0.08, 0.08, 4, 0xf8fafc), s * 3.45, 0.6, 0));
      if (i % 10 === 0) g.add(placer(box(0.4, 9, 0.4, 0xef4444), s * 3.6, 4.5, 0)); // pylônes rouges
    }
    if (i % 10 === 0) g.add(placer(box(7.6, 0.4, 0.4, 0xef4444), 0, 9, 0));
  });
}
function lancerStruct(n) {
  const S = structs[n]; if (S.liste.some(g => g.visible)) return;
  S.liste.forEach((g, i) => { g.position.z = -150 - i * S.esp; g.visible = true; });
  annoncer(n === "tunnel" ? "TUNNEL !" : "PONT !", "#ffe066");
}
function defiler(S, d) { for (const g of S.liste) if (g.visible) { g.position.z += d; if (g.position.z > 12) g.visible = false; } }
function resetStructs() { for (const k in structs) structs[k].liste.forEach(g => { g.visible = false; }); }
function dansStruct(S) { return S.liste.some(g => g.visible && g.position.z > -30 && g.position.z < 8); }

function zoneActuelle() {
  if (dansStruct(structs.tunnel)) return "tunnel";
  if (dansStruct(structs.pont)) return "pont";
  if (!enCours) return "jour";
  const c = tEcoule % 84; return c < 30 ? "jour" : c < 48 ? "couchant" : c < 76 ? "nuit" : "jour";
}
function majAmbiance(dt) {
  const z = zoneActuelle(), C = CIEL[z], k = Math.min(1, dt * 1.6);
  matAstre.color.lerp(tmpC.setHex(ASTRE[z]), k);
  scene.background.lerp(tmpC.setHex(C.ciel), k); scene.fog.color.lerp(tmpC.setHex(C.brume), k);
  scene.fog.near += (C.near - scene.fog.near) * k; scene.fog.far += (C.far - scene.fog.far) * k;
  hemi.intensity += (C.hemi - hemi.intensity) * k; soleil.intensity += (C.soleil - soleil.intensity) * k;
  herbes.forEach(h => h.material.color.lerp(tmpC.setHex(C.herbe), k));
  batiments.forEach(b => b.material.emissive.lerp(tmpC.setHex(C.lueur), k));
  matLampe.emissive.lerp(tmpC.setHex(C.lueur), k); matNuage.color.lerp(tmpC.setHex(C.nuage), k);
}

// ---------- Particules (étincelles) ----------
const parts = [];
for (let i = 0; i < 50; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  m.visible = false; scene.add(m); parts.push({ m, vx: 0, vy: 0, vz: 0, t: 0 });
}
function etincelles(x, y, z, col, n) {
  let k = 0;
  for (const p of parts) {
    if (p.t > 0) continue;
    p.t = 0.6; p.m.visible = true; p.m.material.color.setHex(col); p.m.position.set(x, y, z);
    p.vx = rnd(-3, 3); p.vy = rnd(2, 6); p.vz = rnd(-3, 3);
    if (++k >= n) break;
  }
}
function majParts(dt, v) {
  for (const p of parts) {
    if (p.t <= 0) continue;
    p.t -= dt; p.vy -= 15 * dt;
    p.m.position.x += p.vx * dt; p.m.position.y = Math.max(0, p.m.position.y + p.vy * dt); p.m.position.z += (p.vz + v) * dt;
    if (p.t <= 0) p.m.visible = false;
  }
}

// ---------- Poursuivant : inspecteur + chien ----------
function creerPoursuivant() {
  const g = new THREE.Group(), add = (m, x, y, z) => { g.add(placer(m, x, y, z)); return m; };
  const pv = (x, y) => { const q = new THREE.Group(); q.position.set(x, y, 0); g.add(q); return q; };
  const jl = pv(-0.16, 0.9), jr = pv(0.16, 0.9), bl = pv(-0.42, 1.65), br = pv(0.42, 1.65);
  for (const j of [jl, jr]) j.add(placer(cyl(0.12, 0.1, 0.85, 0x1e3a8a), 0, -0.42, 0), placer(box(0.3, 0.16, 0.46, 0x111827), 0, -0.85, -0.06));
  for (const b of [bl, br]) b.add(placer(cyl(0.09, 0.08, 0.7, 0x1d4ed8), 0, -0.35, 0), placer(sph(0.09, 0xf1c9a5), 0, -0.74, 0));
  add(cyl(0.34, 0.28, 0.9, 0x1d4ed8), 0, 1.35, 0);
  add(box(0.5, 0.1, 0.1, 0xfacc15), 0, 1.45, -0.28);
  add(sph(0.38, 0xf1c9a5), 0, 2.1, 0);
  add(cyl(0.42, 0.45, 0.1, 0x1e3a8a), 0, 2.38, 0); add(cyl(0.3, 0.42, 0.18, 0x1e3a8a), 0, 2.5, 0);
  add(box(0.5, 0.05, 0.3, 0x111827), 0, 2.32, -0.38);
  const ch = new THREE.Group(); ch.position.set(1.1, 0, 0.4); g.add(ch); // le chien
  ch.add(placer(box(0.5, 0.45, 1.0, 0x92400e), 0, 0.65, 0), placer(box(0.38, 0.38, 0.4, 0xb45309), 0, 0.95, -0.62), placer(box(0.2, 0.15, 0.2, 0x1f2937), 0, 0.9, -0.88));
  const queue = placer(cyl(0.04, 0.06, 0.5, 0x92400e), 0, 0.9, 0.62); queue.rotation.x = -0.6; ch.add(queue);
  const pat = [];
  for (const [x, z] of [[-0.18, -0.35], [0.18, -0.35], [-0.18, 0.35], [0.18, 0.35]]) { const q = new THREE.Group(); q.position.set(x, 0.45, z); ch.add(q); q.add(placer(box(0.12, 0.45, 0.12, 0x7c2d12), 0, -0.22, 0)); pat.push(q); }
  g.userData.membres = [jl, jr, bl, br]; g.userData.pattes = pat;
  return g;
}

// ---------- Objets ----------
function ajouter(type, voie, dz, y) {
  const g = creerObjet3d(type), x = (voie - 1) * LW, z = -100 - (dz || 0);
  g.position.set(x, y || 0, z); scene.add(g);
  objets.push({ g, type, x, z, y: y || 0, bas: type === "sac" || type === "branche", haut: type === "barriere", prof: type === "bus" ? 1.65 : type === "rampe" ? 1.6 : 0.8 });
}

function retirer(o) {
  scene.remove(o.g);
  o.g.traverse(m => { if (m.geometry && !m.isSprite) m.geometry.dispose(); if (m.material) m.material.dispose(); });
}

function faireApparaitre() {
  if (enCours && Math.random() < 0.07) { // bonus : aimant, ×2, super-saut, vie
    const K = ["aimant", "double", "saut"]; if (vies < viesMax) K.push("vie");
    ajouter("bonus_" + K[Math.floor(Math.random() * K.length)], Math.floor(Math.random() * 3)); return;
  }
  if (enCours && Math.random() < 0.12) { // rame : rampe + 2 ou 3 bus + barils sur le toit
    const l = Math.floor(Math.random() * 3), nb = 2 + Math.floor(Math.random() * 2);
    ajouter("rampe", l, -3.2);
    for (let i = 0; i < nb; i++) ajouter("bus", l, i * 3.2);
    for (let j = 0; j < nb * 3; j++) ajouter("baril", l, j - 0.4, BUS_H);
    tSpawn = -((nb + 1) * 3.2 + 3) / cfg.v; return;
  }
  if (Math.random() < 0.25) { // file de barils (comme les pièces de Subway Surfers)
    const l = Math.floor(Math.random() * 3);
    for (let i = 0; i < 6; i++) ajouter("baril", l, i * 2.2);
    return;
  }
  const [a, b] = (enCours ? cfg : NIVEAUX.facile).blocs, T = ["poubelle", "sac", "branche", "barriere", "bus"];
  const n = a + Math.floor(Math.random() * (b - a + 1)), voies = [0, 1, 2].sort(() => Math.random() - 0.5);
  for (let i = 0; i < n; i++) {
    const t = T[Math.floor(Math.random() * T.length)]; ajouter(t, voies[i]);
    if (t === "bus" && Math.random() < 0.6) for (const d of [-1, 0, 1]) ajouter("baril", voies[i], d, BUS_H); // barils sur le toit
  }
  if (n < 3 && Math.random() < 0.5) ajouter("baril", voies[n]);
}

// ---------- Boucle de jeu ----------
function supportH(y) { // hauteur de la surface sous le joueur : sol, rampe ou toit d'un bus
  let s = 0;
  for (const o of objets) {
    if (Math.abs(o.x - joueur.position.x) > 0.8) continue;
    if (o.type === "bus" && Math.abs(o.z) < 1.65 && y >= BUS_H - 0.5) s = Math.max(s, BUS_H);
    else if (o.type === "rampe" && Math.abs(o.z) <= 1.6) { const h = BUS_H * Math.min(1, Math.max(0, (o.z + 1.6) / 3.2)); if (y >= h - 0.5) s = Math.max(s, h); }
  }
  return s;
}

function prendreBonus(k) {
  if (k === "vie") vies = Math.min(viesMax, vies + 1); else bonus[k] = DUREES[k] + 2 * sauv.up[k];
}

function annoncer(t, col) { ecrire(ui.msg, [[t, 0.55, col || "#ffffff"]]); ui.msg.visible = true; tMsg = 1.6; }

function heurter(o) { // collision : trébuchement, le poursuivant se rapproche (attrapé s'il était déjà proche)
  const pris = dCible < 7;
  vies -= pris ? 2 : 1;
  secousse = pris ? 0.55 : 0.3; trebuche = 0.7; invul = 1.5;
  dCible = pris ? 1.8 : 3.4;
  son("choc"); etincelles(o.x, 0.8, 0, 0xcbd5e1, 14);
  if (pris) annoncer("ATTRAPÉ !", "#ff7b7b");
}

function mourir(titre) { // chute puis écran de fin
  if (mortT >= 0) return;
  mortT = 0; mortTitre = titre; trebuche = 0; invul = 0; dCible = Math.min(dCible, 2.5); son("chute");
}

function maj(dt) {
  majUI(dt);
  musique();
  const mort = mortT >= 0;
  const P = PERSOS[perso], p = enCours ? rythme() : 0;
  let v = enCours ? cfg.v * (1 + (cfg.infini ? 0.8 : 0.4) * p) : 6;
  if (trebuche > 0) v *= 0.6;
  if (mort) v *= Math.max(0, 1 - mortT * 1.8);
  const spawn = enCours ? cfg.spawn * (1 - (cfg.infini ? 0.45 : 0.35) * p) : 1.1;
  let hauteur = 0;

  const pont = structs.pont.liste.some(g => g.visible);
  tirets.forEach(t => { t.position.z += v * dt; if (t.position.z > 10) t.position.z -= 156; });
  batiments.forEach(b => { b.position.z += v * dt; if (b.position.z > 14) { placerBatiment(b, b.position.z - 168); b.visible = !pont; } });
  arbres.forEach(t => { t.position.z += v * dt; if (t.position.z > 12) { placerArbre(t, t.position.z - 150); t.visible = !pont; } });
  lampes.forEach(l => { l.position.z += v * dt; if (l.position.z > 12) l.position.z -= 168; });
  nuages.forEach(c => { c.position.z += v * dt * 0.25; if (c.position.z > 30) c.position.z -= 230; });
  for (const k in structs) defiler(structs[k], v * dt);
  majParts(dt, v); majAmbiance(dt);
  if (tMsg > 0) { tMsg -= dt; if (tMsg <= 0) ui.msg.visible = false; }

  if (enCours && !mort) {
    tEcoule += dt;
    const c = tEcoule % 90;
    if (c < cPrec) cPrec = -1;
    for (const [t0, n] of EVENEMENTS) if (cPrec < t0 && c >= t0) lancerStruct(n);
    cPrec = c;
    dCible = Math.min(30, dCible + dt * 0.7);
    for (const k in bonus) bonus[k] = Math.max(0, bonus[k] - dt);
    if (trebuche > 0) trebuche = Math.max(0, trebuche - dt);
    if (invul > 0) invul -= dt;
    if (Math.floor(tEcoule) !== dernier) { dernier = Math.floor(tEcoule); majHud(); }
    if (cmd === "g") lane = Math.max(0, lane - 1);
    if (cmd === "d") lane = Math.min(2, lane + 1);
    const sol0 = supportH(joueur.position.y), auSol = vy <= 0 && joueur.position.y <= sol0 + 0.02;
    if (cmd === "h" && auSol) { vy = bonus.saut > 0 ? 12 : 8.2; glisse = -1; son("saut"); compter("saut"); }
    if (cmd === "b" && glisse < 0 && auSol && sol0 === 0) { glisse = 0; son("glisse"); compter("glisse"); }
    if (tEcoule >= cfg.temps) { cmd = ""; return fin("TEMPS ÉCOULÉ", false); }
  }
  if (mort) mortT += dt;
  cmd = "";

  joueur.position.x += ((lane - 1) * LW - joueur.position.x) * Math.min(1, dt * 14);
  if (enCours) { // gravité : saut, atterrissage au sol, sur une rampe ou sur le toit d'un bus
    const s = supportH(joueur.position.y);
    vy -= 22 * dt;
    let y = joueur.position.y + vy * dt;
    if (y <= s && vy <= 0) { y = s; vy = 0; }
    hauteur = y;
    const toit = y >= BUS_H - 0.02 && s >= BUS_H - 0.02;
    if (toit && !wasRoof && !mort) { compter("toit"); son("toit"); etincelles(joueur.position.x, y, 0, 0xffffff, 6); }
    wasRoof = toit;
  } else vy = 0;
  if (glisse >= 0) { glisse += dt; if (glisse >= 0.65) glisse = -1; }
  joueur.position.y = hauteur;
  joueur.scale.y = glisse >= 0 ? 0.55 : 1;
  if (trebuche > 0) joueur.rotation.x = -0.6 * Math.sin(Math.PI * (1 - trebuche / 0.7)); // trébuchement
  else joueur.rotation.x = mort ? -Math.min(1, mortT / 0.35) * 1.45 : 0;                 // chute finale
  joueur.visible = enCours && (invul <= 0 || Math.floor(temps * 14) % 2 === 0);
  const a = Math.sin(temps * 13) * 0.9, mb = joueur.userData.membres;
  if (mb) { mb[0].rotation.x = a; mb[1].rotation.x = -a; mb[2].rotation.x = -a; mb[3].rotation.x = a; }
  else if (joueur.userData.corps) { // modèle .glb : petit rebond de course
    joueur.userData.corps.position.y = Math.abs(Math.sin(temps * 13)) * 0.08; joueur.userData.corps.rotation.z = Math.sin(temps * 6.5) * 0.05;
  }

  dChase += (dCible - dChase) * Math.min(1, dt * 5); // le poursuivant arrive derrière le joueur
  poursuivant.visible = enCours && dChase < 9;
  if (poursuivant.visible) {
    const m = poursuivant.userData.membres, q = poursuivant.userData.pattes, b = Math.sin(temps * 12) * 0.9;
    poursuivant.position.x += (joueur.position.x - poursuivant.position.x) * Math.min(1, dt * 4);
    poursuivant.position.z = dChase; poursuivant.position.y = Math.abs(Math.sin(temps * 12)) * 0.08;
    m[0].rotation.x = b; m[1].rotation.x = -b; m[2].rotation.x = -b; m[3].rotation.x = b;
    q[0].rotation.x = b; q[3].rotation.x = b; q[1].rotation.x = -b; q[2].rotation.x = -b;
  }

  secousse = Math.max(0, secousse - dt);
  camBase += (3.4 + hauteur * 0.45 - camBase) * Math.min(1, dt * 6);
  camera.position.x += (joueur.position.x * 0.5 - camera.position.x) * Math.min(1, dt * 5);
  camera.position.y = camBase + Math.sin(temps * 60) * secousse * 0.6;
  camera.lookAt(camera.position.x * 0.5, 1.3 + hauteur * 0.3, -6);

  if (!mort) { tSpawn += dt; if (tSpawn >= spawn) { tSpawn = 0; faireApparaitre(); } }

  for (let i = objets.length - 1; i >= 0; i--) {
    const o = objets[i], ram = o.type === "baril" || o.type.startsWith("bonus");
    o.z += v * dt;
    if (o.type === "baril" && enCours && !mort && bonus.aimant > 0 && !o.y && o.z > -10 && o.z < 1) o.x += (joueur.position.x - o.x) * Math.min(1, dt * 5); // aimant
    o.g.position.set(o.x, o.y, o.z);
    if (o.type === "baril") o.g.rotation.y += dt * 2.5;
    else if (ram) { const ic = o.g.children[0]; ic.position.y = 0.9 + Math.sin(temps * 4 + o.x) * 0.15; ic.rotation.y += dt * 2.2; }
    const touche = enCours && !mort && o.type !== "rampe" && o.z > -o.prof && o.z < o.prof &&
      Math.abs(o.x - joueur.position.x) < (ram ? P.aimant : P.solide) * LW &&
      !(o.bas && hauteur > 0.8) && !(o.haut && glisse >= 0) &&
      !(o.type === "bus" && hauteur >= BUS_H - 0.5) &&
      !(o.y && hauteur < o.y - 0.7) && (ram || invul <= 0);
    if (touche) {
      retirer(o); objets.splice(i, 1);
      if (o.type === "baril") { score += 10 * cfg.multi * (bonus.double > 0 ? 2 : 1); barils++; compter("baril"); son("baril"); etincelles(o.x, 0.8 + o.y, 0, 0xffd23f, 5); }
      else if (ram) { prendreBonus(o.type.slice(6)); compter("bonus"); son("bonus"); etincelles(o.x, 1, 0, 0xffffff, 10); }
      else heurter(o);
      majHud();
      if (vies <= 0) mourir(cfg.infini ? "COURSE TERMINÉE" : "GAME OVER");
      else if (score >= cfg.but) return fin("PLANÈTE SAUVÉE", true);
    } else if (o.z > 5 + o.prof) { retirer(o); objets.splice(i, 1); }
  }
  if (mort && mortT > 1.3) { mortT = -1; return fin(mortTitre, false); }
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
const ui = {}, hud = new THREE.Group(), menuG = new THREE.Group(), finG = new THREE.Group(), chargG = new THREE.Group(), boutiqueG = new THREE.Group(), missionsG = new THREE.Group(), popG = new THREE.Group();

function montrer(e) {
  etat = e; enCours = e === "jeu";
  hud.visible = enCours; menuG.visible = e === "menu"; finG.visible = e === "fin"; chargG.visible = e === "chargement";
  boutiqueG.visible = e === "boutique"; missionsG.visible = e === "missions";
  if (e === "menu") { majMenu(); majSon(); } if (e === "boutique") majBoutique(); if (e === "missions") majMissions();
  joueur.visible = enCours;
}

function lancer() {
  cfg = NIVEAUX[niv];
  objets.forEach(retirer); objets = [];
  viesMax = cfg.vies + (sauv.vieBonus ? 1 : 0);
  score = 0; barils = 0; vies = viesMax; tEcoule = 0; tSpawn = 0; dernier = -1; lane = 1; vy = 0; glisse = -1; camBase = 3.4; bonus.aimant = bonus.double = bonus.saut = 0;
  trebuche = 0; invul = 0; mortT = -1; dChase = dCible = 30; tMsg = 0; wasRoof = false; cPrec = 0; resetStructs(); ui.msg.visible = false;
  appliquerPerso(); majHud(); montrer("jeu");
}

function fin(titre, gagne) {
  const avant = meilleur(), hist = historique(), rec = +localStorage.getItem("barilRecordInfini") || 0;
  hist.unshift({ score, niveau: niv, date: new Date().toLocaleDateString("fr-FR") });
  localStorage.setItem("ecoScores", JSON.stringify(hist.slice(0, 8)));
  localStorage.setItem("ecoXP", xpTotal() + Math.round(score / 10));
  if (score > avant) localStorage.setItem("ecoMeilleur", score);
  const record = cfg.infini && score > rec;
  if (record) localStorage.setItem("barilRecordInfini", score);
  const gain = barils + (gagne ? 25 : 0), coffres = Math.floor(score / 2000);
  sauv.pieces += gain; sauv.coffres += coffres; compter("partie", 1); sauver();
  const nouveaux = Object.values(PERSOS).filter(q => q.seuil > avant && q.seuil <= score).map(q => q.nom);
  ecrire(ui.fin, [[record ? "RECORD BATTU !" : titre, 0.3, gagne || record ? "#8cf56a" : "#ff7b7b"], [score + " pts · " + barils + " barils ramassés", 0.15], [
    nouveaux.length ? "🔓 Personnage débloqué : " + nouveaux.join(", ") : (cfg.infini ? "Record : " + Math.max(rec, score) + " pts" : (gagne ? "Moins de pollution, plus de vie !" : "La planète a encore besoin de toi.")), 0.13, "#cfe9ff"],
    ["+" + gain + " 🪙" + (coffres ? "  ·  📦 +" + coffres : ""), 0.13, "#ffe066"]]);
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
  ui.score = mk(1.9, 0.75); ui.temps = mk(1.5, 0.75); ui.vies = mk(2.6, 0.8); ui.planete = mk(2.6, 0.95); ui.barils = mk(2.1, 0.85); ui.bonus = mk(3.2, 0.55); ui.msg = mk(4.4, 0.8); ui.msg.visible = false;
  const gc = coeurGeo(); ui.mCoeur = new THREE.MeshStandardMaterial({ color: 0xff3b4e, emissive: 0x55000a }); ui.mVide = M(0x555b66);
  ui.coeurs = [];
  for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(gc, ui.mCoeur); c.scale.setScalar(0.3); c.position.set(0, -0.12, 0.16); ui.vies.add(c); ui.coeurs.push(c); }
  const gb = new THREE.BoxGeometry(2.0, 0.14, 0.1); gb.translate(1.0, 0, 0);
  const fond = new THREE.Mesh(gb, M(0x0a1630)); fond.position.set(-1.0, -0.3, 0.09); ui.planete.add(fond);
  ui.barre = new THREE.Mesh(gb, new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x1c6b36 })); ui.barre.position.set(-1.0, -0.3, 0.14); ui.planete.add(ui.barre);
  ui.globe = new THREE.Group(); ui.globe.add(sph(0.2, 0x2b8be8), placer(sph(0.1, 0x3fbf5a), 0.1, 0.06, 0.12));
  ui.globe.position.set(-1.05, 0.12, 0.2); ui.planete.add(ui.globe);
  ui.iconeBaril = creerObjet3d("baril"); ui.iconeBaril.scale.setScalar(0.5); ui.iconeBaril.position.set(-0.8, -0.3, 0.2); ui.barils.add(ui.iconeBaril);
}

function majHud() {
  const sec = cfg.infini ? Math.floor(tEcoule) : Math.max(0, Math.ceil(cfg.temps - tEcoule)), q = avancement() * 100;
  ecrire(ui.score, [["SCORE", 0.2, "#9fd3ff"], [String(score), 0.42], [cfg.infini ? "RECORD " + Math.max(score, +localStorage.getItem("barilRecordInfini") || 0) : "/ " + cfg.but + " pts", 0.2, "#9fd3ff"]]);
  ecrire(ui.temps, [[Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"), 0.5], [niv.toUpperCase() + " ×" + cfg.multi, 0.2, "#9fd3ff"]]);
  ecrire(ui.vies, [["VIES", 0.24, "#9fd3ff"], ["", 0.5]]);
  ui.coeurs.forEach((c, i) => { c.visible = i < viesMax; c.position.x = (i - (viesMax - 1) / 2) * Math.min(0.46, 2.2 / Math.max(1, viesMax)); c.material = i < vies ? ui.mCoeur : ui.mVide; });
  ecrire(ui.planete, [["HÉROS · " + PERSOS[perso].nom.toUpperCase(), 0.2, "#7dfbd2"], ["PLANÈTE SAUVÉE  " + Math.round(q) + "%", 0.24], ["", 0.3]]);
  ui.barre.scale.x = Math.max(0.001, q / 100);
  ecrire(ui.barils, [["BARILS RAMASSÉS", 0.2, "#9fd3ff"], [cfg.infini ? String(barils) : barils + " / " + cfg.but / (10 * cfg.multi), 0.42]]);
  const act = [];
  if (bonus.aimant > 0) act.push("🧲 " + Math.ceil(bonus.aimant) + "s");
  if (bonus.double > 0) act.push("×2 " + Math.ceil(bonus.double) + "s");
  if (bonus.saut > 0) act.push("⬆ " + Math.ceil(bonus.saut) + "s");
  ui.bonus.visible = act.length > 0;
  if (act.length) ecrire(ui.bonus, [[act.join("   "), 0.5, "#ffe066"]]);
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
  ecrire(ui.pieces, [["🪙 " + sauv.pieces, 0.4, "#ffe066"]]);
  for (const k in ui.niveaux) ecrire(ui.niveaux[k], ui.niveaux[k].userData.lignes, k === niv ? "#d79a00" : "#14407a");
}

const ORDRE = ["simple", "moyen", "expert", "momie", "jet", "zip"]; let pagePerso = 0;
function majPersos() { // les personnages en 3D sur leurs socles (3 par page)
  ui.d.clear();
  bouton(ui.d, 1.6, 0.4, 0, -2.08, 0x14407a, [["◀ ▶ PERSOS", 0.4]], () => { pagePerso = 1 - pagePerso; majPersos(); });
  ORDRE.slice(pagePerso * 3, pagePerso * 3 + 3).forEach((k, i) => {
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
  ["facile", "moyen", "difficile", "infini"].forEach((k, i) => {
    ui.niveaux[k] = bouton(ui.g, 0.96, 0.85, (i - 1.5) * 1.0, -0.95, 0x14407a, [[k.toUpperCase(), 0.21], [NIVEAUX[k].infini ? "∞ SANS FIN" : "×" + NIVEAUX[k].multi + " · " + NIVEAUX[k].but, 0.17, "#cfe9ff"]], () => { niv = k; majMenu(); });
  });
  bouton(ui.g, 0.96, 0.62, -1.5, -1.85, 0x14407a, [["CARRIÈRE", 0.27]], () => {
    const h = historique();
    info(["SCORES DES PARTIES", ""].concat(h.length ? h.map((q, i) => (i + 1) + ". " + q.score + " pts · " + q.niveau + " · " + q.date) : ["Aucune partie jouée"]));
  });
  bouton(ui.g, 0.96, 0.62, 1.5, -1.85, 0x14407a, [["COMMANDES", 0.24]], () => info(["COMMANDES", "", "← → ou Q D : changer de voie", "↑ ou Z ou ESPACE : sauter", "↓ ou S : glisser sous les barrières", "Téléphone : glisse le doigt", "Prends les rampes : barils sur les bus !", "Évite poubelles, sacs, branches", "Un poursuivant te rattrape si tu te cognes", "M : couper le son"]));
  bouton(ui.g, 0.96, 0.62, -0.5, -1.85, 0x14407a, [["MISSIONS", 0.27]], () => montrer("missions"));
  bouton(ui.g, 0.96, 0.62, 0.5, -1.85, 0x14407a, [["BOUTIQUE", 0.27]], () => montrer("boutique"));
  ui.pieces = bouton(ui.g, 0.96, 0.5, -1.5, 0.9, 0x14407a, [["", 0.4]], () => {});
  ui.son = bouton(ui.g, 0.62, 0.5, 1.5, 0.9, 0x14407a, [["🔊", 0.6]], basculerSon);
  ui.info = bouton(popG, 5, 3, 0, 0, 0x0b2a5e, [], () => { ui.info.visible = false; });
  ui.info.position.z = 0.8; ui.info.visible = false;
  if (THREE.FontLoader && THREE.TextGeometry) { // titre en lettres 3D
    new THREE.FontLoader().load("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json", f => {
      fontJeu = f;
      [["BARIL", 0xffb020, 1.85, 0.5], ["RUNNER", 0x35d44a, 1.3, 0.4]].forEach(([t, coul, y, s]) => {
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

function construireBoutique() {
  ui.bHead = bouton(boutiqueG, 5, 0.7, 0, 1.85, 0x0b2a5e, [["BOUTIQUE", 0.55]], () => {});
  ui.bItems = [];
  const items = [...SKINS.map(s => ({ t: "skin", s })), ...AMELIO.map(a => ({ t: "up", a })), { t: "vie" }];
  items.forEach((it, i) => { it.m = bouton(boutiqueG, 1.65, 0.85, (i % 3 - 1) * 1.75, 0.9 - Math.floor(i / 3) * 0.95, 0x14407a, [["·", 0.3]], () => acheter(it)); ui.bItems.push(it); });
  bouton(boutiqueG, 2.3, 0.6, 0, -1.9, 0x1fa83a, [["RETOUR", 0.5]], () => { majPersos(); montrer("menu"); });
}

function majBoutique() {
  ecrire(ui.bHead, [["BOUTIQUE · 🪙 " + sauv.pieces, 0.55, "#ffe066"]]);
  for (const it of ui.bItems) {
    let nom, etat, fond = "#14407a", col = "#ffffff";
    if (it.t === "skin") {
      const poss = sauv.skins.includes(it.s.id); nom = it.s.nom;
      if (it.s.haut) col = "#" + it.s.haut.toString(16).padStart(6, "0");
      etat = sauv.skin === it.s.id ? "ÉQUIPÉ" : poss ? "ÉQUIPER" : "🪙 " + it.s.prix;
      fond = sauv.skin === it.s.id ? "#1fa83a" : poss ? "#2563eb" : sauv.pieces < it.s.prix ? "#3b4a66" : "#14407a";
    } else if (it.t === "up") {
      const l = sauv.up[it.a.k]; nom = it.a.nom;
      etat = l >= 3 ? "NIVEAU MAX" : "NIV " + l + " · 🪙 " + prixUp(it.a.k);
      fond = l >= 3 ? "#1fa83a" : sauv.pieces < prixUp(it.a.k) ? "#3b4a66" : "#14407a";
    } else {
      nom = "+1 VIE"; etat = sauv.vieBonus ? "ACHETÉ" : "🪙 1500";
      fond = sauv.vieBonus ? "#1fa83a" : sauv.pieces < 1500 ? "#3b4a66" : "#14407a";
    }
    ecrire(it.m, [[nom, 0.3, col], [etat, 0.24, "#cfe9ff"]], fond);
  }
}

function acheter(it) {
  const manque = prix => info(["Pas assez de pièces", "", "Il te faut " + prix + " 🪙", "Ramasse des barils !"]);
  if (it.t === "skin") {
    if (!sauv.skins.includes(it.s.id)) { if (sauv.pieces < it.s.prix) return manque(it.s.prix); sauv.pieces -= it.s.prix; sauv.skins.push(it.s.id); }
    sauv.skin = it.s.id; appliquerPerso(); majPersos();
  } else if (it.t === "up") {
    const p = prixUp(it.a.k); if (sauv.up[it.a.k] >= 3) return; if (sauv.pieces < p) return manque(p);
    sauv.pieces -= p; sauv.up[it.a.k]++;
  } else {
    if (sauv.vieBonus) return; if (sauv.pieces < 1500) return manque(1500);
    sauv.pieces -= 1500; sauv.vieBonus = true;
  }
  son("bonus"); sauver(); majBoutique();
}

function construireMissions() {
  bouton(missionsG, 5, 0.6, 0, 1.9, 0x0b2a5e, [["MISSIONS", 0.6]], () => {});
  ui.mis = [0, 1, 2].map(i => bouton(missionsG, 5, 0.7, 0, 1.05 - i * 0.8, 0x14407a, [["·", 0.3]], () => {}));
  ui.coffreBtn = bouton(missionsG, 3.4, 0.6, 0, -1.3, 0x1fa83a, [["📦 COFFRE", 0.4]], ouvrirCoffre);
  bouton(missionsG, 2.3, 0.55, 0, -1.95, 0x14407a, [["RETOUR", 0.5]], () => montrer("menu"));
}

function majMissions() {
  sauv.miss.forEach((idx, i) => {
    const m = MISSIONS[idx], pr = Math.min(m.n, sauv.prog[idx] || 0);
    ecrire(ui.mis[i], [[m.t, 0.4], [pr + " / " + m.n + "  ·  🪙 " + m.r + " + 📦", 0.26, "#cfe9ff"]], "#14407a");
  });
  ecrire(ui.coffreBtn, [["📦 OUVRIR UN COFFRE (" + sauv.coffres + ")", 0.4]], sauv.coffres > 0 ? "#1fa83a" : "#3b4a66");
}

function ouvrirCoffre() {
  if (sauv.coffres <= 0) return info(["Aucun coffre", "", "Termine des missions ou fais", "2000 points en une partie !"]);
  sauv.coffres--;
  const r = Math.random(), libres = SKINS.filter(s => !sauv.skins.includes(s.id)), ups = AMELIO.filter(a => sauv.up[a.k] < 3);
  let t;
  if (r < 0.15 && libres.length) { const s = libres[Math.floor(Math.random() * libres.length)]; sauv.skins.push(s.id); t = "Tenue " + s.nom + " débloquée !"; }
  else if (r < 0.35 && ups.length) { const a = ups[Math.floor(Math.random() * ups.length)]; sauv.up[a.k]++; t = a.nom + " niveau " + sauv.up[a.k] + " !"; }
  else { const g = 10 * Math.round(rnd(10, 40)); sauv.pieces += g; t = "+ " + g + " 🪙"; }
  sauver(); son("coffre"); majMissions(); info(["📦 COFFRE OUVERT !", "", t]);
}

function placerUI() { // adapte la position des éléments 3D à la taille de la fenêtre
  const a = camera.aspect, k = Math.tan(Math.PI / 6), s = Math.min(1, a / 1.8), t = Math.min(1, a / 1.5) * 0.85;
  menuG.position.z = -4; menuG.scale.setScalar(s); finG.position.z = -4; finG.scale.setScalar(s); chargG.position.z = -4;
  boutiqueG.position.z = -4; boutiqueG.scale.setScalar(s); missionsG.position.z = -4; missionsG.scale.setScalar(s); popG.position.z = -3.2; popG.scale.setScalar(Math.min(1, a * 0.7));
  ui.g.position.x = -k * 4 * a / s + 2.1; ui.d.position.x = k * 4 * a / s - 2.2;
  hud.position.z = -3; hud.scale.setScalar(t);
  const X = k * 3 * a / t, Y = k * 3 / t;
  ui.score.position.set(-X + 1.1, Y - 0.45, 0); ui.temps.position.set(0, Y - 0.45, 0); ui.vies.position.set(X - 1.5, Y - 0.5, 0);
  ui.planete.position.set(-X + 1.5, -Y + 0.6, 0); ui.barils.position.set(X - 1.2, -Y + 0.55, 0); ui.bonus.position.set(0, Y - 1.25, 0); ui.msg.position.set(0, Y - 2.3, 0);
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
  [hud, menuG, finG, chargG, boutiqueG, missionsG, popG].forEach(g => g.traverse(o => { if (o.userData.lignes) ecrire(o, o.userData.lignes); }));
  majPersos(); majMenu(); majHud();
}

// ---------- Souris, clavier, doigt ----------
const ray = new THREE.Raycaster(), souris = new THREE.Vector2();
function viser(e) {
  souris.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  camera.updateMatrixWorld(true); ray.setFromCamera(souris, camera);
  const cibles = [], col = o => { if (!o.visible) return; if (o.isMesh) cibles.push(o); o.children.forEach(col); };
  if (ui.info.visible) col(popG); else if (etat === "menu") col(menuG); else if (etat === "fin") col(finG); else if (etat === "boutique") col(boutiqueG); else if (etat === "missions") col(missionsG);
  const h = ray.intersectObjects(cibles, false)[0];
  let o = h && h.object;
  while (o && !(o.userData && o.userData.action)) o = o.parent;
  return o || null;
}
renderer.domElement.addEventListener("click", e => { const o = viser(e); if (o) o.userData.action(); });
renderer.domElement.addEventListener("pointermove", e => { survol = viser(e); renderer.domElement.style.cursor = survol ? "pointer" : "default"; });

addEventListener("keydown", e => {
  initAudio(); if (e.key.toLowerCase() === "m") basculerSon();
  const c = { arrowleft: "g", q: "g", arrowright: "d", d: "d", arrowup: "h", z: "h", " ": "h", arrowdown: "b", s: "b" }[e.key.toLowerCase()];
  if (c && enCours) { cmd = c; e.preventDefault(); }
});
addEventListener("pointerdown", e => { initAudio(); d0 = [e.clientX, e.clientY]; });
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
sol(); decor(); decorPlus(); creerStructs(); poursuivant = creerPoursuivant(); poursuivant.visible = false; scene.add(poursuivant); appliquerPerso();
scene.add(camera); camera.add(hud, menuG, finG, chargG, boutiqueG, missionsG, popG);
construireHud(); construireMenu(); construireFin(); construireCharg(); construireBoutique(); construireMissions();
majPersos(); majMenu(); majHud(); placerUI(); uiPret = true;
montrer("chargement");
chargerImages();
chargerModeles();
document.fonts.load("800 40px 'Baloo 2'").then(() => { fontsOk = true; }, () => { fontsOk = true; });
requestAnimationFrame(boucle);
