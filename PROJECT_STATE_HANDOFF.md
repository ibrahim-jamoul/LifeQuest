# LifeQuest Dashboard - Rapport complet de l'etat actuel

Date de reference : 11 juin 2026  
Perimetre audite : code complet, base SQLite, migrations, seed, API, interfaces React, gamification, build, tests, dependances et navigateur.

Ce document est la source de reference a transmettre a un autre agent IA. Il remplace les anciens rapports devenus obsoletes.

## 1. Verdict executif

LifeQuest Dashboard est un MVP full-stack local fonctionnel de progression gamifiee enfant-parent. Il ne s'agit plus d'une maquette :

- React consomme une vraie API Express ;
- SQLite persiste les donnees ;
- l'authentification enfant/parent et les protections de role fonctionnent ;
- les actions attribuent de l'XP et mettent a jour streaks, niveaux et achievements ;
- les huit zones du village reagissent a des donnees reelles ;
- objectifs, projets, quetes, habitudes, focus, Discovery, reviews, Life Areas, campagne scolaire et missions parent-enfant sont utilisables ;
- migrations, seed, build, tests et audit passent.

Le projet est utilisable localement. Il n'est pas encore pret pour une publication publique robuste sur Vercel/Supabase sans migration PostgreSQL et durcissement securite.

### Statut global

| Domaine | Etat | Precision |
|---|---|---|
| Frontend React/TypeScript | Fonctionnel | Routes, formulaires, layouts et etats vides |
| Backend Express/TypeScript | Fonctionnel | API JSON, Zod et roles |
| SQLite | Fonctionnel | Schema, migrations, foreign keys et WAL |
| Auth locale | Fonctionnelle | Login/logout, sessions et switch enfant-parent |
| Dashboard village | Fonctionnel | Donnees reelles et zones dynamiques |
| Quetes | Fonctionnelles | CRUD, liens, completion et XP |
| Habitudes | Fonctionnelles | CRUD, liens, check-in, historique et streak |
| Objectifs | Fonctionnels | CRUD, detail, milestones, notes, liens et XP |
| Projets | Fonctionnels | CRUD, detail, roadmap, risques, milestones et notes |
| Reviews | Fonctionnelles | Weekly/monthly, rechargement et resume genere |
| Focus Mode | Fonctionnel | 1 principale, 2 secondaires, challenges et risque |
| Discovery | Fonctionnelle | Defis adaptes a l'age et repetables |
| Life Areas | Fonctionnelles | Scores, tendances et activite |
| Campagne scolaire | Fonctionnelle | Campagne annuelle et 12 chapitres |
| Parent-enfant | Fonctionnel | Creation, soumission et validation de missions |
| Insights | Fonctionnels | XP, heatmap et rappels locaux |
| Build | Passe | TypeScript strict et Vite |
| Tests | Passent | 17/17 |
| Audit npm | Sain | 0 vulnerabilite |
| Vercel/Supabase | Non finalise | Migration et securite production requises |

## 2. Vision produit implementee

La boucle actuelle est :

1. L'enfant se connecte a son village.
2. Il consulte les actions et priorites utiles.
3. Il accomplit quetes, habitudes, milestones, challenges ou missions.
4. Le backend valide l'action et cree un evenement XP.
5. XP, niveau, streak, achievements et village evoluent.
6. Focus Mode limite la dispersion.
7. Reviews hebdomadaires et mensuelles transforment l'activite en reflexion.
8. Le parent propose des missions puis valide leur realisation.

La homepage applique le principe "le monde est l'interface" : le village sert de tableau de bord et de navigation.

## 3. Stack et architecture

### Frontend

- React 18
- TypeScript strict
- Vite
- Tailwind CSS
- React Router
- Zustand
- Lucide React
- Recharts

### Backend

- Node.js 24+
- Express 5
- TypeScript via `tsx`
- Zod
- `node:sqlite`

### Qualite

- Vitest
- migrations SQL versionnees
- seed idempotent
- audit npm

### Dossiers

