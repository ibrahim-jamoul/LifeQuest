// FICHIER GÉNÉRÉ — modifier les sources, puis lancer npm run build:standalone.

/* Reprise de la matrice LifeQuest_Matrice_Programme_6e_v1.xlsx (115 lignes).
 * Éléments transcrits : identifiant, famille, domaine, intitulé, priorité.
 * Programme officiel : le libellé de cette matrice est une cartographie éditoriale
 * LifeQuest, PAS une transcription certifiée exhaustive des BO.
 * Le responsable pédagogique doit valider la couverture et chaque activité. */
const RAW = `
MAT|Nombres|Valeur de position et grands nombres|P0;Nombres décimaux|P0;Comparer et ordonner des nombres|P0
MAT|Calcul|Addition / soustraction|P0;Multiplication|P0;Division|P0;Calcul mental et stratégies|P1
MAT|Résolution de problèmes|Problèmes à plusieurs étapes|P0
MAT|Fractions|Fraction comme partage|P0;Fraction comme nombre|P0;Fractions équivalentes|P0;Comparer des fractions|P0;Fraction d'une quantité|P0
MAT|Décimaux|Fractions décimales et écritures décimales|P0
MAT|Pourcentages|Pourcentages usuels|P0
MAT|Algèbre|Égalité et quantité inconnue|P0;Suites et régularités|P1
MAT|Grandeurs|Longueurs et périmètres|P0;Aires|P0;Volumes|P1
MAT|Temps|Durées et chronologie|P1
MAT|Géométrie|Angles et orientation|P0;Figures planes et propriétés|P1;Symétrie|P1
MAT|Espace|Solides, vues et patrons|P1
MAT|Données|Lire tableaux et graphiques|P0;Organiser et représenter des données|P1
MAT|Probabilités|Hasard et chance simple|P1
MAT|Proportionnalité|Relations proportionnelles|P0
MAT|Algorithmique|Instructions et décomposition|P0
FRA|Lecture|Fluidité|P0;Lecture à voix haute expressive|P1
FRA|Compréhension|Comprendre textes, documents et images|P0;Lire pour apprendre|P0
FRA|Culture littéraire|Récits des origines|P1;Poésie|P1;Théâtre et ruse|P1;Récit d'aventure|P0;Monstres et altérité|P1
FRA|Écriture|Écrire pour réfléchir et mémoriser|P0;Produire des écrits variés|P0
FRA|Oral|Écouter pour comprendre|P0;Expliquer clairement|P1;Échanger et argumenter|P1
FRA|Vocabulaire|Précision lexicale|P0;Réseaux de mots|P1
FRA|Orthographe|Orthographe lexicale|P1
FRA|Grammaire|Phrase simple et fonctions|P0;Phrase complexe et connecteurs|P1
FRA|Orthographe grammaticale|Accords|P0
HIS|Méthodes|Temps, frises et repères|P0;Sources, histoire et fiction|P0
HIS|Thème 1|Origines de l'humanité et migrations|P1;Révolution néolithique|P0;Premiers États et écritures|P0
HIS|Thème 2|Cités grecques|P1;Rome : mythe et histoire|P0;Naissance du monothéisme juif|P1
HIS|Thème 3|Empire romain et romanisation|P0;Christianisme dans l'Empire|P1;Relations entre mondes anciens|P1
GEO|Méthodes|Se repérer et changer d'échelle|P0
GEO|Thème 1|Habiter une métropole|P0;Ville de demain|P1
GEO|Thème 2|Espaces de faible densité|P1;Espaces agricoles|P1
GEO|Thème 3|Littoraux industrialo-portuaires|P1;Littoraux touristiques|P1
GEO|Thème 4|Répartition de la population mondiale|P0;Diversité des façons d'habiter|P1
SCI|Matière|États et propriétés|P0;Mélanges, dissolution, séparation|P1
SCI|Mouvement|Décrire un mouvement|P0
SCI|Énergie|Sources et conversions|P0
SCI|Information|Signaux et information|P0
SCI|Vivant|Diversité et classification|P0;Parentés et histoire du vivant|P1;Nutrition et échanges|P0;Développement et reproduction|P1;Besoins des plantes|P0
SCI|Technologie|Besoin et fonction d'un objet|P0;Matériaux et propriétés|P1;Fonctionnement d'un système|P0;Conception et prototype|P1
SCI|Terre|Terre dans le système solaire|P0;Météo et climat|P1
SCI|Environnement|Écosystèmes et interactions|P0;Impacts humains et solutions|P1
EMC|Démocratie|Représentation|P1;Intérêt général|P0
EMC|Règles|Finalité des règles|P0
EMC|Laïcité|Cadre scolaire et liberté de conscience|P1
EMC|Droits|Vie privée et données|P0;Droits et responsabilités|P1
LVE|Compréhension orale|Comprendre pour agir|P1
LVE|Interaction|Dialoguer|P1
LVE|Lecture|Comprendre textes courts|P1
LVE|Écriture|Écrire un message simple|P2
LVE|Culture|Vie quotidienne et société|P1;Arts, récits, lieux et imaginaires|P2
ART|Arts plastiques|Créer avec contraintes|P2;Observer et analyser|P2
ART|Éducation musicale|Écouter et comparer|P2;Produire / interpréter|P2
ART|Histoire des arts|Situer et relier œuvres|P2
EPS|Performance|Mesurer et progresser|P2
EPS|Déplacements|S'adapter à l'environnement|P2
EPS|Coopération/opposition|Stratégie et règles|P3
EPS|Expression|Créer une prestation|P3
EPS|Santé|Connaître son effort|P2
NUM|Information|Chercher et vérifier|P0
NUM|Données personnelles|Traces numériques|P0
NUM|Réseaux|Voyage de l'information|P0
NUM|Algorithmique|Instructions et debug|P0
NUM|Cybersécurité|Secrets et authentification|P1
`.trim();
const SUBJECTS = {
 MAT:{name:'Mathématiques',icon:'◇',tone:'gold',source:'https://www.education.gouv.fr/bo/2025/Hebdo16/MENE2504620A'},
 FRA:{name:'Français',icon:'✎',tone:'violet',source:'https://www.education.gouv.fr/bo/2025/Hebdo16/MENE2504620A'},
 HIS:{name:'Histoire',icon:'⌛',tone:'orange',source:'https://www.education.gouv.fr/bo/15/Special11/MENE1526483Aannexe2.htm'},
 GEO:{name:'Géographie',icon:'◎',tone:'green',source:'https://www.education.gouv.fr/bo/15/Special11/MENE1526483Aannexe2.htm'},
 SCI:{name:'Sciences & technologie',icon:'⚗',tone:'blue',source:'https://eduscol.education.gouv.fr/6878/ressources-d-accompagnement-du-programme-de-sciences-et-technologie-au-cycle-3'},
 EMC:{name:'EMC',icon:'⚖',tone:'pink',source:'https://www.education.gouv.fr/bo/2024/Hebdo24/MENE2413934A'},
 LVE:{name:'Langue vivante',icon:'✦',tone:'blue',source:'https://www.education.gouv.fr/bo/2025/Hebdo22/MENE2504621A'},
 ART:{name:'Arts & histoire des arts',icon:'✿',tone:'pink',source:'https://www.education.gouv.fr/les-programmes-du-college-470408'},
 EPS:{name:'EPS',icon:'↗',tone:'green',source:'https://www.education.gouv.fr/les-programmes-du-college-470408'},
 NUM:{name:'Culture numérique transversale',icon:'⌘',tone:'violet',source:'https://www.education.gouv.fr/les-programmes-du-college-470408'},
};
const playable = new Set(['MAT-09','MAT-12','MAT-18']);
const CATALOGUE = [];
const counters = Object.fromEntries(Object.keys(SUBJECTS).map(k=>[k,0]));
let family = '',domain='';
for(const line of RAW.split('\n')) {
 const [first,second,...rest]=line.split('|');
 const third=rest.join('|');
 if (SUBJECTS[first]) {family=first;domain=second;} else throw new Error('Catalogue invalide : '+line);
 const terms = third.split(';');
 for (const term of terms) {
  const cut=term.lastIndexOf('|');
  if (cut===-1) throw new Error('Priorité absente : '+term);
  const title=term.slice(0,cut).trim(),priority=term.slice(cut+1).trim();
  const id=`${family}-${String(++counters[family]).padStart(2,'0')}`;
  CATALOGUE.push({id,subject:family,domain,title,priority,playable:playable.has(id),status:playable.has(id)?'demo':'to_produce',source:SUBJECTS[family].source});
 }
}
function findNotion(id){return CATALOGUE.find(n=>n.id===id) || null;}
function subjectNotions(subject){return CATALOGUE.filter(n=>n.subject===subject);}
function domainsOf(subject){return [...new Set(subjectNotions(subject).map(n=>n.domain))];}


