# LifeQuest Dashboard - Audit complet de l'application

Date de l'audit : 12 juin 2026  
Version auditee : branche `main`, commit `485c61a`  
Perimetre : application enfant, interface parent, API Express, SQLite local, PostgreSQL/Supabase, Vercel et CI GitHub

## 1. Verdict executif

LifeQuest est aujourd'hui un MVP full-stack large, coherent et reellement utilisable en local. L'application ne se limite pas a une maquette : les actions principales sont persistees, l'XP est calculee par le serveur, le village reagit aux donnees, les roles enfant/parent sont separes et les parcours importants disposent de tests API.

Etat general :

- Local : fonctionnel et stable sur le perimetre teste.
- Build production : fonctionnel.
- Base Supabase initiale : creee, securisee par RLS et alimentee.
- API Vercel : connectee a PostgreSQL et health check fonctionnel.
- Production complete : pas encore garantie, car la migration Supabase avancee n'est pas appliquee.
- Qualite globale : bon socle MVP, mais plusieurs protections et tests doivent etre ajoutes avant une ouverture publique a des enfants.

Evaluation synthetique :

| Domaine | Etat | Evaluation |
|---|---|---:|
| Couverture fonctionnelle MVP | Large et coherente | 8/10 |
| Experience enfant | Immersive et exploitable | 8/10 |
| Experience parent | Fonctionnelle, encore simple | 6/10 |
| Architecture et maintenabilite | Claire pour un MVP | 7/10 |
| Tests automatises | Bons tests API, peu de tests UI | 6/10 |
| Securite technique | Bases presentes, durcissement requis | 5/10 |
| Preparation production | Presque prete techniquement | 6/10 |
| Conformite produit enfant | Travail juridique et parental requis | 3/10 |

## 2. Etat valide pendant cet audit

Commandes executees avec succes :

- `npm run build` : reussi.
- TypeScript strict : compilation reussie.
- Build Vite : reussi.
- Bundle API Vercel : reussi.
- `npm test -- --run` : 20 tests sur 20 reussis.
- `npm audit --omit=dev` : aucune vulnerabilite connue dans les dependances de production.
- Etat Git avant creation de ce rapport : propre.

Taille du projet :

- 114 fichiers sous `src`, `server` et `api`.
- 105 fichiers TypeScript ou TSX.
- 3 fichiers de tests.
- 27 tables applicatives PostgreSQL/Supabase.
- 18 domaines de routes API Express.
- 21 pages React.

Taille du build frontend :

- CSS principal : environ 39 Ko, 7 Ko compresse.
- JavaScript principal : environ 320 Ko, 92 Ko compresse.
- Page Insights chargee separement : environ 385 Ko, 103 Ko compresse.

## 3. Architecture actuelle

### Frontend

- React 18 + TypeScript.
- Vite pour le developpement et le build.
- Tailwind CSS pour le design.
- React Router pour la navigation.
- Zustand pour l'etat applicatif partage.
- Recharts pour les graphiques.
- Lucide React pour les icones.
- Client API centralise dans `src/lib/api/client.ts`.

### Backend

- Node.js + Express 5.
- Validation des entrees avec Zod.
- Authentification locale par email/mot de passe et bearer token.
- Controle d'acces enfant/parent dans les routes protegees.
- Calcul de l'XP, des niveaux, des succes et du village cote serveur.
- Middleware centralise pour erreurs, observabilite, CORS et en-tetes de securite.

### Donnees

- SQLite pour le developpement local.
- PostgreSQL/Supabase pour la production.
- Abstraction `Store` partagee entre les deux moteurs.
- Traduction automatique de plusieurs syntaxes SQLite vers PostgreSQL.
- Scripts de verification, migration de donnees, smoke test et integration PostgreSQL.

### Deploiement

- Frontend statique Vite sur Vercel.
- API Express empaquetee en Serverless Function.
- `/api/health` verifie la connexion base et expose la release deployee.
- GitHub Actions execute build, tests, audit et integration PostgreSQL.

## 4. Inventaire fonctionnel complet

### Authentification et roles

Disponible :

- Connexion enfant et parent.
- Sessions persistantes en base.
- Route de deconnexion.
- Recuperation du profil courant.
- Limitation du nombre de tentatives de connexion.
- Separation des actions enfant et parent.
- Rotation manuelle des mots de passe de demonstration.

Limites :