```text
src/
  components/          composants UI et gardes auth
  config/              navigation et listes de domaine
  features/island/     dashboard village et scene SVG
  hooks/               hooks de chargement
  layouts/             homepage immersive et shell interne
  lib/api/             client API type et tokens
  pages/               pages fonctionnelles
  store/               etat Zustand
  styles.css           charte globale
server/
  db/                  schema, connexion, migrations et seed
  middleware/          auth et erreurs
  routes/              endpoints Express
  services/            auth, XP, achievements et village
tests/                 unitaires et integration API
```

Le frontend est separe du backend par une API JSON. Cela facilite une future migration PostgreSQL, mais les requetes SQLite devront etre adaptees.

## 4. Lancement local

```powershell
npm.cmd install
npm.cmd run db:init
npm.cmd run db:seed
npm.cmd run dev
```

- application : `http://localhost:3000`
- API : `http://localhost:4000/api`
- health : `http://localhost:4000/api/health`

Comptes seed locaux :

- enfant : `child@lifequest.local`
- parent : `parent@lifequest.local`
- mot de passe : `lifequest123`

L'ecran de connexion apparait normalement lorsqu'aucune session n'existe. Cela ne signifie pas que le projet ou les donnees ont ete remis a zero.

## 5. Design et experience

### Charte actuelle

- palette creme, sauge, bois doux, bleu pastel et tons chauds ;
- panneaux tres arrondis ;
- boutons epais avec ombres courtes ;
- hierarchie typographique forte ;
- icones Lucide ;
- scene SVG originale ;
- homepage sans sidebar ;
- pages internes coherentes avec le village ;
- navigation filtree par role ;
- support de la reduction de mouvement.

La version actuelle est une experience enfant-parent cozy. Elle differe du dark mode adulte demande initialement, car la vision produit a evolue pendant la roadmap.

### Layouts

`ImmersiveHomeLayout` :

- utilise uniquement sur `/` ;
- donne toute la place au village ;
- transforme les batiments en navigation.

`AppShell` :

- utilise sur les pages internes ;
- fournit navigation et structure responsive ;
- adapte les liens au role.

### Homepage village

Elle affiche :

- village SVG interactif ;
- XP, niveau, titre et streak ;
- date et saison Sydney ;
- actions du jour ;
- objectif hebdomadaire ;
- equilibre des domaines ;
- missions parent ;
- panneau contextuel ;
- feedback apres action.

### Zones et sources reelles

| Zone | Donnees | Destination |
|---|---|---|
| Home Area | habitudes actives et completion sur 30 jours | `/habits` |
| Garden | regularite et streaks d'habitudes | `/habits` |
| Workshop | projets crees et termines | `/projects` |
| Learning | progression moyenne des objectifs | `/goals` |
| Discovery/Market | challenges Discovery completes | `/discovery` |
| Town Hall | campagne scolaire | `/campaign` |
| Lighthouse | priorites Focus de la semaine | `/focus` |
| Pathways | reviews hebdomadaires | `/reviews/weekly` |

La progression est persistee dans `village_state` et ne regresse pas.

## 6. Authentification et roles

### Disponible

- vrai formulaire `/login` ;
- login enfant ou parent ;
- redirection selon role ;
- logout ;
- mots de passe hashes avec `scrypt` et sel ;
- comparaison timing-safe ;
- tokens aleatoires ;
- hash SHA-256 des tokens stocke en base ;
- expiration 30 jours ;
- middleware backend par role ;
- gardes frontend ;
- formulaire d'acces parent ;
- conservation separee de la session enfant ;
- retour vers enfant.

### Limites production

- token dans `localStorage` plutot que cookie HttpOnly ;
- pas d'inscription ;
- pas de reset mot de passe ;
- pas de verification email ;
- pas de rate limiting ;
- pas de nettoyage planifie des sessions expirees ;
- multi-enfant peu teste.

## 7. Inventaire complet des pages

### `/login`

- formulaire email/mot de passe ;
- erreurs ;
- redirection role-aware ;
- design cozy.

### `/`

