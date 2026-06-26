# Rapport d'audit LifeQuest — 12 juin 2026

Audit réalisé depuis le code réel de la branche `main`, commit `485c61a`.

Légende :

- ✅ Fonctionnel et conforme.
- ⚠️ Présent mais incomplet ou approximatif.
- ❌ Absent, cassé ou non garanti.

## Score par domaine

| Domaine | Score | Points validés |
|---|---:|---:|
| Qualité technique | 8/10 | 18/21 points |
| Auth et sécurité | 8/10 | 18/21 points |
| Village et homepage | 8/10 | 25/31 points |
| Quêtes | 8/10 | 11/13 points |
| Habitudes | 8/10 | 11/14 points |
| Objectifs | 8/10 | 11/13 points |
| Projets | 10/10 | 10/10 points |
| Reviews | 9/10 | 9/10 points, avec imprécision de période |
| Focus | 10/10 | 8/8 points |
| Discovery | 9/10 | 7/8 points |
| Missions parent-enfant | 9/10 | 9/10 points |
| Interface parent | 8/10 | 6/7 points |
| Campagne scolaire | 10/10 | 7/7 points |
| Life Areas | 7/10 | 4/6 points |
| Insights | 10/10 | 5/5 points |
| Settings | 6/10 | 4/7 points |
| Gamification | 8/10 | 21/26 points |
| Production Supabase/Vercel | 7/10 | 7/10 points |
| Tests | 6/10 | 10/16 points |
| UX et charte visuelle | 5/10 | 5/10 points |
| **TOTAL** | **162/200** | |

## Détail par section

## SECTION 1 — QUALITÉ TECHNIQUE DE BASE

### 1.1 Build et compilation

- ✅ `npm run build` passe sans erreur TypeScript. Le build frontend Vite et le bundle API Vercel réussissent.
- ✅ `npm test` passe : 20 tests sur 20.
- ✅ `npm audit --omit=dev` retourne 0 vulnérabilité de production connue.
- ✅ Aucun `any` TypeScript explicite non justifié détecté dans les services, routes, store ou client API.
- ✅ Aucun `console.log` de debug frontend. Les logs backend restants sont des logs structurés d'observabilité ou des sorties de scripts CLI.
- ✅ Aucun credential réel hardcodé dans le bundle frontend.
- ✅ Aucun `TODO`, `FIXME` ou `HACK` critique détecté.

### 1.2 Architecture

- ✅ La homepage `/` utilise `ImmersiveHomeLayout` sans sidebar.
- ✅ Les pages internes utilisent `AppShell`.
- ⚠️ `src/features/island/data.ts` est surtout une configuration statique, mais contient encore des valeurs d'état initiales comme `progress`, `level`, `state`, `linkedGoals`, `linkedTasks` et `xpEarned`.
- ⚠️ L'attribution XP et les niveaux sont bien côté backend, mais certains calculs de présentation gamifiée sont dupliqués côté React, notamment le risque de dispersion et plusieurs métriques de homepage.
- ✅ `src/lib/api/client.ts` est le seul point d'entrée HTTP frontend. Aucun `fetch` direct n'a été trouvé dans les composants.
- ⚠️ Zustand gère la session et les collections principales, mais de nombreuses pages chargent et conservent leurs données directement dans leur état React local. Ce n'est pas l'unique source de vérité globale.
- ❌ Plusieurs valeurs présentées comme réelles sont encore dérivées ou statiques : contenu du Weekly Goal, statistiques détaillées des panels de zones et certains fallback de chapitre/avatar.

### 1.3 Base de données

- ✅ Les migrations SQLite sont versionnées dans `server/db/migrations/`.
- ✅ Le seed est conçu pour être idempotent avec `INSERT OR IGNORE`, `NOT EXISTS` et vérifications de compteurs.
- ✅ Les foreign keys SQLite sont activées.
- ✅ Le mode WAL SQLite est activé.
- ✅ Les 27 tables attendues sont présentes dans les schémas SQLite et PostgreSQL.
- ✅ Les contraintes d'unicité critiques existent : email, logs quotidiens, achievements, reviews, village state, sessions et Discovery par période.
- ✅ Des index existent pour les recherches fréquentes principales. La couverture pourrait être enrichie avec la croissance des données.

