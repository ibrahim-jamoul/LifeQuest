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
export const SUBJECTS = {
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
export const CATALOGUE = [];
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
export function findNotion(id){return CATALOGUE.find(n=>n.id===id) || null;}
export function subjectNotions(subject){return CATALOGUE.filter(n=>n.subject===subject);}
export function domainsOf(subject){return [...new Set(subjectNotions(subject).map(n=>n.domain))];}