- snapshot quotidien ;
- XP, niveau, streak ;
- huit zones dynamiques ;
- progression semaine/mois ;
- actions conseillees ;
- feedback apres quete/habitude ;
- etats de chargement.

### `/quests` et `/tasks`

- creation et modification ;
- titre, description, date, priorite, effort ;
- liens objectif et projet ;
- filtres all/today/active/completed ;
- completion unique ;
- suppression ;
- XP et refresh village.

Limites : pas de recurrence, sous-taches ou restauration.

### `/habits`

- creation et modification ;
- categorie et description ;
- frequences daily/weekly/custom ;
- planning custom textuel ;
- lien vers goal ;
- check-in quotidien idempotent ;
- XP, streak courant et record ;
- historique ;
- suppression ;
- compteur reel de categories.

Limites : le moteur de streak est surtout quotidien et le planning custom n'est pas un calendrier complet.

### `/goals`

- creation ;
- categorie, priorite, deadline, statut et progression ;
- liste ;
- detection de dispersion ;
- ouverture detail ;
- suppression.

### `/goals/:goalId`

- edition ;
- completion verifiee par endpoint dedie ;
- XP majeur ;
- milestones CRUD et XP ;
- progression recalculee ;
- notes CRUD ;
- quetes liees ;
- habitudes liees ;
- suppression.

### `/projects`

- creation titre/description/statut ;
- liste ;
- risque et priorite ;
- ouverture detail ;
- etat vide utilisable.

### `/projects/:projectId`

- edition titre, description, statut, priorite et risque ;
- prochaine action ;
- roadmap ;
- notes generales ;
- milestones CRUD et XP ;
- notes structurees CRUD ;
- quetes liees affichees ;
- suppression.

Limite : un projet complete ne donne pas directement d'XP.

### `/discovery`

- domaines adaptes a l'age ;
- challenges avec XP ;
- completion ;
- achievement explorateur ;
- frequences daily/weekly/monthly ;
- repetition autorisee a chaque nouvelle periode ;
- progression village.

Limites : contenu seed limite et pas d'interface d'administration.

### `/focus`

- une priorite principale maximum ;
- deux secondaires maximum ;
- liens goal/project ;
- suppression ;
- challenges hebdomadaires ;
- progression et XP ;
- achievements ;
- indicateur de risque de dispersion ;
- calcul correct du lundi courant.

### `/life-areas`

- scores 0-100 ;
- tendances ;
- objectifs actifs ;
- activite hebdomadaire ;
- mise a jour manuelle ;
- visualisation.

Limites : scores surtout manuels et pas d'historique.

### `/campaign`

- creation campagne annuelle ;
- annee scolaire et objectif ;
- 12 chapitres ;
- progression et completion ;
- alimentation Town Hall ;
- vue imprimable.

Limite : progression manuelle.

### `/insights`

- graphique XP ;
- heatmap habitudes ;
- rappels locaux ;
- chargement lazy de Recharts.

Limites : pas de push navigateur ou export.

### Centre de notifications locales

- cloche disponible dans le shell enfant ;
- compteur non-lu ;
- rappels habitudes, weekly review et mission parent-enfant ;
- lecture individuelle ;
- marquer tout comme lu ;
- generation idempotente des rappels locaux.

### `/reviews`, `/reviews/weekly`, `/reviews/monthly`

- hub ;
- historique ;
- questions de reflexion ;
- rechargement des reponses de la periode ;
- upsert ;
- XP ;
- achievement Rhythm Keeper ;
- resume calcule depuis tasks, habitudes, XP, goals et Life Areas.

### `/achievements`

Achievements actuels :

- First Quest ;
- First Streak ;
- Apprentice Explorer ;
- Co-adventurer ;
- Rhythm Keeper ;
- Builder.

La page affiche etat, date et recompense.

### `/missions`

- liste enfant ;
- statut ;
- soumission par enfant ;
- attente validation ;
- XP affiche.

### `/parent-access`

- formulaire parent ;
- changement de session protege ;
- conservation session enfant ;
- erreurs.

### `/parent`

- resume enfant lie ;
- XP, streak, quetes, habitudes et missions ;
- creation mission ;
- validation seulement apres soumission ;
- retour enfant.