## SECTION 2 — AUTHENTIFICATION ET SÉCURITÉ

### 2.1 Auth locale

- ✅ `POST /api/auth/login` fonctionne avec email et mot de passe.
- ✅ `GET /api/auth/me` retourne l'utilisateur courant et son rôle.
- ✅ `POST /api/auth/logout` supprime la session correspondant au token.
- ✅ Les mots de passe utilisent `scrypt` avec un sel aléatoire.
- ✅ La comparaison utilise `timingSafeEqual`.
- ✅ Les tokens sont aléatoires, opaques et ne sont pas des JWT.
- ✅ Seul le hash SHA-256 du token est stocké.
- ✅ Les sessions expirent après 30 jours.
- ✅ Un rate limiting de 20 tentatives par 15 minutes existe sur le login.

### 2.2 Contrôle d'accès

- ❌ Toutes les routes Express métier sont protégées, mais `/api/diagnostic` est une fonction Vercel publique supplémentaire non protégée. Elle n'expose actuellement qu'un booléen de configuration.
- ✅ `requireChild` bloque les parents sur les routes enfant.
- ✅ `requireParent` bloque les enfants sur les routes parent.
- ✅ Les requêtes métier filtrent généralement par `user_id`, `child_id` ou `parent_id`.
- ✅ Les guards frontend redirigent vers `/login` sans session.
- ✅ La navigation affiche les liens correspondant au rôle.
- ✅ `/parent` est protégé par `RequireParent`.

### 2.3 Sécurité générale

- ⚠️ CORS est configurable avec `ALLOWED_ORIGINS`, mais devient complètement ouvert si la variable est absente.
- ✅ Les en-têtes `X-Content-Type-Options`, `X-Frame-Options` et `Referrer-Policy` sont présents.
- ✅ Le JSON est limité à 256 Ko.
- ✅ Le gestionnaire d'erreurs retourne un message générique et un request ID, sans stack trace client.
- ✅ Aucun secret réel n'est suivi par Git selon la recherche effectuée. `.env.local` n'a pas été lu pendant cet audit.

Risques complémentaires :

- ⚠️ Les tokens sont stockés dans `localStorage`, donc exposés en cas de XSS.
- ⚠️ Pas de CSP, récupération de mot de passe, vérification email ou nettoyage planifié des sessions expirées.

## SECTION 3 — VILLAGE ET HOMEPAGE

### 3.1 Scène SVG

- ✅ La scène est codée en SVG/React, sans image raster.
- ✅ Les huit zones sont définies et visibles.
- ✅ Chaque zone déverrouillée est cliquable et ouvre un panel.
- ✅ Les labels affichent nom, niveau et progression.
- ✅ Le hover et le focus donnent un feedback visuel.
- ✅ La zone active est mise en évidence.
- ✅ Les bâtiments et labels sont utilisables au clavier avec Entrée ou Espace.
- ⚠️ `prefers-reduced-motion` désactive les animations principales, mais pas toutes les animations, notamment l'avatar, les récompenses et les NPC.

### 3.2 Données du village

- ✅ `GET /api/village/state` calcule les données depuis le store réel SQLite ou PostgreSQL.
- ✅ Home Area reflète les habitudes actives et le taux de complétion sur 30 jours.
- ✅ Garden reflète les logs et streaks d'habitudes.
- ✅ Workshop reflète les projets créés et complétés.
- ✅ Learning Corner reflète la progression moyenne des objectifs.
- ✅ Discovery reflète les challenges complétés.
- ✅ Town Hall reflète la campagne active.
- ✅ Lighthouse reflète les priorités Focus actives.
- ✅ Pathways reflète les weekly reviews.
- ✅ La progression et le niveau des zones ne régressent pas.
- ✅ Le niveau global est calculé depuis l'XP total, à raison de 500 XP par niveau.

