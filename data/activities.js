// Démonstrations éditoriales : à faire valider par un professeur avant pilote réel.
// Les phases « essai guidé → transfert » et les indices progressifs adaptent le
// moteur local LifeQuest_V3_Panels.html audité le 11/10/2026.
export const LESSONS = {
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
export const sampleRewards=[
 {id:'badge-premier-cours',name:'Éclaireur du savoir',kind:'virtual',metric:'lessons',need:1,desc:'Terminer une première vidéo de cours.'},
 {id:'badge-pionnier',name:'Pionnier des notions',kind:'virtual',metric:'notions',need:1,desc:'Terminer une première notion jouable.'},
 {id:'badge-cap',name:'Gardien du cap',kind:'virtual',metric:'focusSessions',need:1,desc:'Terminer une session de concentration.'},
 {id:'badge-expert',name:'Curieux confirmé',kind:'virtual',metric:'notions',need:3,desc:'Terminer les trois notions de démonstration.'},
 {id:'real-future',name:'Cadeau réel — exemple',kind:'real',metric:'notions',need:1,desc:'Concept différé : aucune demande, conversion, commande ou livraison n’est possible.'}
];