### `/settings`

- onboarding ;
- rappels habitudes ;
- rappels reviews ;
- sauvegarde API.

Limites : pas d'edition profil, mot de passe ou sessions.

### 404

- page 404 frontend ;
- reponse JSON 404 API.

## 8. Capsules frontend importantes

### `src/App.tsx`

- routes ;
- gardes auth/roles ;
- layouts ;
- lazy loading Insights.

### `src/store/index.ts`

Gere :

- session et utilisateur ;
- snapshot, dashboard et village ;
- quetes et habitudes ;
- erreurs et feedback ;
- login/logout ;
- switch parent/enfant ;
- refresh ;
- creation, suppression et completion.

### `src/lib/api/client.ts`

- client HTTP central ;
- Bearer token ;
- types de reponse ;
- API par domaine ;
- tokens par role ;
- erreurs HTTP uniformes.

Dette : fichier volumineux, contrats dupliques et stockage local.

### `src/features/island/*`

- orchestration dashboard ;
- cartes flottantes ;
- menu village ;
- panneau contextuel ;
- mapping des zones ;
- donnees reelles.

### `src/features/island/scene/*`

Scene SVG en couches :

- ocean ;
- terrain ;
- riviere ;
- chemins ;
- ponts ;
- vegetation ;
- batiments ;
- labels ;
- marqueurs ;
- effets ambiants.

Les zones sont accessibles au clavier.

### Composants generiques

- `AuthGuards` : protections ;
- `Brand` : identite ;
- `EmptyState` : etat vide avec CTA fonctionnel ;
- `StatCard` : statistique reutilisable.

## 9. API complete

Toutes les routes protegees exigent `Authorization: Bearer <token>`.

### Auth et sante

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Dashboard et village

- `GET /api/dashboard`
- `GET /api/dashboard/today`
- `GET /api/village/state`

### Quetes

- `GET /api/quests`
- `POST /api/quests`
- `PUT /api/quests/:id`
- `PATCH /api/quests/:id/complete`
- `DELETE /api/quests/:id`

Les liens goal/project sont verifies.

### Habitudes

- `GET /api/habits`
- `POST /api/habits`
- `PUT /api/habits/:id`
- `DELETE /api/habits/:id`
- `POST /api/habits/:id/log`
- `GET /api/habits/:id/logs`

### Goals, milestones et notes

- `GET /api/goals`
- `GET /api/goals/:id`
- `POST /api/goals`
- `PUT /api/goals/:id`
- `PATCH /api/goals/:id/complete`
- `DELETE /api/goals/:id`
- `POST /api/goals/:id/milestones`
- `PUT /api/goals/:goalId/milestones/:milestoneId`
- `DELETE /api/goals/:goalId/milestones/:milestoneId`
- `POST /api/goals/:id/notes`
- `PUT /api/goals/:goalId/notes/:noteId`
- `DELETE /api/goals/:goalId/notes/:noteId`

Le detail retourne milestones, notes, tasks et habits.