Limites :

- ⚠️ Le calcul Garden/Home estime une habitude personnalisée comme 30 occurrences mensuelles, même si elle n'est prévue que certains jours.

### 3.3 HUD

- ✅ XP réel affiché.
- ✅ Niveau réel affiché.
- ✅ Streak réel affiché.
- ✅ Date affichée depuis le navigateur.
- ⚠️ La saison est correctement calculée pour l'hémisphère sud, mais la date n'est pas explicitement forcée sur le fuseau `Australia/Sydney`.
- ✅ État de chargement et erreur affichés.
- ⚠️ Des fallback statiques existent pour le chapitre, le titre de niveau et l'avatar.

### 3.4 Cartes flottantes

- ❌ Today's Focus affiche un compteur combiné de quêtes et habitudes déjà complétées, pas les vraies priorités du jour.
- ❌ Weekly Goal affiche une progression dérivée du jour et un texte statique, pas un véritable objectif hebdomadaire.
- ⚠️ Life Balance utilise la moyenne des zones du village, pas directement les scores `life_areas`.
- ✅ Le compteur de missions parent utilise le nombre de missions en attente.
- ✅ Les cartes ouvrent des panels ou pages cohérents.

## SECTION 4 — QUÊTES

- ✅ `GET /api/quests` retourne les quêtes filtrées par `today`, `active`, `completed` ou `all`.
- ⚠️ `POST /api/quests` accepte titre, description, date, priorité, effort et liens, mais l'XP est fixée à 10 et n'est pas configurable par l'entrée.
- ✅ `PUT /api/quests/:id` modifie une quête.
- ✅ `PATCH /api/quests/:id/complete` complète une quête et attribue l'XP.
- ✅ `DELETE /api/quests/:id` supprime une quête.
- ✅ Une quête déjà complétée ne peut pas être récompensée à nouveau.
- ✅ La complétion crée un `xp_event`.
- ✅ La complétion déclenche l'évaluation des achievements.
- ✅ Le store frontend rafraîchit le village après complétion.
- ✅ Les liens goal/project sont vérifiés comme appartenant à l'utilisateur.
- ⚠️ `/quests` liste, crée, complète et supprime, mais ne propose pas d'interface d'édition malgré l'endpoint disponible.
- ✅ Les filtres de page fonctionnent.
- ✅ Un feedback visuel est affiché après complétion et suppression.

## SECTION 5 — HABITUDES

- ✅ `GET /api/habits` retourne les habitudes avec `completed_today` et `due_today`.
- ✅ `POST /api/habits` crée une habitude avec fréquence, planning personnalisé, catégorie et goal.
- ✅ `PUT /api/habits/:id` modifie une habitude.
- ✅ `DELETE /api/habits/:id` supprime une habitude.
- ✅ `POST /api/habits/:id/log` est idempotent pour le jour.
- ✅ `GET /api/habits/:id/logs` retourne les 30 derniers jours.
- ✅ L'XP n'est attribuée qu'au premier check-in du jour.
- ⚠️ Le streak est recalculé, mais l'algorithme reste quotidien et ne comprend pas correctement les rythmes hebdomadaires/personnalisés.
- ✅ Le streak global est recalculé lors de l'attribution XP.
- ✅ Le bonus de streak sept jours est attribué une seule fois par habitude.
- ⚠️ `/habits` liste, crée, checke et supprime, mais ne propose pas d'édition.
- ✅ Le streak courant est affiché par habitude.
- ❌ L'historique 30 jours existe dans l'API mais n'est pas accessible depuis la page.
- ✅ Le bouton Log Today est désactivé si l'habitude est déjà loguée.

## SECTION 6 — OBJECTIFS