- Pas d'inscription autonome.
- Pas de mot de passe oublie.
- Pas de verification d'email.
- Pas d'interface pour consulter ou fermer les sessions.
- Tokens conserves dans `localStorage`, donc exposes en cas de faille XSS.

### Accueil et village

Disponible :

- Accueil enfant immersif sans sidebar classique.
- Village SVG/code natif avec zones interactives.
- Donnees reelles branchees au village.
- Niveaux persistants qui ne regressent pas.
- Progression des zones selon habitudes, quetes, projets, objectifs et decouverte.
- Carte de focus du jour.
- Ressources de progression, XP, niveau et streak.
- Feedback visuel apres validation d'action.
- Navigation mobile et bureau.

Zones actuellement gerees :

- Home.
- Garden.
- Workshop.
- Library.
- Discovery.
- Social.

### Quetes et taches

Disponible :

- Creation, modification, suppression et completion.
- Priorite, date, effort estime et XP.
- Liaison a un objectif ou a un jalon.
- Affichage quotidien.
- XP attribuee uniquement lors d'une action verifiee par l'API.
- Protection contre une seconde completion.

### Habitudes

Disponible :

- Creation, modification et suppression.
- Frequences quotidienne, hebdomadaire et personnalisee.
- Jours personnalises.
- Historique de completion.
- XP de completion.
- Bonus de streak.
- Calcul de succes et affichage des habitudes dues.

Limites :

- Le calcul de streak traite encore imparfaitement les habitudes hebdomadaires/personnalisees.
- La progression du village estime les habitudes personnalisees avec un denominateur fixe.

### Objectifs et jalons

Disponible :

- CRUD des objectifs.
- Statut, priorite, progression, categorie, deadline et notes.
- Page detail d'un objectif.
- Ajout et completion de jalons.
- Actions liees visibles.
- XP pour jalon et objectif termine.

### Projets

Disponible :

- CRUD des projets.
- Statut, priorite, risque, prochaine action, roadmap et notes.
- Page detail.
- Jalons de projet.
- Liaison avec les actions.
- XP lors de la completion d'un jalon.

### Focus et anti-dispersion

Disponible :

- Priorite principale hebdomadaire.
- Maximum de deux priorites secondaires.
- Score de distraction.
- Challenge hebdomadaire.
- Progression et recompense XP.
- Vue dediee au focus.

### Decouverte

Disponible :

- Domaines et challenges adaptes par tranche d'age.
- Deblocage visuel selon le niveau du village.
- Challenges quotidiens, hebdomadaires et mensuels repetables.
- Historique de completion.
- XP et succes lies.

Limite importante :

- L'API de completion ne revalide pas le niveau minimum du domaine. Un challenge verrouille peut potentiellement etre complete directement si son identifiant est connu.

### Missions parent-enfant

Disponible :

- Le parent cree une mission.
- L'enfant soumet la mission.
- Le parent valide.
- L'XP n'est attribuee qu'apres validation parentale.
- Tableau de bord parent avec resume enfant.

Limites :

- La validation, l'attribution XP et les succes ne sont pas regroupes dans une transaction unique.
- L'interface parent utilise principalement le premier enfant et ne gere pas completement plusieurs enfants.

### Campagne

Disponible :

- Structure de campagnes scolaires.
- Chapitres de campagne.
- Etat et progression.
- Page campagne.

Etat produit :

- Le socle existe, mais le contenu et la profondeur de jeu restent legers.

### Bilans et insights

Disponible :

- Hub des reviews.
- Review hebdomadaire.
- Review mensuelle.
- Questions de reflexion.
- Resume genere depuis les donnees.
- XP de review.
- Graphiques et tendances.
- Vue Insights chargee separement.
- Resume annuel imprimable.

### Succes et gamification

Disponible :

- XP par action verifiee.
- Niveaux.
- Streak global.
- Badges/succes.
- Deblocage automatique.
- Challenges hebdomadaires.
- Progression du village.
- Non-regression des batiments.

Limites :

- Le streak global est base sur toute activite XP, y compris review ou succes, et pas uniquement sur les routines quotidiennes.
- Les noms de niveaux historiques sont parfois trop adultes pour une version enfant.

### Vie personnelle et notes

Disponible :

- Life areas avec scores et tendances.
- Notes rattachees aux projets et objectifs.
- Reflexions dans les reviews.
- Notifications internes.

### Parametres