### Projets, milestones et notes

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/milestones`
- `PUT /api/projects/:projectId/milestones/:milestoneId`
- `DELETE /api/projects/:projectId/milestones/:milestoneId`
- `POST /api/projects/:id/notes`
- `PUT /api/projects/:projectId/notes/:noteId`
- `DELETE /api/projects/:projectId/notes/:noteId`

### Reviews et achievements

- `GET /api/reviews`
- `POST /api/reviews`
- `GET /api/achievements`

Le POST review fait un upsert et genere un resume reel.

### Missions et parent

- `GET /api/missions`
- `POST /api/missions`
- `PATCH /api/missions/:id/submit`
- `PATCH /api/missions/:id/validate`
- `GET /api/parent/children`
- `GET /api/parent/dashboard`

### Discovery

- `GET /api/discovery`
- `PATCH /api/discovery/challenges/:id/complete`

### Focus

- `GET /api/focus`
- `POST /api/focus`
- `DELETE /api/focus/:id`
- `POST /api/focus/challenges`
- `PATCH /api/focus/challenges/:id/progress`

### Autres

- `GET /api/life-areas`
- `PUT /api/life-areas/:id`
- `GET /api/campaigns`
- `POST /api/campaigns`
- `PATCH /api/campaigns/chapters/:id`
- `GET /api/insights`
- `GET /api/preferences`
- `PUT /api/preferences`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

## 10. Services backend

### Auth

- scrypt ;
- verification timing-safe ;
- tokens aleatoires ;
- hash token ;
- creation/suppression/lecture de session ;
- detection de role.

### Gamification

- 500 XP par niveau ;
- titres par seuil ;
- risque de dispersion ;
- ledger XP ;
- total et streak recalcules.

Titres actuels :

- Starter ;
- Consistent Builder ;
- Serious Operator ;
- High-Value Profile ;
- Independent Builder.

Ils restent une incoherence de ton avec l'experience enfant.

### Achievements

- definitions initialisees ;
- conditions verifiees ;
- deblocage unique ;
- XP transactionnel ;
- resume locked/unlocked.

### Village

- huit zones calculees ;
- completion habitudes sur 30 jours ;
- streaks de zone ;
- maximum atteint persiste ;
- niveau enfant synchronise.

## 11. Gamification et anti-dispersion

### Sources XP

| Action | Regle |
|---|---|
| Quete | XP une seule fois |
| Habitude | XP une fois par jour |
| Milestone goal | XP au premier passage a 100 |
| Milestone projet | XP au premier passage a 100 |
| Goal | XP majeur via completion dediee |
| Discovery | XP par periode |
| Weekly challenge | XP a la cible |
| Mission parent | XP apres validation |
| Review | XP et achievement |
| Achievement | XP unique |

### Protection doubles recompenses

- quete/goal deja complete refuses ;
- habit log unique par jour ;
- achievement unique ;
- Discovery unique par periode ;
- milestone XP seulement au premier passage ;
- mission validee uniquement dans le bon statut.

### Focus

- 1 principale ;
- 2 secondaires ;
- risque low/medium/high selon travail actif ;
- Lighthouse connecte au focus.

## 12. Base de donnees

### Tables

| Table | Role |
|---|---|
| `users` | identite, XP, streak |
| `child_profiles`, `parent_profiles` | roles et lien familial |
| `auth_sessions` | sessions |
| `goals`, `projects`, `milestones` | progression structuree |
| `tasks`, `habits`, `habit_logs` | actions quotidiennes |
| `notes`, `reviews` | reflexion |
| `xp_events` | ledger XP |
| `achievements`, `user_achievements` | badges |
| `focus_priorities`, `weekly_challenges` | anti-dispersion |
| `parent_child_missions` | missions partagees |
| `discovery_domains`, `discovery_challenges`, `discovery_completions` | Discovery |
| `life_areas` | scores |
| `village_state` | progression visuelle |
| `school_campaigns`, `campaign_chapters` | campagne annuelle |
| `notifications`, `user_preferences` | rappels et preferences |
| `schema_migrations` | versions |

### Integrite

- foreign keys ;
- cascades ;
- contraintes de statut ;
- unicites ;
- index sur recherches frequentes.

## 13. Migrations et seed

### Migrations

1. `001_initial.sql` : profils, missions, Discovery, village et sessions.
2. `002_discovery_completions.sql` : completions Discovery.
3. `003_mission_child_submitted.sql` : soumission enfant.
4. `004_roadmap_weeks_7_10.sql` : campagne, notifications et preferences.
5. `005_repeatable_discovery.sql` : Discovery repetable par periode.

### Seed

Le seed idempotent cree :

- enfant et parent lies ;
- profils et preferences ;
- Life Areas ;
- habitudes et quetes ;
- domaines/challenges Discovery ;
- mission parent-enfant ;
- zones village ;
- contenu de demonstration.

Les identifiants seed sont strictement destines au local.

## 14. Validation executee

Commandes passees :

- `npm.cmd run db:migrate`
- `npm.cmd run db:seed`
- `npm.cmd run build`
- `npm.cmd test`
- `npm.cmd audit --audit-level=critical`

Resultats :

- migrations : passees ;
- seed : passe ;
- build : passe ;
- tests : **17/17** ;
- audit : **0 vulnerabilite** ;
- API health : `{"status":"ok","service":"lifequest-api"}` ;
- aucun TODO/FIXME ou mojibake actif dans le code applicatif apres correction ;
- localhost disponible.

Build :

- principal : environ 310 KB brut, 89 KB gzip ;
- Insights/Recharts lazy : environ 372 KB brut, 99 KB gzip.

### Couverture testee

- auth et roles ;
- habits CRUD/log ;
- quests CRUD/completion ;
- snapshot ;
- XP et streak ;
- achievements ;
- mission parent-enfant ;
- reviews ;
- goals, milestones, liens et completion ;
- projects, milestones et notes ;
- Focus et limites ;
- weekly challenges ;
- Discovery et repetition ;
- campagne ;
- Life Areas ;
- preferences ;
- Insights ;
- non-regression village ;
- resume review genere.

### Verification navigateur

Confirme :

- chargement de `localhost:3000` ;
- page de connexion cozy ;
- champs email/mot de passe ;
- action Sign in ;
- titre `LifeQuest Dashboard`.

La saisie automatisee a ete bloquee par un probleme de presse-papiers de l'outil de verification, pas par l'application. Les parcours authentifies sont valides par les tests API. Une vraie suite E2E frontend reste a ajouter.

## 15. Blocages corriges lors du dernier audit

1. Discovery etait une completion a vie : corrige avec periodes et migration 005.
2. Debut de semaine Focus faux le lundi : corrige.
3. Taux d'habitudes village gonfle : corrige sur 30 jours.
4. Recalcul Home/Garden duplique : simplifie.
5. Habits non relies aux goals : backend et UI ajoutes.
6. Quests sans selecteurs goal/project : ajoutes.
7. Goal Detail sans linked actions : tasks/habits reels ajoutes.
8. Goal complet sans endpoint XP : completion dediee imposee.
9. Project Detail incomplet : edition, suppression, roadmap, risques, milestones et notes ajoutes.
10. Milestones projet sans XP : corrige.
11. Focus faiblement type et risque peu visible : corrige.
12. Reviews sans resume reel/rechargement : corrige.
13. CTA d'etat vide inactifs : corriges.
14. Compteur categories Habits hardcode : corrige.
15. API sans fallback 404 JSON : corrige.
16. Dernier caractere corrompu navigation : corrige.

## 16. Limites restantes

### Produit

- Life Areas et Campaign sont largement manuels ;
- contenu Discovery limite ;
- pas de pieces jointes ;
- pas de recurrence de tasks ;
- moteur custom habits simple ;
- pas d'edition profil ;
- quelques titres de niveau trop adultes.

### UX

- feedback et erreurs pas uniformes sur chaque action secondaire ;
- pas de test exhaustif appareils reels ;
- pas de suite E2E frontend ;
- pas de design system documente separement.

### Production

- SQLite non adapte a Vercel serverless persistant ;
- PostgreSQL/Supabase non migre ;
- token dans `localStorage` ;
- CORS, rate limiting et headers a durcir ;
- pas de CI/CD ;
- pas de monitoring/logs structures ;
- contrats frontend/backend non generes ;
- couverture non exhaustive ;
- pas de transactions sur toutes les operations multi-etapes.

## 17. Evaluation roadmap

### Semaines 1 a 3

Completees pour leur perimetre :

- structure, base, auth ;
- quetes, habitudes, dashboard ;
- XP, streaks ;
- Home/Garden dynamiques ;
- feedback visuel.

### Semaines 4 et 5

Completees pour le MVP :

- goals, projects, reviews ;
- details, milestones, notes ;
- linked actions ;
- completion verifiee ;
- charte cozy.

### Semaine 6

Completee pour le MVP :

- achievements ;
- missions parent-enfant ;
- parent dashboard ;
- switch de role.

### Semaines 7 a 10

Implementees :

- toutes les zones reelles ;
- progression persistante ;
- Discovery ;
- Focus ;
- Life Areas ;
- campagne scolaire ;
- Insights ;
- preferences ;
- onboarding ;
- accessibilite SVG ;
- saison Sydney ;
- routes protegees et 404.

### Semaine 11 - Stabilisation locale et Phase 5

Completee pour son perimetre :

- centre de notifications locales utilisable ;
- rappels habitudes, review et mission parent-enfant ;
- lecture/non-lu ;
- filet de securite global React ;
- gestion d'erreurs renforcee sur les pages de polish ;
- animations visuelles explicites des batiments niveaux 1 a 3 ;
- accessibilite onboarding renforcee ;
- quetes liees visibles dans Project Detail ;
- `.gitignore` protegeant dependances, builds, secrets et bases locales ;
- `npm install`, `npm run build`, `npm test` et audit npm valides.

"Complete" signifie que le flux MVP fonctionne localement, pas que chaque module est mature commercialement.

## 18. Publication

### Demo privee

Possible sur un hebergement Node avec disque persistant. Vercel seul ne convient pas a SQLite.

### Vercel + Supabase

Obligatoire avant publication :

1. creer schema PostgreSQL/Supabase ;
2. remplacer `node:sqlite` et adapter SQL ;
3. choisir Supabase Auth ou cookies HttpOnly ;
4. placer secrets en environnement ;
5. configurer CORS strict ;
6. ajouter rate limiting et headers ;
7. remplacer comptes seed ;
8. ajouter CI build/tests/migrations ;
9. ajouter E2E ;
10. ajouter sauvegarde, monitoring et politique de confidentialite.

Garantie actuelle :

- fonctionnement local ;
- build, tests et audit passent ;
- flux backend critiques couverts.

Pas de garantie actuelle :

- persistance Vercel ;
- securite production ;
- charge ;
- grande echelle ;
- conformite legale produit enfant.

## 19. Priorites recommandees

### Priorite 1 - Production

1. PostgreSQL/Supabase.
2. Auth HttpOnly/Supabase Auth.
3. Securite API.
4. CI/CD et E2E.

### Priorite 2 - Finition fonctionnelle

1. Tasks dans Project Detail.
2. Automatisation Life Areas/Campaign.
3. Recurrence tasks et custom habits.
4. Centre notifications.
5. Gestion profil/compte.

### Priorite 3 - Maturite UX

1. Uniformiser erreurs, loading, confirmations et toasts.
2. Tester mobile/tablette reel.
3. Formaliser design system.
4. Renommer niveaux pour enfant.
5. Enrichir Discovery et achievements.

## 20. Consignes au prochain agent IA

- lire ce rapport puis verifier le code ;
- ne pas reintroduire de donnees statiques dans le village ;
- conserver la progression sans regression ;
- conserver la homepage immersive sans sidebar ;
- garder la logique XP cote backend ;
- proteger chaque requete par user et role ;
- ajouter des tests a chaque changement ;
- lancer build, tests et audit ;
- distinguer local fonctionnel et production ;
- ne jamais remettre d'identifiants en dur dans le frontend.

Prompt recommande :

```text
Lis PROJECT_STATE_HANDOFF.md et confirme les constats dans le code.
Le MVP local jusqu'a la semaine 10 est implemente.
Travaille sur les priorites restantes sans casser la charte cozy,
la homepage village immersive, la progression persistante et les roles.
Ajoute les tests pertinents puis lance build, tests et audit.
```

## 21. Verdict final

LifeQuest Dashboard est un MVP full-stack local avance, coherent et utilisable. Les grands flux demandes jusqu'a la semaine 10 sont presents et relies a la progression. Le dernier audit a ferme les principaux trous entre interfaces et donnees reelles.

Le prochain cap est la transformation en produit publiable : PostgreSQL/Supabase, auth production, securite, E2E, observabilite et finition UX.

## 22. Etat de la migration Supabase

Branche : `migration-supabase`

Premier jalon prepare :

- depot GitHub connecte a `https://github.com/ibrahim-jamoul/LifeQuest.git` ;
- baseline SQLite figee sur `main` au commit `872973e` ;
- migration PostgreSQL initiale dans `supabase/migrations` ;
- types SQLite convertis vers PostgreSQL ;
- RLS explicitement activee sur toutes les tables ;
- acces direct `anon` et `authenticated` revoque ;
- Data API conservee mais Express reste l'unique couche metier ;
- variables `DATABASE_URL` et `DATABASE_SSL` documentees ;
- CI GitHub pour installation, build, tests et audit.