- ✅ `GET /api/goals` retourne les objectifs avec progression.
- ✅ `GET /api/goals/:id` retourne objectif, milestones, notes, tasks et habits liés.
- ✅ `POST /api/goals` crée un objectif.
- ✅ `PUT /api/goals/:id` modifie un objectif.
- ✅ `PATCH /api/goals/:id/complete` attribue 100 XP.
- ✅ `DELETE /api/goals/:id` supprime un objectif.
- ✅ CRUD milestones complet avec XP.
- ✅ CRUD notes complet.
- ⚠️ La progression est calculée par moyenne des pourcentages de milestones, pas par simple pourcentage de milestones complétés.
- ✅ Les catégories proposées dans l'interface sont adaptées aux enfants.
- ⚠️ `/goals` filtre les objectifs et affiche le nombre actif, mais ne présente pas un avertissement de dispersion explicite.
- ✅ `/goals/:goalId` permet édition, complétion, milestones et notes.
- ✅ Les tasks et habits liés sont affichés.

## SECTION 7 — PROJETS

- ✅ `GET /api/projects` retourne les projets de l'utilisateur.
- ✅ `GET /api/projects/:id` retourne le détail complet.
- ✅ `POST /api/projects` crée un projet.
- ✅ `PUT /api/projects/:id` modifie les champs complets.
- ✅ `DELETE /api/projects/:id` supprime un projet.
- ✅ CRUD milestones projet avec XP.
- ✅ CRUD notes projet.
- ✅ `/projects` liste et crée.
- ✅ `/projects/:projectId` permet édition complète, milestones et notes.
- ✅ Le bouton Open ouvre la page détail.

## SECTION 8 — REVIEWS

- ✅ `GET /api/reviews` retourne l'historique.
- ✅ `POST /api/reviews` effectue un upsert par type et `period_start`.
- ✅ La weekly review attribue 75 XP au premier enregistrement.
- ✅ La monthly review attribue également 75 XP.
- ✅ Rhythm Keeper se déclenche à la première weekly review.
- ✅ Le résumé utilise tasks, habitudes, XP, goals et Life Areas.
- ⚠️ La page recharge la review correspondant à la période calculée, mais utilise une fenêtre glissante de 7 ou 30 jours, pas un début de semaine/mois canonique.
- ✅ La weekly review sauvegarde et attribue l'XP au premier submit.
- ✅ La monthly review utilise le même flux.
- ✅ Pathways reflète le nombre de weekly reviews.

## SECTION 9 — FOCUS

- ✅ `GET /api/focus` retourne priorités et challenges de la semaine.
- ✅ `POST /api/focus` impose une principale et deux secondaires maximum.
- ✅ `DELETE /api/focus/:id` supprime une priorité.
- ✅ Le risque de dispersion est calculé et affiché.
- ✅ Les weekly challenges fonctionnent avec progression et XP.
- ✅ `/focus` affiche priorités, challenges et risques.
- ✅ Lighthouse reflète les priorités actives.
- ✅ Le calcul du lundi courant est correct.

## SECTION 10 — DISCOVERY

- ✅ `GET /api/discovery` filtre domaines et challenges selon l'âge et le niveau du village.
- ✅ `PATCH /api/discovery/challenges/:id/complete` complète un challenge.
- ❌ La route de complétion vérifie l'âge, mais pas `unlocked_at_village_level`. Un identifiant connu permet de tenter un challenge verrouillé.
- ✅ Les challenges sont répétables par période.
- ✅ Apprentice Explorer se déclenche.
- ✅ L'XP est attribuée.
- ✅ `/discovery` affiche domaines et challenges.
- ✅ La zone Discovery reflète les complétions.

## SECTION 11 — MISSIONS PARENT-ENFANT

- ✅ `GET /api/missions` filtre selon le rôle connecté.
- ✅ `POST /api/missions` est réservé au parent et vérifie le lien enfant.
- ✅ L'enfant peut soumettre une mission.
- ✅ Le parent ne peut valider qu'une mission `child_submitted`.
- ✅ La validation attribue l'XP à l'enfant.
- ✅ La validation déclenche Co-adventurer.
- ❌ Le changement de statut, l'XP et les achievements ne sont pas regroupés dans une transaction atomique.
- ✅ `/missions` affiche les missions et statuts.
- ✅ L'enfant peut soumettre depuis `/missions`.
- ✅ Le parent peut valider depuis `/parent`.