// Démonstrations éditoriales : à faire valider par un professeur avant pilote réel.
// Les phases « essai guidé → transfert » et les indices progressifs adaptent le
// moteur local LifeQuest_V3_Panels.html audité le 11/10/2026.
const LESSONS = {
 'MAT-09':{
  summary:'Une fraction décrit des parts égales d’un même tout.',
  example:'Quand on partage une réserve en 4 portions identiques, une portion vaut 1/4 de la réserve.',
  detail:'Le dénominateur indique le nombre de parts égales ; le numérateur indique combien de parts sont choisies.',
  video:'./media/MAT-09.mp4',
  quiz:[
   {q:'Un rectangle est découpé en 4 parts égales. Tu prends 1 part. Quelle fraction as-tu prise ?',choices:['1/4','4/1','1/3'],correct:0,why:'Une part choisie parmi quatre parts égales correspond à 1/4.'},
   {q:'On partage 8 batteries à parts égales entre 2 équipes. Combien reçoit chaque équipe ?',choices:['2','4','6'],correct:1,why:'8 batteries divisées en 2 groupes égaux donnent 4 batteries par équipe.'},
   {q:'Quelle condition est indispensable pour parler de quarts ?',choices:['Les parts ont la même couleur','Les quatre parts sont égales','Le tout est rond'],correct:1,why:'Une fraction décrit des parts égales d’un même tout.'}
  ],
  game:{
   type:'fraction',
   title:'Répartis les réserves',
   description:'Résous une situation proche, puis transfère la même idée dans une nouvelle situation.',
   phases:[
    {label:'Essai guidé',prompt:'Charge la moitié du réservoir : sélectionne 4 compartiments sur 8.',cells:8,target:4},
    {label:'Transfert',prompt:'Un tiers des 15 batteries doit partir en mission. Sélectionne la bonne quantité.',cells:15,target:5}
   ],
   hints:[
    ['Deux groupes égaux doivent contenir la même quantité.','Partage 8 en deux groupes.','Compte 4 compartiments sur les 8.'],
    ['Un tiers signifie trois groupes égaux.','Partage les 15 batteries en 3 groupes.','15 ÷ 3 = 5 batteries.']
   ]
  }
 },
 'MAT-12':{
  summary:'Comparer des fractions consiste à comparer des quantités représentées.',
  example:'Sur deux réservoirs identiques, 3/4 correspond à davantage de liquide que 1/2.',
  detail:'Quand les dénominateurs sont égaux, on compare les numérateurs ; sinon, on peut utiliser des dessins équivalents.',
  video:'./media/MAT-12.mp4',
  quiz:[
   {q:'Sur deux réserves identiques, laquelle représente le plus ?',choices:['1/4','3/4','Elles sont égales'],correct:1,why:'Trois quarts représentent plus d’une même réserve qu’un quart.'},
   {q:'Quelle fraction est égale à 1/2 ?',choices:['2/4','1/3','3/4'],correct:0,why:'Deux quarts remplissent la moitié du même tout.'},
   {q:'On compare 2/5 et 4/5 du même tout. La plus grande est…',choices:['2/5','4/5','Elles sont égales'],correct:1,why:'À dénominateur égal, quatre parts représentent plus que deux.'}
  ],
  game:{
   type:'compare',
   title:'Compare les réservoirs',
   description:'Choisis la plus grande quantité, puis recommence avec des fractions différentes.',
   phases:[
    {label:'Essai guidé',prompt:'Quel réservoir contient le plus ?',left:{label:'1/2',value:0.5},right:{label:'3/4',value:0.75},correct:1},
    {label:'Transfert',prompt:'Sans jauge graduée, quelle fraction est la plus grande ?',left:{label:'2/3',value:0.667},right:{label:'3/5',value:0.6},correct:0}
   ],
   hints:[
    ['Les deux réservoirs ont la même capacité.','Compare la hauteur de liquide.','Trois quarts est plus grand qu’une moitié.'],
    ['Transforme les fractions avec un dénominateur commun.','2/3 = 10/15 et 3/5 = 9/15.','10/15 est plus grand que 9/15.']
   ]
  }
 },
 'MAT-18':{
  summary:'Le périmètre mesure la longueur du contour d’une figure.',
  example:'Un rectangle de 3 m sur 2 m possède un contour de 3 + 2 + 3 + 2 = 10 m.',
  detail:'L’aire mesure la surface intérieure ; le périmètre mesure la distance autour.',
  video:'./media/MAT-18.mp4',
  quiz:[
   {q:'Un carré a des côtés de 3 m. Quel est son périmètre ?',choices:['6 m','9 m','12 m'],correct:2,why:'Le contour du carré vaut 3 + 3 + 3 + 3 = 12 m.'},
   {q:'Quelle grandeur sert à savoir combien de clôture acheter ?',choices:['Le périmètre','L’aire','Le volume'],correct:0,why:'La clôture parcourt le contour du terrain.'},
   {q:'Un rectangle mesure 4 m par 2 m. Quel périmètre ?',choices:['8 m','12 m','16 m'],correct:1,why:'4 + 2 + 4 + 2 = 12 m.'}
  ],
  game:{
   type:'perimeter',
   title:'Pose le câble autour de la station',
   description:'Compte uniquement le contour extérieur, d’abord sur un rectangle puis sur une forme en L.',
   phases:[
    {label:'Essai guidé',prompt:'Rectangle de 3 unités sur 2 : combien de segments autour ?',shape:'rectangle',display:'3 × 2',choices:[6,10,12],correct:10},
    {label:'Transfert',prompt:'La forme en L contient 5 cases. Combien de segments composent son contour ?',shape:'l-shape',display:'Forme en L',choices:[5,10,12],correct:12}
   ],
   hints:[
    ['Le périmètre suit le bord, pas la surface.','Additionne 3 + 2 + 3 + 2.','Le contour mesure 10 unités.'],
    ['Les côtés partagés entre deux cases sont à l’intérieur.','Compte seulement les arêtes qui touchent le vide.','La forme en L possède 12 arêtes extérieures.']
   ]
  }
 }
};
const sampleRewards=[
 {id:'badge-premier-cours',name:'Éclaireur du savoir',kind:'virtual',metric:'lessons',need:1,desc:'Terminer une première vidéo de cours.'},
 {id:'badge-pionnier',name:'Pionnier des notions',kind:'virtual',metric:'notions',need:1,desc:'Terminer une première notion jouable.'},
 {id:'badge-cap',name:'Gardien du cap',kind:'virtual',metric:'focusSessions',need:1,desc:'Terminer une session de concentration.'},
 {id:'badge-expert',name:'Curieux confirmé',kind:'virtual',metric:'notions',need:3,desc:'Terminer les trois notions de démonstration.'},
 {id:'real-future',name:'Cadeau réel — exemple',kind:'real',metric:'notions',need:1,desc:'Concept différé : aucune demande, conversion, commande ou livraison n’est possible.'}
];


const STORAGE_KEY = 'lifequest-v3-portrait-demo-v1';
const STORAGE_VERSION = 2;

const FOCUS_TASKS = Object.freeze([
  { id: 'lesson', label: 'Réviser une notion', icon: '✎' },
  { id: 'reading', label: 'Lire au calme', icon: '◫' },
  { id: 'homework', label: 'Faire mes devoirs', icon: '✓' },
]);

const FOCUS_DURATIONS = Object.freeze([60, 180, 300]);

function freshDatabase() {
  return {
    version: STORAGE_VERSION,
    profiles: [],
    activeId: null,
    settings: { sound: true, reducedMotion: false },
  };
}

const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const asPositiveInteger = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
};