Disponible dans le code :

- Modification du profil enfant.
- Choix d'avatar et couleur.
- Preferences de rappels.
- Demande d'autorisation de notification navigateur.

Limites :

- Les notifications push reelles ne sont pas implementees : pas de service worker, abonnement push, VAPID ou planification.
- Les champs avatar et push necessitent la migration Supabase avancee.

## 5. Routes et pages disponibles

Pages principales :

- `/login`
- `/`
- `/goals`
- `/goals/:goalId`
- `/quests` et `/tasks`
- `/habits`
- `/projects`
- `/projects/:projectId`
- `/discovery`
- `/focus`
- `/life-areas`
- `/campaign`
- `/insights`
- `/reviews`
- `/reviews/weekly`
- `/reviews/monthly`
- `/achievements`
- `/missions`
- `/parent-access`
- `/settings`
- `/parent`

Domaines API :

- Authentification.
- Dashboard.
- Village.
- Quetes.
- Habitudes.
- Objectifs.
- Projets.
- Focus.
- Life areas.
- Discovery.
- Missions.
- Parent.
- Reviews.
- Achievements.
- Campaigns.
- Insights.
- Preferences.
- Notifications.

## 6. Schema de donnees

Les 27 tables attendues sont presentes dans le schema Supabase initial :

- `users`
- `life_areas`
- `goals`
- `projects`
- `milestones`
- `tasks`
- `habits`
- `habit_logs`
- `notes`
- `reviews`
- `xp_events`
- `achievements`
- `user_achievements`
- `focus_priorities`
- `weekly_challenges`
- `parent_profiles`
- `child_profiles`
- `parent_child_missions`
- `discovery_domains`
- `discovery_challenges`
- `discovery_completions`
- `village_state`
- `auth_sessions`
- `school_campaigns`
- `campaign_chapters`
- `notifications`
- `user_preferences`

Le schema couvre correctement les besoins du MVP. Les relations principales sont explicites et les tables sensibles disposent de RLS dans Supabase.

## 7. Conformite aux regles produit

| Regle | Etat |
|---|---|
| Aucune XP sans action verifiee | Globalement conforme |
| Le village reagit aux donnees reelles | Conforme |
| Le village ne regresse jamais | Conforme |
| Le parent valide sans jouer a la place de l'enfant | Conforme |
| Missions parent-enfant centrales | Conforme |
| Discovery adaptee a l'age | Conforme sur l'affichage, validation API incomplete |
| Accueil immersif sans dashboard administratif | Conforme |
| Assets originaux/code natif | Conforme |
| TypeScript utilise proprement | Conforme |
| Application pratique au quotidien | Conforme pour le MVP |

## 8. Ecarts et risques prioritaires

### P0 - A corriger avant de considerer la production stable

#### 1. Migration Supabase avancee non appliquee

Symptome deja observe en production :

`column "avatar_icon" does not exist`

La migration `supabase/migrations/202606120001_advanced_phase.sql` ajoute notamment :

- `child_profiles.avatar_icon`
- `child_profiles.avatar_color`
- `user_preferences.push_reminders`
- contenu Discovery avance

Impact :

- La sauvegarde du profil/avatar peut echouer.
- La sauvegarde des preferences peut echouer.
- Certaines fonctions avancees ne correspondent pas au code deploye.

Action :

1. Appliquer la migration avancee dans Supabase.
2. Verifier les colonnes.
3. Redeployer `main`.
4. Tester connexion enfant, parametres, avatar et preferences.

#### 2. La CI PostgreSQL ne teste que la migration initiale

Le workflow applique uniquement `202606110001_initial_lifequest_schema.sql`. Il ignore la migration avancee. La CI peut donc etre verte alors que le code exige des colonnes absentes.

Action :

- Faire appliquer toutes les migrations Supabase dans l'ordre par la CI.
- Ajouter un test d'integration des parametres/avatar sur PostgreSQL.

### P1 - A corriger avant une ouverture publique

#### 3. Transactions incompletes pour les succes

`evaluateAchievements()` ouvre une transaction, mais `qualifies()` interroge le store global au lieu du store transactionnel.

Impact :

- Risque d'incoherence ou de contention sous PostgreSQL.
- Resultat non atomique en cas d'actions concurrentes.

Action :

- Passer le store transactionnel a `qualifies()`.

#### 4. Validation de mission parent-enfant non atomique