## SECTION 12 — INTERFACE PARENT

- ✅ `GET /api/parent/children` retourne les enfants liés.
- ✅ `GET /api/parent/dashboard` retourne un résumé.
- ⚠️ `/parent` reçoit XP, streak, quêtes, habitudes et missions, mais n'affiche pas actuellement le streak ni le nombre d'habitudes actives.
- ✅ Le parent peut créer une mission.
- ✅ Le parent peut valider une mission soumise.
- ✅ Le retour au compte enfant fonctionne via Zustand sans rechargement.
- ✅ La session enfant est conservée séparément.

Limite :

- ⚠️ L'interface utilise seulement `children[0]` et n'est pas réellement multi-enfants.

## SECTION 13 — CAMPAGNE SCOLAIRE

- ✅ `GET /api/campaigns` retourne la dernière campagne.
- ✅ `POST /api/campaigns` crée une campagne annuelle.
- ✅ `PATCH /api/campaigns/chapters/:id` met à jour un chapitre.
- ✅ Douze chapitres sont générés.
- ✅ La progression est modifiable.
- ✅ `/campaign` affiche la campagne et les chapitres.
- ✅ Town Hall reflète la campagne active.

## SECTION 14 — LIFE AREAS

- ✅ `GET /api/life-areas` retourne les domaines avec objectifs actifs et activité.
- ✅ `PUT /api/life-areas/:id` met à jour score et tendance.
- ✅ Les scores sont validés entre 0 et 100.
- ❌ Les tendances sont saisies manuellement, pas calculées depuis un historique.
- ✅ `/life-areas` affiche scores, tendances et activité.
- ❌ La carte Life Balance de la homepage utilise les zones du village, pas directement les scores Life Areas.

## SECTION 15 — INSIGHTS ET STATISTIQUES

- ✅ `GET /api/insights` retourne les données réelles.
- ✅ `/insights` charge Recharts.
- ✅ La timeline XP est affichée.
- ✅ L'activité habitudes est affichée sous forme de graphique en barres.
- ✅ La page est chargée en lazy loading dans un chunk séparé.

## SECTION 16 — SETTINGS ET PRÉFÉRENCES

- ✅ `GET /api/preferences` retourne les préférences.
- ⚠️ `PUT /api/preferences` fonctionne localement, mais échoue en production tant que `push_reminders` n'existe pas dans Supabase.
- ✅ `/settings` charge et sauvegarde via l'API.
- ❌ L'API permet nom, âge et niveau scolaire, mais la page ne propose pas de champs pour les éditer.
- ⚠️ Avatar et couleur sont implémentés, mais la migration avancée est requise et `/auth/me` retourne actuellement un avatar fallback hardcodé.
- ✅ Les rappels d'habitudes sont configurables.
- ✅ Les rappels de reviews sont configurables.

## SECTION 17 — GAMIFICATION

### 17.1 XP

- ✅ Quête complétée : XP attribuée une seule fois dans le flux normal.
- ✅ Habitude checkée : XP une seule fois par jour.
- ✅ Streak sept jours : bonus XP unique par habitude.
- ✅ Milestone goal : XP au premier passage à 100 %.
- ✅ Milestone projet : XP au premier passage à 100 %.
- ✅ Goal complété : 100 XP.
- ✅ Weekly review : 75 XP.
- ⚠️ Mission parent : 200 XP par défaut, mais le parent peut configurer une récompense de 0 à 1000.
- ✅ Discovery : XP par période.
- ✅ Achievement : XP unique grâce à la clé primaire `user_achievements`.
- ⚠️ Les protections empêchent généralement les doublons, mais plusieurs flux XP multi-étapes ne sont pas atomiques face aux erreurs ou à la concurrence.

### 17.2 Niveaux