function normalizeProgress(raw) {
  const progress = {};
  for (const [id, value] of Object.entries(asObject(raw))) {
    if (!/^[A-Z]{3}-\d{2}$/.test(id)) continue;
    const state = asObject(value);
    progress[id] = {
      quizDone: state.quizDone === true,
      gameDone: state.gameDone === true,
      done: state.done === true,
    };
  }
  return progress;
}

function normalizeWatched(raw) {
  return Object.fromEntries(
    Object.entries(asObject(raw))
      .filter(([id, watched]) => /^[A-Z]{3}-\d{2}$/.test(id) && watched === true),
  );
}

function normalizeFocusSessions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      duration: asPositiveInteger(item.duration),
      task: String(item.task || 'Session de concentration').slice(0, 60),
      finishedAt: Number.isNaN(Date.parse(item.finishedAt)) ? new Date(0).toISOString() : item.finishedAt,
    }))
    .filter(item => item.duration > 0)
    .slice(-30);
}

function normalizeFocusDraft(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const total = asPositiveInteger(raw.total, 60);
  const left = Math.min(total, asPositiveInteger(raw.left, total));
  if (!total || !left) return null;
  const endAt = Number(raw.endAt);
  const validEndAt = Number.isFinite(endAt) && endAt > 0 ? endAt : null;
  return {
    task: String(raw.task || FOCUS_TASKS[0].label).slice(0, 60),
    total,
    left,
    running: raw.running === true && validEndAt !== null,
    endAt: validEndAt,
  };
}

function normalizeProfile(raw, index = 0) {
  const profile = asObject(raw);
  const id = String(profile.id || `profil-${index + 1}`);
  return {
    id,
    name: String(profile.name || 'Explorateur').trim().slice(0, 22) || 'Explorateur',
    avatar: Math.min(3, Math.max(0, asPositiveInteger(profile.avatar))),
    introSeen: profile.introSeen === true,
    watched: normalizeWatched(profile.watched),
    progress: normalizeProgress(profile.progress),
    points: asPositiveInteger(profile.points),
    focusSessions: normalizeFocusSessions(profile.focusSessions),
    focusDraft: normalizeFocusDraft(profile.focusDraft),
  };
}

function normalizeDatabase(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.profiles)) return freshDatabase();
  const profiles = raw.profiles.map(normalizeProfile);
  const requestedActiveId = raw.activeId == null ? null : String(raw.activeId);
  return {
    ...freshDatabase(),
    profiles,
    activeId: profiles.some(profile => profile.id === requestedActiveId) ? requestedActiveId : null,
    settings: { ...freshDatabase().settings, ...asObject(raw.settings) },
  };
}

function completedNotions(profile) {
  return Object.values(profile?.progress || {}).filter(value => value?.done).length;
}

function watchedLessons(profile) {
  return Object.values(profile?.watched || {}).filter(Boolean).length;
}

function focusStats(profile) {
  const sessions = Array.isArray(profile?.focusSessions) ? profile.focusSessions : [];
  return {
    sessions: sessions.length,
    seconds: sessions.reduce((total, session) => total + asPositiveInteger(session.duration), 0),
  };
}

function focusRemainingSeconds(draft, now = Date.now()) {
  if (!draft) return 0;
  if (draft.running && Number.isFinite(draft.endAt)) {
    return Math.max(0, Math.ceil((draft.endAt - now) / 1000));
  }
  return Math.max(0, asPositiveInteger(draft.left));
}

function rewardMetrics(profile) {
  return {
    notions: completedNotions(profile),
    lessons: watchedLessons(profile),
    focusSessions: focusStats(profile).sessions,
  };
}

function rewardStatus(reward, profile) {
  const current = rewardMetrics(profile)[reward.metric] || 0;
  const need = Math.max(1, asPositiveInteger(reward.need, 1));
  return {
    current,
    need,
    earned: reward.kind === 'virtual' && current >= need,
    ratio: Math.min(1, current / need),
  };
}


const app = document.getElementById('app');
const copy = { school: 'École', gifts: 'Cadeaux', focus: 'Concentration', discovery: 'Découverte', parents: 'Parents' };
const symbols = { school: '✎', gifts: '✦', focus: '◉', discovery: '✧', parents: '⌂' };
const icons = ['🧑‍🚀', '👩‍🚀', '🧑🏽‍🚀', '👨🏿‍🚀'];
const playableCount = CATALOGUE.filter(item => item.playable).length;

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

const storageState = { available: true, error: null, lastSavedAt: null };

function loadDatabase() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return normalizeDatabase(stored);
  } catch (error) {
    storageState.available = false;
    storageState.error = error;
    return freshDatabase();
  }
}

let db = loadDatabase();
let route = { page: 'splash' };
let stack = [];
let selection = { subject: 'MAT', domain: null, notion: 'MAT-09' };
let newAvatar = 0;
let draftNickname = '';
let quiz = { index: 0, score: 0, choice: null };
let game = freshGame();
let focusChoice = { task: FOCUS_TASKS[0].label, total: FOCUS_DURATIONS[0] };
let focus = freshFocus();
let focusTimer = null;
let installPrompt = null;
let toastTimer = null;

function freshGame() {
  return { phase: 0, selected: [], answer: null, done: false, correct: false, attempts: 0, hintLevel: 0, transferHintUsed: false };
}

function freshFocus() {
  return { task: FOCUS_TASKS[0].label, left: FOCUS_DURATIONS[0], total: FOCUS_DURATIONS[0], running: false, endAt: null };
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    storageState.available = true;
    storageState.error = null;
    storageState.lastSavedAt = Date.now();
    updateSystemNotice();
    return true;
  } catch (error) {
    storageState.available = false;
    storageState.error = error;
    updateSystemNotice();
    return false;
  }
}

function player() {
  return db.profiles.find(profile => profile.id === db.activeId) || null;
}

const percent = value => Math.max(0, Math.min(100, Math.round(value * 100)));

function clearFocusTicker() {
  if (focusTimer) {
    clearInterval(focusTimer);
    focusTimer = null;
  }
}

function enter(page, params = {}) {
  clearFocusTicker();
  stack.push(route);
  route = { page, ...params };
  window.scrollTo(0, 0);
  render();
}

function replace(page, params = {}) {
  clearFocusTicker();
  route = { page, ...params };
  window.scrollTo(0, 0);
  render();
}

function back() {
  clearFocusTicker();
  route = stack.pop() || { page: 'lobby' };
  window.scrollTo(0, 0);
  render();
}

function title(name, tag = 'MISSION') {
  return `<div><p class="tag">${esc(tag)}</p><h1 class="screen-title">${esc(name)}</h1></div>`;
}

function button(text, action, value = '', type = 'btn', extra = '') {
  return `<button type="button" class="${type}" data-action="${action}" data-value="${esc(value)}" ${extra}>${text}</button>`;
}

function nav() {
  return `<nav class="bottom-nav" aria-label="Navigation principale">
    <button type="button" data-action="lobby"><span>⌂</span>Accueil</button>
    <button type="button" data-action="progress"><span>★</span>Progrès</button>
    <button type="button" data-action="profile"><span>☻</span>Profil</button>
    <button type="button" data-action="settings"><span>⚙</span>Options</button>
  </nav>`;
}

function mascot(text) {
  return `<div class="mascotline panel"><img src="./assets/robot.svg" alt="Nova, robot mascotte"/><div><p class="tag">NOVA · TON COPILOTE</p><p class="lead">${esc(text)}</p></div></div>`;
}

function avatar(index, className = '') {
  return `<span class="avatar ${className}" role="img" aria-label="Avatar explorateur ${Number(index) + 1}">${icons[index] || icons[0]}</span>`;
}

function head() {
  const home = ['title', 'splash', 'lobby'].includes(route.page);
  return `<header class="head">
    ${home ? '<span class="head-spacer"></span>' : '<button type="button" class="icon-btn" data-action="back" aria-label="Revenir en arrière">←</button>'}
    <div class="brand">LIFE<em>QUEST</em></div>
    <span class="pill">MVP LOCAL</span>
  </header>`;
}