Restant avant bascule :

1. Obtenir la Transaction pooler URI et le project ref Supabase.
2. Appliquer la migration sur le projet distant.
3. Remplacer l'adaptateur synchrone `node:sqlite` par PostgreSQL.
4. Adapter les requetes SQLite specifiques.
5. Creer le seed/import PostgreSQL.
6. Executer les tests d'integration contre Supabase.
7. Configurer et deployer Vercel.

## 23. Semaine 12 - migration Supabase terminee

La structure PostgreSQL a ete appliquee manuellement dans Supabase. La connexion, le schema,
RLS, la lecture/ecriture et l'import des donnees ont ete verifies avec succes le 11 juin 2026.

Outils ajoutes sur `migration-supabase` :

- connexion PostgreSQL partagee pour les commandes de maintenance ;
- verification automatique des 27 tables et de RLS ;
- smoke test lecture/ecriture entierement annule par transaction ;
- import generique de toutes les donnees SQLite vers PostgreSQL ;
- verification CI du schema PostgreSQL sur un service temporaire ;
- documentation de l'ordre de migration et distinction `DATABASE_URL` / `DIRECT_URL`.

Validation locale sans secret :

- `npm run build` : OK ;
- `npm test` : 17/17 ;
- `npm audit --audit-level=critical` : 0 vulnerabilite.