La mission est marquee terminee, puis l'XP et les succes sont attribues separement.

Impact :

- Un echec intermediaire peut terminer une mission sans XP.
- Deux validations concurrentes peuvent creer une attribution incorrecte.

Action :

- Grouper verification, changement d'etat, XP et succes dans une transaction.
- Ajouter une condition atomique sur l'ancien statut.

#### 5. Protection enfant et conformite juridique absentes

L'application vise des enfants, mais ne contient pas encore :

- Consentement parental explicite.
- Politique de confidentialite.
- Conditions d'utilisation.
- Export/suppression des donnees.
- Regle de retention.
- Journal des consentements.

Impact :

- Blocage majeur avant un usage public reel avec des mineurs.

#### 6. Authentification encore MVP

Les bearer tokens sont stockes dans `localStorage`.

Action recommandee :

- Passer a des cookies `HttpOnly`, `Secure`, `SameSite`.
- Ajouter expiration/rotation/nettoyage des sessions.
- Ajouter recuperation de mot de passe et verification d'email.

### P2 - Important pour fiabilite et croissance

#### 7. Validation Discovery incomplete

La completion d'un challenge ne verifie pas que le domaine est debloque au niveau actuel du village.

Action :

- Joindre le domaine dans la route de completion et refuser les challenges verrouilles.

#### 8. Calcul des streaks d'habitudes imparfait

Les rythmes hebdomadaires et personnalises ne sont pas pleinement pris en compte dans le streak.

Action :

- Calculer le streak uniquement sur les jours planifies.

#### 9. Progression Garden approximative

Les habitudes personnalisees sont comptees avec un objectif mensuel fixe.

Action :

- Deriver le nombre attendu depuis les jours choisis.

#### 10. Abstraction SQL fragile

La couche PostgreSQL traduit des requetes SQLite avec des remplacements de chaines et regex.

Avantage :

- Simple et rapide pour le MVP.

Risque :

- Toute nouvelle requete SQL peut introduire une incompatibilite silencieuse.

Action :

- Ajouter davantage de tests PostgreSQL.
- A moyen terme, adopter des requetes explicites par moteur ou un query builder typé.

#### 11. Absence de tests frontend et E2E

Les tests actuels couvrent principalement l'API et les services.

Manquent :

- Connexion puis navigation complete.
- Completion quete/habitude et reaction du village.
- Parcours parent-enfant.
- Parametres/avatar.
- Responsive mobile.
- Tests d'accessibilite.

#### 12. Tableau parent peu scalable

Quatre requetes de statistiques sont executees par enfant et l'interface se concentre sur le premier enfant.

Action :

- Agreger les statistiques dans une requete.
- Ajouter un selecteur d'enfant.

#### 13. Notifications seulement partielles

Les notifications internes fonctionnent et la permission navigateur existe, mais aucun push reel n'est envoye.

#### 14. Contrats API manuels

Les types frontend sont maintenus manuellement dans un client API volumineux.

Action :

- Partager des schemas Zod/types ou generer un contrat OpenAPI.

### P3 - Ameliorations produit et finition

- La recherche globale et `Ctrl K` affiches dans l'AppShell ne sont pas fonctionnels.
- Les etats d'erreur, chargement et vide restent inegaux selon les pages.
- Certains textes et noms de niveaux sont trop adultes pour le produit enfant.
- La campagne manque encore de contenu et de boucle longue.
- Le chunk Insights est plus lourd que le bundle principal.
- Les documents historiques du depot ne sont plus tous synchronises avec l'etat reel.
- Aucun script de lint n'est configure.
- Aucun test de restauration/sauvegarde base n'est documente.

## 9. Securite

Points positifs :

- Validation Zod.
- Controle des roles.
- Limiteur de tentatives de connexion.
- Mots de passe hashes.
- RLS active sur les 27 tables Supabase.
- Acces anon/authenticated restreint cote Supabase.
- Limite JSON de 256 Ko.
- CORS configurable.
- `X-Content-Type-Options`, `Referrer-Policy` et `X-Frame-Options`.
- Erreurs API generiques cote client.
- Aucune vulnerabilite connue dans les dependances de production au moment de l'audit.

Points a renforcer :