function systemNoticeMarkup() {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  if (!storageState.available) {
    return '<div id="system-notice" class="system-notice danger" role="status">Sauvegarde locale indisponible : cette progression risque d’être perdue à la fermeture.</div>';
  }
  if (offline) {
    return '<div id="system-notice" class="system-notice" role="status">Mode hors connexion : les écrans déjà chargés restent accessibles, mais les vidéos peuvent être indisponibles.</div>';
  }
  return '<div id="system-notice" class="system-notice" role="status" hidden></div>';
}

function updateSystemNotice() {
  const notice = document.getElementById('system-notice');
  if (!notice) return;
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  if (!storageState.available) {
    notice.hidden = false;
    notice.className = 'system-notice danger';
    notice.textContent = 'Sauvegarde locale indisponible : cette progression risque d’être perdue à la fermeture.';
  } else if (offline) {
    notice.hidden = false;
    notice.className = 'system-notice';
    notice.textContent = 'Mode hors connexion : les écrans déjà chargés restent accessibles, mais les vidéos peuvent être indisponibles.';
  } else {
    notice.hidden = true;
    notice.textContent = '';
  }
}

function shell(inner, withNav = false) {
  app.innerHTML = `<div class="shell">${head()}${systemNoticeMarkup()}<main class="content ${withNav ? 'with-bottom-nav' : ''}">${inner}</main>${withNav ? nav() : ''}<div class="foot">MVP local · Données de démonstration uniquement</div></div>`;
}

const lesson = () => LESSONS[selection.notion];
const notion = () => findNotion(selection.notion);
const gamePhase = () => lesson()?.game?.phases?.[game.phase];

function requiresProfile(page) {
  return !['splash', 'title', 'profiles', 'create'].includes(page);
}