- ✅ Niveau calculé à 500 XP par niveau.
- ❌ Les titres `Serious Operator`, `High-Value Profile` et `Independent Builder` ne sont pas adaptés à l'audience enfant.
- ✅ Le niveau est affiché dans le HUD.

### 17.3 Streaks

- ✅ Le streak global utilise les jours ayant au moins un `xp_event`.
- ⚠️ Le streak par habitude est recalculé depuis les logs, mais ne respecte pas pleinement les jours planifiés.
- ✅ Le streak global revient à zéro si aujourd'hui est sans XP ou si un jour manque.
- ❌ Aucun record global de streak n'est conservé dans `users`. Seuls les records par habitude existent.

### 17.4 Achievements

- ✅ First Quest.
- ✅ First Streak.
- ✅ Apprentice Explorer.
- ✅ Co-adventurer.
- ✅ Rhythm Keeper.
- ✅ Builder.
- ✅ Chaque achievement est unique par utilisateur.
- ⚠️ `evaluateAchievements()` ouvre une transaction, mais `qualifies()` utilise le store global au lieu du store transactionnel.
- ✅ `/achievements` affiche état, date et XP.

## SECTION 18 — PRODUCTION SUPABASE/VERCEL

- ✅ Le schéma initial de 27 tables a été appliqué et vérifié selon les sorties Supabase fournies.
- ❌ La migration avancée n'est pas appliquée sur la production observée. L'erreur `column "avatar_icon" does not exist` le confirme.
- ❌ La CI applique uniquement la migration initiale, pas toutes les migrations dans l'ordre.
- ✅ RLS a été vérifiée active sur 27/27 tables.
- ✅ `/api/health` a retourné un statut OK en production.
- ✅ L'API Vercel utilise PostgreSQL lorsque `DATABASE_URL` est configurée.
- ❌ `/api/auth/me` et `/api/dashboard/today` lisent actuellement des valeurs avatar fallback, pas les colonnes réelles.
- ✅ Le smoke test read/write PostgreSQL a réussi et a rollback sa transaction.
- ✅ Aucun secret réel détecté dans Git.
- ✅ Le build frontend est compatible Vercel.

## SECTION 19 — TESTS

- ⚠️ Auth : login et me testés, mais logout et rejets de rôles ne sont pas explicitement couverts.
- ⚠️ Habits : CRUD, log et XP testés; streak complexe et double log peu vérifiés.
- ⚠️ Quests : CRUD, complétion et XP testés; double complétion non explicitement testée.
- ⚠️ Goals : création, milestone et complétion testés; update/delete peu couverts.
- ⚠️ Projects : création, milestone, note et détail testés; update/delete peu couverts.
- ✅ Reviews : création, upsert, résumé et XP couverts.
- ✅ Focus : création, limite, challenge et XP couverts.
- ⚠️ Discovery : liste, complétion et répétition couvertes; verrouillage par niveau absent et non testé.
- ✅ Missions : création, soumission, validation, XP et achievement couverts.
- ✅ Gamification : XP, niveaux et streak global couverts.
- ✅ Village state : calcul et non-régression partiellement couverts.
- ✅ Campagne : création et douze chapitres couverts.
- ✅ Insights et préférences sont appelés dans les tests API.
- ❌ Aucun test d'isolation multi-utilisateur dédié.
- ❌ Aucun test systématique de rejet enfant/parent par rôle.
- ❌ Aucun test E2E navigateur.

## SECTION 20 — UX ET CHARTE VISUELLE