- Cookies de session securises.
- Content Security Policy.
- Protection CSRF si passage aux cookies.
- Nettoyage automatique des sessions expirees.
- Audit des actions parentales sensibles.
- Secrets uniquement dans Vercel/Supabase, jamais dans Git.
- Consentement parental et gestion du cycle de vie des donnees.
- Tests d'autorisation automatiques sur chaque route sensible.

Le endpoint `/api/diagnostic` n'expose actuellement qu'un booleen indiquant si la base est configuree. Il ne divulgue pas la valeur de `DATABASE_URL`.

## 10. Etat local contre etat production

### Local

Garanti par cet audit :

- Build complet reussi.
- Tests reussis.
- SQLite supporte les fonctions avancees.
- Aucun probleme de dependance de production connu.

### Production Vercel/Supabase

Confirme :

- Vercel peut servir l'application.
- L'API health fonctionne.
- L'API utilise PostgreSQL lorsque `DATABASE_URL` est configuree.
- Le schema initial et les 27 tables sont presents.
- La migration de donnees SQLite vers Supabase a fonctionne.
- Le smoke test read/write PostgreSQL a fonctionne.
- L'integration API PostgreSQL a deja fonctionne apres correction des booleens.

Non garanti tant que la migration avancee n'est pas appliquee :

- Sauvegarde des parametres.
- Sauvegarde et affichage persistant de l'avatar.
- Parite totale entre SQLite et Supabase.
- Toutes les fonctions de phase avancee.

Note : pour eviter un crash de connexion avant migration, `/auth/me` et le dashboard renvoient actuellement un avatar par defaut. Apres migration, il faudra reconnecter ces lectures aux vraies colonnes pour afficher l'avatar persiste.

## 11. Qualite des tests

Tests presents :

- Authentification.
- CRUD habitudes.
- Logs d'habitudes.
- CRUD et completion de quetes.
- XP et progression.
- Deblocage de succes.
- Parcours mission parent-enfant.
- Reviews.
- Objectifs, projets et jalons.
- Focus, Discovery, village et fonctions semaines 7 a 10.
- Notifications internes et profil local.
- Calculs de gamification.
- Calendrier d'habitudes.

Lacunes principales :

- Pas de test E2E navigateur.
- Pas de test visuel.
- Pas de test d'accessibilite.
- Pas de test des colonnes avancees dans la CI PostgreSQL.
- Peu de tests de concurrence et transactions.
- Pas de test de charge.

## 12. Plan d'action recommande

### Etape immediate - Stabiliser la production

1. Appliquer `supabase/migrations/202606120001_advanced_phase.sql`.
2. Modifier la CI pour appliquer toutes les migrations.
3. Reconnecter `/auth/me` et `/dashboard/today` aux colonnes avatar reelles.
4. Redeployer et verifier la release via `/api/health`.
5. Executer le smoke test de deploiement.
6. Tester manuellement enfant, parent, quete, habitude, mission et parametres.

### Etape suivante - Fiabiliser le coeur

1. Corriger les transactions achievements et missions.
2. Bloquer la completion des challenges Discovery verrouilles.
3. Corriger les streaks et objectifs d'habitudes personnalisees.
4. Ajouter des tests PostgreSQL pour chaque action XP critique.
5. Ajouter une suite E2E minimale.

### Avant ouverture publique

1. Remplacer les tokens `localStorage` par des cookies securises.
2. Ajouter inscription, recuperation de mot de passe et gestion des sessions.
3. Mettre en place consentement parental, confidentialite, suppression et export.
4. Ajouter monitoring, alertes, sauvegardes et procedure de restauration.
5. Faire un audit accessibilite/mobile.

### Apres stabilisation

1. Completer le contenu Campagne et Discovery.
2. Implementer les vraies notifications push si elles restent necessaires.
3. Ajouter la gestion multi-enfants.
4. Implementer la recherche globale.
5. Optimiser le bundle Insights.

## 13. Conclusion

LifeQuest dispose d'un vrai coeur produit : boucle quotidienne, progression, village reactif, gamification serveur, objectifs, projets, habitudes, reviews, Discovery et relation parent-enfant. Le projet a depasse le stade prototype.

La priorite absolue n'est plus d'ajouter de nouvelles fonctionnalites. Elle est d'aligner le schema Supabase avec le code, de renforcer les transactions et l'authentification, puis de couvrir les parcours critiques avec des tests E2E. Une fois ces points traites et le cadre de protection des enfants defini, l'application pourra raisonnablement passer d'un MVP personnel/de demonstration a une beta publique controlee.