function render() {
  let p = player();
  if (!p && requiresProfile(route.page)) {
    route = { page: 'profiles' };
    stack = [];
  }
  p = player();
  let html = '';
  const immersive = ['quiz', 'game', 'focus-session'].includes(route.page);
  const showNav = !['splash', 'title', 'profiles', 'create', 'intro'].includes(route.page) && !immersive;

  switch (route.page) {
    case 'splash':
      html = `<div class="splash"><div class="planet"></div><h1 class="screen-title splash-title">LIFEQUEST</h1><p class="lead">Une aventure pour apprendre</p><div class="meter splash-meter"><div style="width:72%"></div></div><p class="micro">Chargement du quartier général...</p></div>`;
      break;

    case 'title':
      html = `<div class="big-hero"><div class="planet"></div></div><div class="centered">${title('L’aventure commence ici', 'SAISON 01 · ESPACE')}<p class="lead title-lead">Découvre, comprends et progresse dans ton propre univers.</p></div><div class="flex-spacer"></div>${button('JOUER →', 'profiles', '', 'btn wide')}${button('Installer le jeu', 'install', '', 'btn btn-soft wide')}<p class="micro centered">Prototype éducatif · jeu à la verticale</p>`;
      break;

    case 'profiles':
      html = `${title('Choisis ton explorateur', 'PROFILS LOCAUX')}<p class="lead">Retrouve ta partie ou crée un explorateur.</p><div class="list">${db.profiles.map(profile => `<button type="button" class="item" data-action="select-profile" data-value="${esc(profile.id)}">${avatar(profile.avatar, 'avatar-small')}<span><strong>${esc(profile.name)}</strong><small>${completedNotions(profile)} notion(s) terminée(s)</small></span><span>→</span></button>`).join('')}${button('＋ Nouvel explorateur', 'create', '', 'btn btn-blue wide')}</div><p class="note">Ces profils sont uniquement enregistrés dans ce navigateur. Ils ne constituent pas des comptes sécurisés.</p>`;
      break;

    case 'create':
      html = `${title('Ton personnage', 'NOUVEAU PROFIL')}<div class="big-hero">${avatar(newAvatar, 'avatar-hero')}</div><div class="panel"><label for="nickname" class="box-title">Ton pseudo</label><input id="nickname" type="text" maxlength="22" autocomplete="off" placeholder="Ex. Nova" value="${esc(draftNickname)}"/><p class="box-title avatar-label">Choisis ton explorateur</p><div class="avatar-row">${icons.map((icon, index) => `<button type="button" class="avatar-choice ${index === newAvatar ? 'active' : ''}" data-action="avatar" data-value="${index}" aria-label="Avatar ${index + 1}" aria-pressed="${index === newAvatar}">${icon}</button>`).join('')}</div></div>${button('Commencer l’aventure', 'save-profile', '', 'btn wide')}<p class="micro">N’utilise pas ton nom complet : les profils ne sont pas des comptes protégés.</p>`;
      break;

    case 'intro':
      html = `${title('Rencontre Nova', 'TON COPILOTE')}<div class="big-hero"><img class="hero-figure" src="./assets/robot.svg" alt="Nova, le petit robot mascotte"/></div>${mascot('Salut explorateur ! Je suis Nova. Je t’accompagne dans LifeQuest. Choisis un espace et avançons ensemble !')}${button('C’est parti !', 'finish-intro', '', 'btn wide')}`;
      break;

    case 'lobby': {
      const badgeCount = sampleRewards.filter(reward => rewardStatus(reward, p).earned).length;
      html = `${title('Quartier général', 'TES CINQ DESTINATIONS')}<div class="panel profile-summary"><div><p class="tag">EXPLORATEUR</p><h2>${esc(p?.name || 'Invité')}</h2><p class="micro">${completedNotions(p)} / 115 notions · ${badgeCount} badge(s)</p></div>${avatar(p?.avatar || 0, 'avatar-lobby')}</div><div class="cardgrid">
        ${[
          ['school', 'blue', `10 matières · ${playableCount} notions jouables`],
          ['gifts', 'gold', 'Badges virtuels · aucun achat'],
          ['focus', 'green', 'Sessions guidées et historique'],
          ['discovery', 'purple', 'Phase ultérieure'],
          ['parents', 'pink', 'Phase ultérieure'],
        ].map(([world, color, description]) => `<button type="button" class="world-card ${color} ${['discovery', 'parents'].includes(world) ? 'locked' : ''}" data-action="world" data-value="${world}"><span class="symbol">${symbols[world]}</span><b>${copy[world]}</b><small>${description}</small></button>`).join('')}
      </div>${mascot('Par où souhaites-tu commencer ? École, Concentration et les badges virtuels sont testables.')}`;
      break;
    }

    case 'subjects':
      html = `${title('Choisis une matière', 'ESPACE ÉCOLE')}<p class="lead">Chaque notion jouable commence par une courte leçon, avant les activités.</p><div class="catalog-status"><strong>${CATALOGUE.length}</strong> notions référencées · <strong>${playableCount}</strong> jouables · <strong>${CATALOGUE.length - playableCount}</strong> à produire</div><div class="list">${Object.entries(SUBJECTS).map(([key, subject]) => {
        const rows = subjectNotions(key);
        const ready = rows.filter(item => item.playable).length;
        return `<button type="button" class="item" data-action="subject" data-value="${key}"><span class="ico">${subject.icon}</span><span><strong>${esc(subject.name)}</strong><small>${rows.length} notions recensées · ${ready ? `${ready} jouable(s)` : 'contenus à produire'}</small></span><span>→</span></button>`;
      }).join('')}</div>`;
      break;

    case 'domains':
      html = `${title(SUBJECTS[selection.subject].name, 'CHOISIS UN CHAPITRE')}<div class="list">${domainsOf(selection.subject).map(domain => {
        const rows = subjectNotions(selection.subject).filter(item => item.domain === domain);
        const ready = rows.filter(item => item.playable).length;
        return `<button type="button" class="item" data-action="domain" data-value="${esc(domain)}"><span class="ico">◇</span><span><strong>${esc(domain)}</strong><small>${rows.length} notions · ${ready ? `${ready} jouable(s)` : 'à produire'}</small></span><span>→</span></button>`;
      }).join('')}</div>`;
      break;

    case 'notions': {
      const rows = subjectNotions(selection.subject).filter(item => item.domain === selection.domain);
      html = `${title(selection.domain, 'CHOISIS UNE NOTION')}<p class="micro">Le statut indique ce qui peut réellement être testé aujourd’hui.</p><div class="list">${rows.map(item => `<button type="button" class="item" data-action="notion" data-value="${item.id}"><span class="ico">${item.playable ? '★' : '◇'}</span><span><strong>${esc(item.title)}</strong><small>${item.id} · ${item.priority}</small></span><span class="pill ${item.playable ? 'gold' : 'muted'}">${item.playable ? 'JOUABLE' : 'À PRODUIRE'}</span></button>`).join('')}</div>`;
      break;
    }

    case 'notion-detail': {
      const currentNotion = notion();
      const currentLesson = lesson();
      const watched = Boolean(p?.watched?.[currentNotion.id]);
      const progress = p?.progress?.[currentNotion.id];
      html = `${title(currentNotion.title, `NOTION ${currentNotion.id}`)}<div class="panel"><p class="tag">${esc(SUBJECTS[currentNotion.subject].name)} · ${esc(currentNotion.domain)}</p><p class="lead">${currentLesson ? esc(currentLesson.summary) : 'Cette notion figure dans le référentiel LifeQuest. Son cours et ses activités ne sont pas encore produits.'}</p><div class="info-line"><span class="pill">${esc(currentNotion.priority)}</span><span class="pill ${currentNotion.playable ? 'gold' : 'muted'}">${currentNotion.playable ? 'PROTOTYPE JOUABLE' : 'CONTENU À PRODUIRE'}</span></div></div>${currentNotion.playable ? `${button(watched ? 'Revoir le cours vidéo' : '1. Regarder le cours vidéo', 'course', '', 'btn wide')}${button('2. Quiz et mini-jeu', 'activity-menu', '', 'btn btn-blue wide', watched ? '' : 'disabled')}${progress?.done ? '<p class="correct status-line">★ Notion terminée : bravo !</p>' : ''}${!watched ? '<p class="note">Les activités se débloquent après la fin de la vidéo.</p>' : ''}` : `${mascot('On prépare encore cette notion. Tu peux continuer à explorer le catalogue !')}<p class="note">La vidéo, le quiz et le mini-jeu ne sont pas produits. Aucun faux résultat n’est généré.</p>`}<p class="micro">Référence : ${esc(currentNotion.id)} · Démonstration pédagogique à valider.</p>`;
      break;
    }

    case 'course': {
      const currentNotion = notion();
      const currentLesson = lesson();
      const watched = Boolean(p?.watched?.[currentNotion.id]);
      html = `${title(`Leçon : ${currentNotion.title}`, 'ÉTAPE 01 · COURS')}<p class="lead">Regarde la vidéo entière pour ouvrir les activités. Quitter avant la fin ne valide pas le cours.</p><video class="video" id="lesson-video" controls playsinline preload="metadata" controlsList="nodownload" src="${currentLesson.video}" aria-describedby="video-description video-status">Ton navigateur ne prend pas en charge la vidéo.</video><p id="video-description" class="micro">Vidéo locale muette de démonstration, à remplacer par une capsule pédagogique finale validée de 1 à 2 minutes.</p><div class="panel"><h2>À retenir</h2><p class="lead">${esc(currentLesson.detail)}</p><p class="micro example">Exemple : ${esc(currentLesson.example)}</p></div><div id="video-status" class="note">${watched ? 'Cours déjà visionné : les activités restent disponibles.' : 'Le cours doit être terminé avant les activités.'}</div>${button('Passer aux activités →', 'activity-menu', '', 'btn wide', watched ? '' : 'id="activity-btn" disabled')}`;
      break;
    }

    case 'activity-menu': {
      const currentNotion = notion();
      const progress = p?.progress?.[currentNotion.id] || {};
      html = `${title('À toi de jouer !', currentNotion.title)}${mascot('Commence par le quiz, puis applique la notion dans deux situations : un essai guidé et un transfert.')}<div class="list"><button type="button" class="item" data-action="quiz-start"><span class="ico">?</span><span><strong>Quiz interactif</strong><small>Trois questions et des corrections immédiates</small></span><span class="pill">${progress.quizDone ? '✓' : 'JOUER'}</span></button><button type="button" class="item" data-action="game-start"><span class="ico">▦</span><span><strong>Mini-jeu en deux phases</strong><small>${esc(lesson().game.title)} · essai puis transfert</small></span><span class="pill">${progress.gameDone ? '✓' : 'JOUER'}</span></button></div><p class="note">La notion est terminée après un quiz réussi (au moins 2/3) et les deux phases du mini-jeu.</p>${button('Revoir la vidéo', 'course', '', 'btn btn-soft wide')}`;
      break;
    }

    case 'quiz': {
      const question = lesson().quiz[quiz.index];
      html = `${title(`Quiz · Question ${quiz.index + 1}/3`, notion().title)}<div class="meter" aria-label="Progression du quiz"><div style="width:${((quiz.index + (quiz.choice === null ? 0 : 1)) / 3) * 100}%"></div></div><div class="panel quiz-question"><h2>${esc(question.q)}</h2></div><div class="list">${question.choices.map((choice, index) => `<button type="button" class="quiz-option ${quiz.choice === index ? 'selected' : ''}" data-action="answer" data-value="${index}" ${quiz.choice !== null ? 'disabled' : ''}>${String.fromCharCode(65 + index)}. ${esc(choice)}</button>`).join('')}</div>${quiz.choice !== null ? `<div class="feedback"><strong class="${quiz.choice === question.correct ? 'correct' : 'wrong'}">${quiz.choice === question.correct ? 'Bonne réponse !' : 'Observe la correction.'}</strong><p class="lead">${esc(question.why)}</p></div>${button(quiz.index === 2 ? 'Voir les résultats' : 'Question suivante', 'quiz-next', '', 'btn wide')}` : ''}`;
      break;
    }

    case 'game':
      html = renderGame();
      break;

    case 'result': {
      const passed = route.score;
      const kind = route.kind;
      const progress = p?.progress?.[notion().id] || {};
      html = `<div class="result-hero"><div class="result-symbol">${passed ? '★' : '↻'}</div>${title(passed ? 'Bravo !' : 'Continue à explorer', 'RÉSULTATS')}</div><div class="panel"><h2>${kind === 'quiz' ? 'Quiz terminé' : 'Mini-jeu terminé'}</h2><p class="lead">${kind === 'quiz' ? `Score : ${route.points}/3 bonnes réponses${passed ? ' · seuil atteint' : ' · 2 bonnes réponses nécessaires'}` : 'Essai guidé et transfert réalisés avec succès.'}</p><p class="micro result-progress">Quiz : ${progress.quizDone ? '✓' : 'à faire'} · Mini-jeu : ${progress.gameDone ? '✓' : 'à faire'}</p><p class="tag result-tag">${progress.done ? 'NOTION TERMINÉE · +20 POINTS (UNE FOIS)' : 'ENCORE UNE ÉTAPE POUR TERMINER LA NOTION'}</p></div>${!passed && kind === 'quiz' ? button('Réessayer le quiz', 'quiz-start', '', 'btn wide') : button('Choisir une autre activité', 'activity-menu', '', 'btn wide')}${button('Retour aux notions', 'notions-home', '', 'btn btn-soft wide')}`;
      break;
    }

    case 'progress': {
      const completed = Object.entries(p?.progress || {}).filter(([, value]) => value.done);
      html = `${title('Ton parcours', 'PROGRESSION PERSONNELLE')}<div class="panel"><p class="tag">NOTIONS TERMINÉES</p><h2 class="progress-number">${completed.length}<span> / 115</span></h2><div class="meter"><div style="width:${percent(completed.length / 115)}%"></div></div><p class="lead progress-points">${p?.points || 0} points virtuels</p></div><div class="catalog-status"><strong>${playableCount}</strong> prototypes jouables aujourd’hui · <strong>${CATALOGUE.length - playableCount}</strong> contenus restent à produire</div><div class="list">${completed.length ? completed.map(([id]) => `<div class="item"><span class="ico">★</span><span><strong>${esc(findNotion(id)?.title || id)}</strong><small>${esc(id)}</small></span></div>`).join('') : '<p class="note">Aucune notion terminée. Commence par École !</p>'}</div>`;
      break;
    }

    case 'focus':
      html = renderFocusHub(p);
      break;

    case 'focus-session':
      html = renderFocusSession();
      break;

    case 'focus-finished': {
      const last = p?.focusSessions?.at(-1);
      html = `${title('Concentration terminée', 'SESSION RÉUSSIE')}<div class="big-hero focus-win"><span>✦</span></div>${mascot('Tu as terminé la durée choisie. La session est ajoutée à ton historique, sans points ni mécanisme de dépense.')}<div class="panel"><p class="tag">DERNIÈRE SESSION</p><h2>${esc(last?.task || 'Mission de concentration')}</h2><p class="lead">${formatFocusDuration(last?.duration || 0)} · terminée localement</p></div>${button('Nouvelle session', 'focus-home', '', 'btn wide')}${button('Voir mes badges', 'gifts', '', 'btn btn-soft wide')}`;
      break;
    }

    case 'gifts':
      html = renderGifts(p);
      break;

    case 'future':
      html = `${title(copy[route.world], 'EN PRÉPARATION')}<div class="big-hero future-symbol"><span>${symbols[route.world]}</span></div>${mascot(route.world === 'discovery' ? 'Le monde Découverte sera développé dans une phase ultérieure.' : 'L’espace Parents complet viendra après Découverte. Un accès réellement sécurisé sera indispensable.')}${button('Retour au lobby', 'lobby', '', 'btn wide')}`;
      break;

    case 'profile': {
      const stats = focusStats(p);
      html = `${title('Mon explorateur', 'PROFIL LOCAL')}<div class="big-hero">${avatar(p?.avatar || 0, 'avatar-profile')}</div><div class="panel"><h2>${esc(p?.name || 'Explorateur')}</h2><p class="lead">${completedNotions(p)} notion(s) · ${p?.points || 0} points · ${stats.sessions} session(s) de concentration</p></div>${button('Changer d’explorateur', 'profiles', '', 'btn btn-soft wide')}${button('Exporter ma sauvegarde', 'export', '', 'btn btn-soft wide')}<p class="note">Le fichier exporté contient le pseudo et la progression locale. Ne le diffuse pas publiquement.</p>`;
      break;
    }

    case 'settings':
      html = `${title('Paramètres', 'CONFORT & CONFIDENTIALITÉ')}<div class="panel"><h2>Interface portrait</h2><p class="lead">Commandes tactiles d’au moins 44 px, zones sûres de l’écran et message de rotation sur appareils tactiles en paysage.</p><p class="micro settings-note">Le manifeste demande le mode portrait, mais iOS et certains navigateurs restent libres d’ignorer ce choix.</p></div><div class="panel"><h2>Sauvegarde locale</h2><p class="lead">État : <strong class="${storageState.available ? 'correct' : 'wrong'}">${storageState.available ? 'disponible dans ce navigateur' : 'indisponible'}</strong>.</p><p class="micro settings-note">Aucun compte cloud, achat, suivi public ou synchronisation multi-appareils.</p></div>${button('Installer le jeu', 'install', '', 'btn btn-soft wide')}${button('Revenir à l’écran titre', 'title', '', 'btn btn-ghost wide')}`;
      break;

    default:
      html = title('Page indisponible', 'ERREUR');
  }

  shell(html, showNav);
  if (route.page === 'focus' && p?.focusDraft) {
    const start = app.querySelector('[data-action="focus-begin"]');
    if (start) {
      start.disabled = true;
      start.textContent = 'Termine ou abandonne la session en attente';
    }
  }
  if (route.page === 'course') attachVideo();
  if (route.page === 'focus-session' && focus.running) startFocusTicker();
}