Validation Supabase executee manuellement par le proprietaire :

- 27/27 tables presentes ;
- RLS actif sur 27/27 tables ;
- smoke test lecture/ecriture valide puis annule par transaction ;
- import SQLite termine sans erreur ;
- verification post-import validee.

Volumes Supabase verifies apres import :

- 2 utilisateurs, 1 profil parent et 1 profil enfant ;
- 5 quetes, 5 habitudes, 6 evenements XP et 6 achievements ;
- 1 achievement utilisateur et 1 mission parent-enfant ;
- 3 domaines et 3 challenges de decouverte ;
- 8 zones de village, 2 notifications et 1 jeu de preferences.

Le runtime Express a ensuite ete converti vers une couche de donnees asynchrone :

- PostgreSQL/Supabase est selectionne automatiquement lorsque `DATABASE_URL` existe ;
- SQLite reste disponible pour le developpement et les tests locaux ;
- toutes les routes, middlewares et services utilisent la couche asynchrone ;
- les differences de placeholders, dates et booleens sont gerees ;
- l'API complete a passe le test d'integration reel contre Supabase.

Verdict semaine 12 : terminee et validee de bout en bout.

## 24. Semaine 13 - preparation deploiement

Elements prepares :

- entree Vercel serverless `api/index.ts` exportant Express ;
- configuration Vercel pour le build Vite, l'API et le fallback SPA ;
- CORS configurable par `ALLOWED_ORIGINS` ;
- headers de securite minimaux et taille JSON limitee ;
- limitation des tentatives de connexion ;
- smoke test post-deploiement ;
- outil de rotation des mots de passe de demonstration et revocation des sessions ;
- guide debutant dans `DEPLOYMENT.md`.

Validation locale :

- build TypeScript/Vite ;
- 17/17 tests ;
- audit npm sans vulnerabilite critique.

Restant pour terminer la semaine 13 :

1. le proprietaire doit faire tourner les mots de passe Supabase ;
2. connecter/importer le repo dans Vercel ;
3. ajouter les variables Vercel sans les partager ;
4. deployer une preview et executer le smoke test ;
5. tester les interfaces enfant et parent ;
6. fusionner vers `main` seulement apres validation de la preview.