- ⚠️ La majorité des pages respecte la charte cozy, mais Quests, Habits et `StatCard` conservent des classes sombres/corporate historiques.
- ❌ Des styles `bg-slate-800`, `text-slate-*`, `bg-panel` et `border-line` restent utilisés.
- ⚠️ Les états vides ont un CTA générique qui focalise le premier champ. Il n'est pas pertinent pour tous les cas, notamment Goal not found.
- ⚠️ Les états de chargement existent sur plusieurs pages, mais ne sont pas uniformes.
- ⚠️ Les erreurs sont généralement affichées, mais plusieurs appels secondaires n'ont pas de gestion d'erreur locale.
- ⚠️ Certains boutons sont désactivés pendant les appels, mais pas tous.
- ❌ Des caractères corrompus visibles existent encore : `DÃ©couverte` et plusieurs `Â·`.
- ❌ La recherche globale et `Ctrl K` sont affichés mais non fonctionnels.
- ✅ Une page 404 cozy existe.
- ⚠️ Le code contient de nombreuses règles responsive desktop/tablette, mais aucun test navigateur ou appareil réel ne le garantit.

## Bloquants critiques (P0)

1. ❌ **Migration Supabase avancée absente.** Elle bloque ou casse les avatars et la sauvegarde de `push_reminders` en production.
2. ❌ **CI migrations incomplète.** Une CI verte ne garantit pas actuellement que le schéma exigé par le code existe.
3. ❌ **Avatar production non réellement branché.** `/auth/me` et le dashboard utilisent un fallback hardcodé.

## Points à améliorer (P1)

1. Rendre atomiques la validation de mission, l'attribution XP et les achievements.
2. Faire utiliser le store transactionnel par `qualifies()`.
3. Vérifier le niveau du village lors de la complétion Discovery.
4. Ajouter des tests d'isolation utilisateur et de rejet de rôle.
5. Ajouter une suite E2E navigateur couvrant enfant, parent et settings.
6. Remplacer les tokens `localStorage` par une authentification de production plus sûre.
7. Fermer les interfaces d'édition manquantes pour Quests et Habits.
8. Ajouter l'historique habitudes dans l'interface.
9. Brancher les cartes homepage sur leurs vraies données métier.
10. Définir les exigences de confidentialité, consentement parental, export et suppression pour un produit enfant.

## Points mineurs (P2)

1. Corriger les caractères `DÃ©couverte` et `Â·`.
2. Retirer les derniers styles sombres/corporate.
3. Masquer ou implémenter la recherche globale.
4. Renommer les titres de niveaux pour les enfants.
5. Uniformiser chargements, erreurs et boutons désactivés.
6. Corriger les streaks d'habitudes hebdomadaires et personnalisées.
7. Calculer Life Balance directement depuis les Life Areas si c'est la définition produit souhaitée.
8. Gérer plusieurs enfants dans l'interface parent.
9. Désactiver toutes les animations sous `prefers-reduced-motion`.
10. Remplacer l'abstraction de traduction SQL par une solution moins fragile à moyen terme.

## Prochaines actions recommandées

1. Appliquer `supabase/migrations/202606120001_advanced_phase.sql` sur Supabase.
2. Modifier la CI pour appliquer toutes les migrations Supabase dans l'ordre.
3. Rebrancher les lectures avatar de `/auth/me` et `/dashboard/today` sur les vraies colonnes.
4. Redeployer puis tester login, settings, avatar et préférences en production.
5. Corriger les transactions Missions et Achievements.
6. Bloquer la complétion Discovery des domaines verrouillés.
7. Ajouter des tests PostgreSQL pour settings/avatar, transactions, isolation et rôles.
8. Ajouter une suite E2E minimale : login enfant, quête, habitude, village, parent, mission et settings.
9. Fermer les trous UX de Quests/Habits et corriger les caractères corrompus.
10. Définir le cadre sécurité et conformité avant toute ouverture publique à des enfants.

## Verdict final

LifeQuest est un MVP full-stack réel et avancé, pas une simple maquette. Son cœur quotidien fonctionne : authentification, actions, XP, objectifs, projets, reviews, Focus, Discovery, village dynamique et relation parent-enfant.

Il n'est cependant pas encore possible de garantir une production complète et propre. Le décalage de migration Supabase est le principal blocage immédiat. Ensuite, les priorités doivent être la cohérence transactionnelle, les tests d'autorisation/E2E, puis la finition UX et la protection des données enfant.