function renderGame() {
  const gameData = lesson().game;
  const phase = gamePhase();
  const phaseNumber = game.phase + 1;
  let interaction = '';

  if (gameData.type === 'fraction') {
    interaction = `<div class="game-grid" style="--game-columns:${phase.cells > 10 ? 5 : 4}">${Array.from({ length: phase.cells }, (_, index) => `<button type="button" class="game-cell ${game.selected.includes(index) ? 'on' : ''}" data-action="cell" data-value="${index}" aria-label="Compartiment ${index + 1}, ${game.selected.includes(index) ? 'sélectionné' : 'non sélectionné'}" aria-pressed="${game.selected.includes(index)}" ${game.done ? 'disabled' : ''}></button>`).join('')}</div><p class="lead game-count">${game.selected.length} / ${phase.cells} éléments sélectionnés</p>`;
  }

  if (gameData.type === 'compare') {
    interaction = `<div class="compare">${[phase.left, phase.right].map((tank, index) => `<button type="button" class="tank ${game.answer === index ? 'selected' : ''}" data-action="compare-answer" data-value="${index}" ${game.done ? 'disabled' : ''}><div class="gauge"><div style="height:${tank.value * 100}%"></div></div><strong>${esc(tank.label)}</strong></button>`).join('')}</div>`;
  }

  if (gameData.type === 'perimeter') {
    const shape = phase.shape === 'l-shape'
      ? '<div class="l-shape" role="img" aria-label="Forme en L composée de cinq cases"><span></span><span></span><span></span><span></span><span></span></div>'
      : `<div class="perim" role="img" aria-label="Rectangle de trois unités sur deux">${esc(phase.display)}</div>`;
    interaction = `${shape}<div class="list">${phase.choices.map(value => `<button type="button" class="quiz-option ${game.answer === value ? 'selected' : ''}" data-action="perimeter-answer" data-value="${value}" ${game.done ? 'disabled' : ''}>${value} unités</button>`).join('')}</div>`;
  }

  const hints = gameData.hints?.[game.phase] || [];
  const visibleHint = game.hintLevel > 0 ? hints[game.hintLevel - 1] : '';
  const hintButton = !game.done && game.hintLevel < hints.length
    ? button(`Indice ${game.hintLevel + 1}/${hints.length}`, 'game-hint', '', 'btn btn-ghost')
    : '';
  const verifyButton = !game.done && gameData.type === 'fraction'
    ? button('Vérifier ma réponse', 'game-check', '', 'btn wide')
    : '';
  const feedback = game.done
    ? `<div class="feedback"><strong class="${game.correct ? 'correct' : 'wrong'}">${game.correct ? (game.phase === 0 ? 'Essai guidé réussi !' : 'Transfert réussi !') : 'Pas encore.'}</strong><p class="lead">${game.correct ? (game.phase === 0 ? 'Tu peux maintenant appliquer la même idée autrement.' : 'Tu as utilisé la notion dans une nouvelle situation.') : 'Observe la situation, utilise un indice si nécessaire, puis réessaie.'}</p></div>${button(game.correct ? (game.phase < gameData.phases.length - 1 ? 'Passer au transfert' : 'Terminer le mini-jeu') : 'Réessayer', game.correct ? (game.phase < gameData.phases.length - 1 ? 'game-next-phase' : 'game-complete') : 'game-retry', '', 'btn wide')}`
    : '';

  return `${title(gameData.title, `MINI-JEU · ${phase.label.toUpperCase()}`)}<div class="stage-progress" aria-label="Phase ${phaseNumber} sur ${gameData.phases.length}"><span class="past"></span><span class="${phaseNumber === 2 ? 'past' : ''}"></span></div><div class="panel game-prompt"><p class="tag">PHASE ${phaseNumber}/${gameData.phases.length}</p><h2>${esc(phase.prompt)}</h2></div>${interaction}${visibleHint ? `<div class="hintbox"><strong>Indice ${game.hintLevel}</strong><p>${esc(visibleHint)}</p></div>` : ''}<div class="inline-actions game-actions">${hintButton}${verifyButton}</div>${feedback}`;
}

function renderFocusHub(profile) {
  const stats = focusStats(profile);
  const draft = profile?.focusDraft;
  const remaining = focusRemainingSeconds(draft);
  const recent = (profile?.focusSessions || []).slice(-5).reverse();
  return `${title('Mission Concentration', 'MÉCANIQUE MVP À VALIDER')}${mascot('Choisis une seule mission et une durée réaliste. Aucune série obligatoire et aucun point à dépenser.')}${draft ? `<div class="panel focus-draft"><div><p class="tag">SESSION EN ATTENTE</p><h2>${esc(draft.task)}</h2><p class="lead">${time(remaining)} restant · ${draft.running ? 'le temps continue' : 'en pause'}</p></div><div class="inline-actions">${button('Reprendre', 'focus-resume', '', 'btn')}${button('Abandonner', 'focus-cancel-draft', '', 'btn btn-ghost')}</div></div>` : ''}<div class="panel"><h2>1. Choisis ton cap</h2><div class="choice-grid">${FOCUS_TASKS.map(task => `<button type="button" class="choice-card ${focusChoice.task === task.label ? 'active' : ''}" data-action="focus-task" data-value="${esc(task.label)}" aria-pressed="${focusChoice.task === task.label}"><span>${task.icon}</span><strong>${esc(task.label)}</strong></button>`).join('')}</div><h2 class="focus-step">2. Choisis une durée</h2><div class="inline-actions">${FOCUS_DURATIONS.map(seconds => button(`${seconds / 60} min`, 'focus-length', seconds, `btn btn-soft ${focusChoice.total === seconds ? 'active' : ''}`, `aria-pressed="${focusChoice.total === seconds}"`)).join('')}</div></div>${button('Démarrer la session', 'focus-begin', '', 'btn wide')}<div class="panel focus-stats"><div><strong>${stats.sessions}</strong><span>sessions terminées</span></div><div><strong>${Math.round(stats.seconds / 60)}</strong><span>minutes au total</span></div></div><div><h2 class="section-title">Historique local</h2>${recent.length ? `<div class="list">${recent.map(session => `<div class="item compact"><span class="ico">◉</span><span><strong>${esc(session.task)}</strong><small>${formatFocusDuration(session.duration)} · ${formatDate(session.finishedAt)}</small></span><span class="pill">TERMINÉE</span></div>`).join('')}</div>` : '<p class="note">Aucune session terminée pour le moment.</p>'}</div><p class="note">Cette minuterie est une hypothèse testable, pas une mécanique produit définitivement validée.</p>`;
}

function renderFocusSession() {
  const progress = focus.total ? percent((focus.total - focus.left) / focus.total) : 0;
  return `${title('Garde ton cap', 'SESSION DE CONCENTRATION')}<div class="panel focus-active"><p class="tag">UNE SEULE MISSION</p><h2>${esc(focus.task)}</h2><div class="timer" id="focus-clock" aria-live="off">${time(focus.left)}</div><div class="meter focus-meter" aria-label="${progress}% de la session écoulée"><div id="focus-progress" style="width:${progress}%"></div></div><p class="micro centered" id="focus-state">${focus.running ? 'Session en cours' : 'Session en pause'}</p></div>${button(focus.running ? 'Mettre en pause' : 'Reprendre', focus.running ? 'focus-pause' : 'focus-start', '', 'btn wide')}${button('Arrêter sans valider', 'focus-cancel', '', 'btn btn-ghost wide')}<p class="note">Tu peux quitter cet écran : la session reste enregistrée localement et peut être reprise. Une session arrêtée n’est pas ajoutée à l’historique.</p>`;
}

function renderGifts(profile) {
  const virtual = sampleRewards.filter(reward => reward.kind === 'virtual');
  const real = sampleRewards.filter(reward => reward.kind === 'real');
  const unlocked = virtual.filter(reward => rewardStatus(reward, profile).earned).length;
  return `${title('Trésor des explorateurs', 'ESPACE CADEAUX')}<div class="panel rewards-summary"><div><p class="tag">POINTS VIRTUELS</p><h2>${profile?.points || 0} ✦</h2><p class="micro">+20 une seule fois par notion entièrement terminée.</p></div><div><p class="tag">BADGES</p><h2>${unlocked} / ${virtual.length}</h2><p class="micro">Déverrouillage automatique, sans dépense.</p></div></div><h2 class="section-title">Badges virtuels</h2><div class="list">${virtual.map(reward => {
    const state = rewardStatus(reward, profile);
    return `<div class="item reward ${state.earned ? 'earned' : ''}"><span class="ico">${state.earned ? '🏅' : '◇'}</span><span><strong>${esc(reward.name)}</strong><small>${esc(reward.desc)}</small><span class="reward-meter"><i style="width:${percent(state.ratio)}%"></i></span><small>${Math.min(state.current, state.need)} / ${state.need}</small></span><span class="pill ${state.earned ? 'gold' : 'muted'}">${state.earned ? 'ACQUIS' : 'VERROUILLÉ'}</span></div>`;
  }).join('')}</div><h2 class="section-title">Cadeaux réels</h2>${real.map(reward => `<div class="item reward disabled-reward" aria-disabled="true"><span class="ico">🎁</span><span><strong>${esc(reward.name)}</strong><small>${esc(reward.desc)}</small></span><span class="pill muted">NON DISPONIBLE</span></div>`).join('')}<div class="note danger-note">Aucune demande réelle, approbation, livraison, conversion ou transaction n’est activée. Les points locaux ne constituent aucune preuve d’éligibilité.</div>`;
}

function time(seconds) {
  const safe = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function formatFocusDuration(seconds) {
  const minutes = Math.max(1, Math.round(Number(seconds || 0) / 60));
  return `${minutes} min`;
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  } catch {
    return 'date locale indisponible';
  }
}

function attachVideo() {
  const video = document.getElementById('lesson-video');
  if (!video) return;
  const status = document.getElementById('video-status');
  const unlock = document.getElementById('activity-btn');
  const alreadyWatched = Boolean(player()?.watched?.[selection.notion]);
  let furthestWatched = alreadyWatched ? Number.POSITIVE_INFINITY : 0;
  let restoringSeek = false;

  video.addEventListener('loadedmetadata', () => {
    if (!status || player()?.watched?.[selection.notion]) return;
    const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : null;
    status.textContent = duration ? `Vidéo prête (${duration} s). Les activités restent verrouillées jusqu’à la fin.` : 'Vidéo prête. Les activités restent verrouillées jusqu’à la fin.';
  });

  video.addEventListener('error', () => {
    if (!status) return;
    status.className = 'note danger-note';
    status.textContent = 'Vidéo indisponible. Vérifie le serveur local et le fichier média ; les activités restent verrouillées.';
  });

  video.addEventListener('timeupdate', () => {
    if (!video.seeking && !alreadyWatched) {
      furthestWatched = Math.max(furthestWatched, video.currentTime);
    }
  });

  video.addEventListener('seeking', () => {
    if (alreadyWatched || restoringSeek || video.currentTime <= furthestWatched + 0.05) return;
    restoringSeek = true;
    video.currentTime = furthestWatched;
    if (status) {
      status.className = 'note';
      status.textContent = 'La vidéo doit être suivie dans l’ordre : l’avance directe reste verrouillée.';
    }
    setTimeout(() => { restoringSeek = false; }, 0);
  });

  video.addEventListener('ended', () => {
    if (!alreadyWatched && Number.isFinite(video.duration) && furthestWatched < video.duration - 1.25) {
      if (status) {
        status.className = 'note danger-note';
        status.textContent = 'La lecture complète n’a pas été confirmée. Reprends la vidéo avant les activités.';
      }
      return;
    }
    const active = player();
    if (!active) return;
    active.watched ||= {};
    active.watched[selection.notion] = true;
    save();
    if (status) {
      status.className = 'note success-note';
      status.textContent = 'Cours terminé : les activités sont déverrouillées !';
    }
    if (unlock) unlock.disabled = false;
  });
}

function completed(type, score) {
  const active = player();
  if (!active) return;
  active.progress ||= {};
  const state = active.progress[selection.notion] || {};
  const passed = type !== 'quiz' || score >= 2;
  if (type === 'quiz' && passed) state.quizDone = true;
  if (type === 'game' && passed) state.gameDone = true;
  if (state.quizDone && state.gameDone && !state.done) {
    state.done = true;
    active.points = (active.points || 0) + 20;
  }
  active.progress[selection.notion] = state;
  save();
  enter('result', { kind: type, score: passed, points: score });
}

function persistFocus() {
  const active = player();
  if (!active) return;
  active.focusDraft = { ...focus };
  save();
}

function hydrateFocus() {
  const draft = player()?.focusDraft;
  if (!draft) {
    focus = freshFocus();
    return false;
  }
  const left = focusRemainingSeconds(draft);
  focus = { ...draft, left };
  return left > 0;
}

function finishFocusSession() {
  const active = player();
  if (!active) return;
  clearFocusTicker();
  active.focusSessions ||= [];
  const effectiveEnd = Number.isFinite(focus.endAt) ? Math.min(focus.endAt, Date.now()) : Date.now();
  active.focusSessions.push({ task: focus.task, duration: focus.total, finishedAt: new Date(effectiveEnd).toISOString() });
  active.focusSessions = active.focusSessions.slice(-30);
  active.focusDraft = null;
  focus = freshFocus();
  save();
  replace('focus-finished');
}

function syncFocusClock() {
  if (!focus.running) return focus.left;
  focus.left = focusRemainingSeconds(focus);
  return focus.left;
}

function startFocusTicker() {
  clearFocusTicker();
  focusTimer = setInterval(() => {
    if (route.page !== 'focus-session' || !focus.running) {
      clearFocusTicker();
      return;
    }
    const previous = focus.left;
    const left = syncFocusClock();
    const clock = document.getElementById('focus-clock');
    const progressBar = document.getElementById('focus-progress');
    if (clock) clock.textContent = time(left);
    if (progressBar) progressBar.style.width = `${percent((focus.total - left) / focus.total)}%`;
    if (left !== previous && left % 5 === 0) persistFocus();
    if (left <= 0) finishFocusSession();
  }, 250);
}

function selectProfile(id) {
  db.activeId = id;
  save();
  stack = [];
  const active = player();
  replace(active?.introSeen ? 'lobby' : 'intro');
}

function toast(message) {
  clearTimeout(toastTimer);
  document.querySelector?.('.toast')?.remove();
  const element = document.createElement('div');
  element.className = 'toast';
  element.setAttribute?.('role', 'status');
  element.textContent = message;
  document.body.append(element);
  toastTimer = setTimeout(() => element.remove(), 3500);
}

function install() {
  if (installPrompt) {
    installPrompt.prompt();
    installPrompt.userChoice.finally(() => { installPrompt = null; });
  } else {
    toast('Depuis le menu du navigateur, choisis « Ajouter à l’écran d’accueil ». L’installation dépend du navigateur et d’une origine sécurisée.');
  }
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
});

window.addEventListener('online', updateSystemNotice);
window.addEventListener('offline', updateSystemNotice);

if (typeof document.addEventListener === 'function') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && route.page === 'focus-session' && focus.running) {
      if (syncFocusClock() <= 0) finishFocusSession();
      else render();
    }
  });
}

app.addEventListener('input', event => {
  if (event.target?.id === 'nickname') draftNickname = event.target.value;
});

app.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target || target.disabled) return;
  const action = target.dataset.action;
  const value = target.dataset.value;
  const active = player();

  if (action === 'back') { back(); return; }
  if (action === 'profiles') { enter('profiles'); return; }
  if (action === 'create') { newAvatar = 0; draftNickname = ''; enter('create'); return; }
  if (action === 'avatar') {
    draftNickname = document.getElementById('nickname')?.value || draftNickname;
    newAvatar = Number(value);
    render();
    return;
  }
  if (action === 'save-profile') {
    const input = document.getElementById('nickname');
    const name = (input?.value || draftNickname).trim().replace(/[\u0000-\u001f]/g, '').replace(/\s+/g, ' ').slice(0, 22);
    if (!name) { toast('Choisis un pseudo.'); return; }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    db.profiles.push({ id, name, avatar: newAvatar, introSeen: false, watched: {}, progress: {}, points: 0, focusSessions: [], focusDraft: null });
    draftNickname = '';
    selectProfile(id);
    return;
  }
  if (action === 'select-profile') { selectProfile(value); return; }
  if (action === 'finish-intro') { active.introSeen = true; save(); stack = []; replace('lobby'); return; }
  if (action === 'lobby') { stack = []; replace('lobby'); return; }
  if (action === 'world') {
    if (value === 'school') enter('subjects');
    else if (value === 'focus') enter('focus');
    else if (value === 'gifts') enter('gifts');
    else enter('future', { world: value });
    return;
  }
  if (action === 'subject') { selection.subject = value; enter('domains'); return; }
  if (action === 'domain') { selection.domain = value; enter('notions'); return; }
  if (action === 'notion') { selection.notion = value; enter('notion-detail'); return; }
  if (action === 'course') { enter('course'); return; }
  if (action === 'activity-menu') {
    if (!active?.watched?.[selection.notion]) { toast('Regarde d’abord la vidéo du cours jusqu’à la fin.'); return; }
    enter('activity-menu');
    return;
  }
  if (action === 'quiz-start') { quiz = { index: 0, score: 0, choice: null }; enter('quiz'); return; }
  if (action === 'answer') {
    if (quiz.choice !== null) return;
    quiz.choice = Number(value);
    if (quiz.choice === lesson().quiz[quiz.index].correct) quiz.score += 1;
    render();
    return;
  }
  if (action === 'quiz-next') {
    if (quiz.index === lesson().quiz.length - 1) completed('quiz', quiz.score);
    else { quiz.index += 1; quiz.choice = null; render(); }
    return;
  }
  if (action === 'game-start') { game = freshGame(); enter('game'); return; }
  if (action === 'cell') {
    if (game.done) return;
    const index = Number(value);
    game.selected = game.selected.includes(index) ? game.selected.filter(item => item !== index) : [...game.selected, index];
    render();
    return;
  }
  if (action === 'game-check') {
    game.done = true;
    game.attempts += 1;
    game.correct = game.selected.length === gamePhase().target;
    render();
    return;
  }
  if (action === 'compare-answer') {
    game.answer = Number(value);
    game.done = true;
    game.attempts += 1;
    game.correct = game.answer === gamePhase().correct;
    render();
    return;
  }
  if (action === 'perimeter-answer') {
    game.answer = Number(value);
    game.done = true;
    game.attempts += 1;
    game.correct = game.answer === gamePhase().correct;
    render();
    return;
  }
  if (action === 'game-hint') {
    const hints = lesson().game.hints?.[game.phase] || [];
    game.hintLevel = Math.min(hints.length, game.hintLevel + 1);
    if (game.phase === 1) game.transferHintUsed = true;
    render();
    return;
  }
  if (action === 'game-retry') {
    game.done = false;
    game.correct = false;
    game.answer = null;
    game.selected = [];
    render();
    return;
  }
  if (action === 'game-next-phase') {
    game.phase += 1;
    game.selected = [];
    game.answer = null;
    game.done = false;
    game.correct = false;
    game.hintLevel = 0;
    render();
    return;
  }
  if (action === 'game-complete') { completed('game', 1); return; }
  if (action === 'notions-home') { enter('notions'); return; }

  if (action === 'focus-task') { focusChoice.task = value; render(); return; }
  if (action === 'focus-length') { focusChoice.total = Number(value); render(); return; }
  if (action === 'focus-begin') {
    if (active?.focusDraft) {
      toast('Reprends ou abandonne d’abord la session en attente.');
      return;
    }
    focus = { task: focusChoice.task, total: focusChoice.total, left: focusChoice.total, running: true, endAt: Date.now() + focusChoice.total * 1000 };
    persistFocus();
    enter('focus-session');
    return;
  }
  if (action === 'focus-resume') {
    if (!hydrateFocus()) { finishFocusSession(); return; }
    enter('focus-session');
    return;
  }
  if (action === 'focus-start') {
    focus.running = true;
    focus.endAt = Date.now() + focus.left * 1000;
    persistFocus();
    render();
    return;
  }
  if (action === 'focus-pause') {
    syncFocusClock();
    focus.running = false;
    focus.endAt = null;
    clearFocusTicker();
    persistFocus();
    render();
    return;
  }
  if (action === 'focus-cancel' || action === 'focus-cancel-draft') {
    clearFocusTicker();
    active.focusDraft = null;
    focus = freshFocus();
    save();
    replace('focus');
    return;
  }
  if (action === 'focus-home') { focus = freshFocus(); enter('focus'); return; }
  if (action === 'gifts') { enter('gifts'); return; }
  if (action === 'progress') { enter('progress'); return; }
  if (action === 'profile') { enter('profile'); return; }
  if (action === 'settings') { enter('settings'); return; }
  if (action === 'title') { stack = []; replace('title'); return; }
  if (action === 'install') { install(); return; }
  if (action === 'export') {
    const data = JSON.stringify(active, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lifequest-sauvegarde-locale.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && stack.length) back();
});

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./service-worker.js').catch(error => console.warn('Service worker non disponible', error));
}

render();
setTimeout(() => {
  if (route.page === 'splash') replace('title');
}, 950);
