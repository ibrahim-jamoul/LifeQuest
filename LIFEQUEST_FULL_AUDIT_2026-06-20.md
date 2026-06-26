# LifeQuest - Audit complet application - 2026-06-20

Audit realise depuis `C:\Users\ibraj\Documents\New project\lifequest-dashboard`.

Etat audite:

- Branche: `codex/island-viewport-harmonizer`
- HEAD: `5ae8b90 Wire wide island camera scene`
- Worktree: contient les modifications Phase 2 non commit sur la scene ile.
- L'audit a ajoute ce fichier de rapport, mais n'a pas modifie le code applicatif.

Important: ce rapport est volontairement en ASCII pour ne pas ajouter de nouveaux problemes d'encodage.

## 1. Resume executif

L'application est globalement fonctionnelle aujourd'hui.

Ce qui est solide:

- Le build production passe.
- Les tests Vitest passent: 4 fichiers, 28 tests.
- Les tests Playwright e2e passent: 4 parcours navigateur.
- L'auth child/parent existe et les protections de role sont testees.
- La separation frontend React / API Express / store DB est claire.
- La scene ile utilise maintenant un wrapper global pour camera, fond et assets, ce qui respecte la contrainte de ne pas recalculer chaque asset separement.
- La CI GitHub couvre build, tests, e2e, audit critique et verification PostgreSQL/Supabase.
- Le mode production avec PostgreSQL/Supabase est documente.

Ce qui bloque une qualite propre avant grosse suite visuelle:

- Beaucoup de textes UI sont corrompus par encodage: `Â·`, `DÃ©couverte`, `â€™`, etc.
- Les assets PNG de l'ile sont tres lourds: plusieurs fichiers entre 1 Mo et 2.5 Mo.
- La scene/camera marche, mais reste fragile car elle depend de dimensions et offsets hardcodes.
- Plusieurs composants/couches d'ancienne scene restent dans le code mais ne sont plus branches.
- Les etats d'erreur frontend sont inconsistants selon les pages.
- Certaines operations XP/achievements ne sont pas transactionnelles.
- Le store PostgreSQL repose sur une traduction SQL par regex fragile.
- Il n'y a pas de lint script, pas de verification `noUnusedLocals`, pas de test visuel pour la carte/camera.

Conclusion courte:

- Pour continuer Phase 3, oui techniquement la base tient.
- Mais avant d'ajouter beaucoup d'assets statiques, il faut au minimum corriger l'encodage visible, clarifier les couches mortes, et garder le systeme camera tel quel sans le complexifier.

## 2. Validations executees

Commandes lancees pendant l'audit:

```text
npm.cmd audit --omit=dev
npm.cmd run build
npm.cmd test -- --run
npm.cmd run test:e2e
npm.cmd audit --audit-level=critical
npm.cmd outdated
```

Resultats:

```text
npm audit --omit=dev: 0 vulnerabilities
npm run build: OK
Vitest: 4 files passed, 28 tests passed
Playwright e2e: 4 tests passed
npm audit --audit-level=critical: exit OK, 1 low dev vulnerability on esbuild
```

Build output notable:

```text
dist/assets/index-B7co0Kam.css         53.47 kB gzip 8.81 kB
dist/assets/index-ssYfvM6C.js         344.23 kB gzip 97.81 kB
dist/assets/InsightsPage-DsKaCN87.js  384.71 kB gzip 102.60 kB
```

Interpretation:

- Le build est propre.
- Le chunk `InsightsPage` est assez gros pour une page secondaire.
- Le bundle principal reste acceptable mais a surveiller.
- Le vrai poids perf vient surtout des images PNG.

E2E:

```text
auth.e2e.ts: OK
child-daily-loop.e2e.ts: OK
parent-mission.e2e.ts: OK
settings.e2e.ts: OK
```

Limite e2e:

- Pas de test e2e camera.
- Pas de test e2e drag/pinch/wheel.
- Pas de test responsive de la scene ile.
- Pas de test visuel screenshot.
- Pas de test axe/accessibility.

## 3. Etat Git et perimetre

Worktree actuel:

```text
M src/features/island/scene/AmbientEffects.tsx
M src/features/island/scene/BridgeLayer.tsx
M src/features/island/scene/BuildingLayer.tsx
M src/features/island/scene/CodedIslandScene.tsx
M src/features/island/scene/IslandBuilding.tsx
M src/features/island/scene/IslandZoneMarker.tsx
?? APPLICATION_AUDIT_2026-06-12.md
?? LIFEQUEST_EXHAUSTIVE_AUDIT_2026-06-12.md
?? public/assets-images-export/
```

Les 6 fichiers modifies correspondent a la Phase 2:

- Nettoyage structurel de scene.
- Regroupement de constantes de dimensions.
- Ajout de noms de layers.
- Extraction de listes statiques pour ambience, ponts, villagers.
- Suppression d'un prop inutilise `color`.

Fichiers non suivis:

- `APPLICATION_AUDIT_2026-06-12.md`
- `LIFEQUEST_EXHAUSTIVE_AUDIT_2026-06-12.md`
- `public/assets-images-export/`

Ces fichiers ne sont pas traites comme source de verite actuelle.

Point important:

- `api/index.mjs` est suivi par Git.
- Il est genere par `tools/build-vercel-api.mjs`.
- Ce choix marche, mais peut creer du bruit si le build change le fichier genere.

## 4. Architecture globale

Stack:

- Frontend: React 18, TypeScript, Vite, Tailwind, React Router, Zustand.
- Backend: Express 5, TypeScript via `tsx`.
- DB locale: SQLite via `node:sqlite`.
- DB prod: PostgreSQL/Supabase via `pg`.
- Tests: Vitest + Playwright.
- Deploiement: Vercel frontend static + API serverless bundle.

Structure:

```text
src/
  components/
  config/
  features/island/
  layouts/
  lib/api/
  pages/
  store/
  types/
server/
  db/
  middleware/
  routes/
  services/
tests/
  e2e/
supabase/
  migrations/
tools/
```

Jugement:

- L'architecture est comprehensible.
- Les domaines principaux sont separes.
- Le frontend a encore beaucoup de pages tres denses, parfois en gros JSX inline.
- Le backend a une bonne separation routes/services/db, mais beaucoup de logique metier vit directement dans les routes.

## 5. Scripts et config

`package.json`

OK:

- `dev` lance API et web ensemble.
- `build` fait TypeScript, Vite, puis bundle API.
- `test` lance Vitest.
- `test:e2e` lance Playwright.
- Scripts PostgreSQL/Supabase presents.

Problemes:

- Pas de script `lint`.
- Pas de script `typecheck` separe, meme si `build` fait `tsc -b`.
- Pas de script dedie pour audit complet local.
- Les versions majeures recentes existent, mais migration a traiter prudemment.

Dependances obsoletes:

```text
@playwright/test 1.60.0 -> 1.61.0
esbuild 0.28.0 -> 0.28.1
pg 8.21.0 -> 8.22.0
react-router-dom 7.17.0 -> 7.18.0
React 18.3.1 -> React 19.2.7
Tailwind 3.4.19 -> 4.3.1
Recharts 2.15.4 -> 3.8.1
Zod 3.25.76 -> 4.4.3
Vitest 3.2.6 -> 4.1.9
TypeScript 5.9.3 -> 6.0.3
```

Recommandation:

- Faire d'abord updates mineures securite/outillage: `esbuild`, `pg`, Playwright.
- Garder React 19, Tailwind 4, Zod 4, Recharts 3, Vitest 4 pour une phase dediee.

`vite.config.ts`

OK:

- Port web `3000`.
- Proxy `/api` vers `localhost:4000`.

Risque:

- Aucun proxy conditionnel par environnement, mais c'est acceptable pour local.

`playwright.config.ts`

OK:

- Lance son propre serveur e2e sur `3100`.
- API e2e sur `4100`.
- DB e2e separee `./data/e2e.db`.
- `prepare-e2e` reset la DB.

Limite:

- Un seul projet navigateur Chromium desktop.
- Pas de mobile.
- Pas de screenshot golden.

`tailwind.config.js`

OK:

- Theme cozy defini.
- Couleurs principales coherentes.

Problemes:

- `bg-warning-soft` est utilise mais non defini.
- Les grands radius cozy peuvent donner un style tres rond partout. Ce n'est pas un bug, mais a surveiller pour les panneaux denses.

`tsconfig.json`

OK:

- `strict: true`.
- Inclut `src`, `server`, `tests`.

Limites:

- Pas de `noUnusedLocals`.
- Pas de `noUnusedParameters`.
- Pas de `exactOptionalPropertyTypes`.
- Cela explique pourquoi des composants morts peuvent rester sans signal.

## 6. CI et deploiement

`.github/workflows/ci.yml`

OK:

- Build.
- Vitest.
- Playwright e2e.
- `npm audit --audit-level=critical`.
- Verification PostgreSQL/Supabase avec service Postgres 16.
- Verification RLS/table count.
- Migration seed SQLite vers Postgres.
- Test API avec runtime PostgreSQL.

Limites:

- Branches CI: `main`, `migration-supabase`, PR vers `main`.
- La branche actuelle `codex/island-viewport-harmonizer` n'est pas une branche cible explicite sauf PR.
- L'audit CI ne bloque que critical, pas low/moderate.
- Pas de lint.
- Pas de visual regression.

`DEPLOYMENT.md`

OK:

- Explique `DATABASE_URL`, `DATABASE_SSL`, `ALLOWED_ORIGINS`.
- Dit de ne pas mettre `DIRECT_URL` sur Vercel.
- Explique rotation des mots de passe demo.
- Explique smoke test deployment.

Problemes:

- Texte corrompu: exemple `Project Settings â†’ Deployment Protection`.
- Mentionne `migration-supabase` comme branche initiale, peut etre stale par rapport au flux actuel.

`vercel.json`

OK:

- `buildCommand`: `npm run build`.
- `outputDirectory`: `dist`.
- Rewrites `/api/:path*` vers API.
- Rewrites SPA vers `index.html`.

Risque:

- Depend du bundle `api/index.mjs`.
- `tools/build-vercel-api.mjs` target `node22`, alors que README/CI demandent Node 24+. A clarifier.

## 7. Frontend routing et layouts

`src/App.tsx`

OK:

- Routing clair.
- Guard child/parent.
- Home immersive separee des pages internes.
- Parent routes protegees.

Risque:

- Beaucoup de pages internes sont montees sous un guard parent global, puis `RequireChild`/`RequireParent` decide. C'est correct, mais il faut garder les redirections claires.

`src/main.tsx`

OK:

- Monte React proprement.
- Charge `styles.css`.
- Encapsule dans `AppErrorBoundary`.

`src/layouts/AppShell.tsx`

OK:

- Sidebar responsive.
- Notifications locales integrees.
- Logout.

Problemes:

- Texte corrompu ligne XP: `XP Â· next level`.
- Notifications chargees via GET qui genere aussi des notifications cote serveur.
- Panneau notifications pas declare comme dialog/menu; accessibilite perfectible.

`src/layouts/ImmersiveHomeLayout.tsx`

OK:

- Laisse la scene ile prendre l'ecran.

## 8. Store frontend et API client

`src/store/index.ts`

OK:

- Zustand centralise token, user, today snapshot, village, quests, habits.
- `bootstrap` charge auth puis donnees enfant.
- Support switch child/parent.
- Nettoyage local au logout meme si API indisponible.

Problemes:

- Les tokens sont stockes en `localStorage`.
- En production publique, `localStorage` augmente l'impact d'un XSS.
- `refreshToday`, `refreshVillage`, `refreshCollections` peuvent throw et ne gerent pas toujours l'erreur au niveau appelant.
- Certaines actions absorbent l'erreur dans le store sans throw; d'autres pages appellent API directement. Le comportement UX devient inconsistent.

`src/lib/api/client.ts`

OK:

- Client API simple.
- Typage domain assez complet.
- Gestion standard des erreurs HTTP.
- Support role tokens child/parent.

Problemes:

- `API_URL` statique via env ou `/api`, correct mais sans timeout/cancel.
- Pas de retry ou gestion 401 globale.
- Pas de refresh session.
- Tous les clients sont dans un seul gros fichier de 336 lignes.

Recommandation:

- Garder simple pour l'instant.
- Plus tard, split par domaine: `authApi`, `questApi`, `goalApi`, etc.
- Ajouter une gestion 401 centrale si l'app devient publique.

## 9. Design system et CSS

`src/styles.css`

OK:

- Base Tailwind propre.
- Tokens cozy coherents.
- Focus visible global.
- `prefers-reduced-motion` present.
- Classes camera regroupees.
- Styles scene ile centralises.

Problemes:

- Beaucoup de styles critiques hardcodes en CSS: aspect ratio `1672 / 941`, overscan `1.06`.
- `island-stage` transform est defini en CSS et aussi en inline style dans `CodedIslandScene`.
- `bg-warning-soft` utilise dans `EmptyState`, mais pas defini dans Tailwind.
- Beaucoup de styles en valeurs hex inline/Tailwind arbitraire, ce qui rend la palette plus difficile a maintenir.
- Les animations existent encore pour des couches qui ne sont plus branchees.

`src/components/EmptyState.tsx`

Problemes:

- Utilise `bg-warning-soft` absent.
- Action par defaut focus le premier input du premier form via `document.querySelector`.
- Sur certaines pages, le bouton "Go back" ou "Open review" ne fait donc pas ce que l'utilisateur attend.

`src/components/Modal.tsx`

OK:

- Escape.
- Focus trap.
- Restore focus.
- Click backdrop.

`src/components/ConfirmDialog.tsx`

OK:

- Reutilise `Modal`.

`src/components/Tabs.tsx`

OK:

- Roles tablist/tab/tabpanel.
- Navigation clavier.

Limite:

- Pas d'`aria-orientation`, pas critique.

## 10. Scene ile et camera

Fichiers principaux:

```text
src/features/island/IslandDashboard.tsx
src/features/island/data.ts
src/features/island/scene/CodedIslandScene.tsx
src/features/island/scene/BuildingLayer.tsx
src/features/island/scene/AmbientEffects.tsx
src/styles.css
```

Ce qui marche:

- La camera agit globalement sur un seul wrapper/stage.
- Fond, batiments, labels, zones cliquables et ambience restent dans le meme SVG/stage.
- Drag souris/pointer, wheel zoom, pinch mobile tentatif sont implementes.
- Zoom borne entre `1` et `1.6`.
- Pan borne dynamiquement.
- Bouton camera flottant en grille 3x3.
- Ouvert: les boutons partent du centre et vont dans la grille.
- Ferme: seul le bouton principal reste visible.

Contraintes utilisateur respectees:

- Pas de recalcul asset par asset pour la camera.
- Pas de deplacement relatif separe image/assets/zones.
- Positionnement relatif conserve via transform global.

Fragilites:

- `IslandDashboard.tsx` ligne 51 utilise `document.querySelector(".island-viewport")` pour calculer les bounds.
- Si plusieurs scenes existent un jour, ou si la classe change, la camera peut mesurer le mauvais element.
- `MAP_ASPECT_RATIO`, `ISLAND_STAGE_OVERSCAN`, dimensions wide map et offsets sont hardcodes.
- `CodedIslandScene.tsx` contient les constantes d'enregistrement de l'ancien repere vers la nouvelle image.
- C'est acceptable temporairement, mais c'est le coeur fragile de la scene.

Details Phase 2:

- `CodedIslandScene.tsx`: constantes regroupees en `WIDE_MAP`, `ORIGINAL_SCENE`, `ORIGINAL_SCENE_ON_WIDE_MAP`.
- `registeredAssetLayerTransform` rend l'intention plus lisible.
- `BuildingLayer.tsx`: layers nommes `island-building-layer`, `island-zone-marker-layer`, `island-zone-label-layer`.
- `BridgeLayer.tsx`: pont converti en data typed array + `pointerEvents="none"`.
- `AmbientEffects.tsx`: ambience separee en arrays `clouds`, `ambientProps`, `frontVillagers`.
- `IslandBuilding.tsx`: prop `color` inutilise retire.
- `IslandZoneMarker.tsx`: appel ajuste.

Ce qui reste pas propre:

- `IslandDashboard.tsx` fait trop de choses: data mapping, camera, gestures, HUD, onboarding, panels.
- Taille: 377 lignes.
- On devrait extraire plus tard un hook `useIslandCamera`.
- Ne pas le faire avant stabilisation visuelle, sauf si on touche lourdement la camera.

Anciennes couches encore presentes mais non branchees:

```text
src/features/island/scene/IslandTerrain.tsx
src/features/island/scene/OceanLayer.tsx
src/features/island/scene/RiverLayer.tsx
src/features/island/scene/PathLayer.tsx
src/features/island/scene/VegetationLayer.tsx
```

Ces fichiers sont suivis par Git mais non importes dans `CodedIslandScene.tsx`.

Decision recommandee:

- Ne pas supprimer maintenant si Phase 3 doit encore bouger.
- Les marquer comme legacy ou les retirer apres validation visuelle finale.

## 11. Assets ile

Nombre d'assets ile suivis:

```text
46 fichiers dans public/assets/island
```

Plus gros PNG:

```text
garden-lv1.png                       1254x1254  2512.0 KB
island-terrain-base.png              1672x941   2461.7 KB
learning-corner-lv1.png              1254x1254  2404.0 KB
market-square-lv1.png                1254x1254  2374.0 KB
island-terrain-wide.png              1672x941   2173.8 KB
workshop-lv1.png                     1254x1254  2166.8 KB
home-area-lv1.png                    1254x1254  1929.6 KB
pathways-lv1.png                     1672x941   1909.5 KB
town-hall-lv1.png                    1254x1254  1902.2 KB
ocean-contour.png                    1672x941   1892.4 KB
bridge-main.png                      1672x941   1699.0 KB
lighthouse-lv1.png                   1254x1254  1641.4 KB
hot-air-balloon.png                  1254x1254  1554.7 KB
villager-bear-front.png              1254x1254  1466.8 KB
sailboat.png                         1448x1086  1418.9 KB
cloud-soft-02.png                    1024x1024  1336.3 KB
villager-rabbit-front.png            1254x1254  1320.4 KB
villager-fox-front.png               1254x1254  1236.4 KB
```

Probleme:

- Les images sont souvent beaucoup plus grandes que leur rendu final.
- Exemple: villager front 1254x1254 rendu en 45-48 px.
- Exemple: plusieurs batiments 1254x1254 rendus autour de 90-174 px.

Impact:

- Chargement plus lent.
- Memoire GPU/CPU plus elevee.
- Risque mobile.
- Temps de decode PNG inutile.

Recommandation:

- Ne pas changer les pixels sources de la map maintenant.
- Creer des versions web optimisees separees apres validation visuelle.
- Utiliser PNG quantized ou WebP/AVIF selon besoin transparence.
- Garder les originaux dans un dossier source non charge par l'app.

Assets non suivis:

```text
public/assets-images-export/
```

Observation:

- Dossier complet d'export non suivi.
- Il ressemble a une source/export temporaire.
- Ne pas le push tel quel sans decision.

## 12. Pages frontend

### LoginPage

OK:

- Auth simple.
- Redirection parent/child.
- Erreur visible.

Limite:

- Form inline dense.
- UI en anglais alors que certaines pages sont mixtes FR/EN.

### TodayPage

OK:

- Utilise le store.
- Complete quest/log habit.
- Loading state.

Problemes:

- Navigation via `window.location.assign`.
- Cela force un comportement moins React Router.

### QuestsPage

OK:

- CRUD/edit/delete/complete.
- Liens goal/project.
- Flash messages.

Problemes:

- Stat card "Loading / Bootstrap state" fait debug/admin.
- Texte corrompu sur separateur.
- Pas de loading local distinct pour les listes goal/project.
- Gros JSX dense.

### HabitsPage

OK:

- CRUD/edit/history/delete.
- Historique 30 jours.

Problemes:

- Stat card "Loading / Bootstrap state" fait debug/admin.
- Texte corrompu.
- `custom_schedule` est un texte libre, UX pas guidee.

### GoalsPage

OK:

- Liste, filtre, creation.
- Erreurs de creation affichees.

Problemes:

- `DÃ©couverte` detecte dans categories/navigation.
- EmptyState sans `onAction`: focus premier input, acceptable ici mais implicite.

### GoalDetailPage

OK:

- Detail complet: goal, milestones, notes, tasks, habits.
- Edition goal.
- Completion goal.

Problemes:

- Tres gros fichier: 314 lignes.
- EmptyState "Goal not found" avec action "Go back" sans handler.
- Progress bar milestone invisible: track et fill sont tous deux `bg-cream-secondary`.
- Beaucoup d'actions async sans catch local.
- Les operations XP cote serveur ne sont pas toutes transactionnelles.

### ProjectsPage

OK:

- Liste et creation.
- Erreurs load/create.

Problemes:

- EmptyState sans handler.

### ProjectDetailPage

OK:

- Detail project, milestones, notes.
- Erreur load/update.
- Confirm delete.

Problemes:

- Delete utilise `window.location.assign("/projects")`.
- Certains boutons d'edition/suppression sont moins standardises.

### DiscoveryPage

OK:

- Domaines + challenges.
- Completion XP.

Problemes:

- Pas d'error state local.
- Completion peut throw sans affichage propre.
- Texte `Complete Â·`.

### FocusPage

OK:

- Main/secondary focus.
- Weekly challenges.
- Erreur create affichable.

Problemes:

- Initial load sans catch clair dans `useEffect`.
- Creation challenge sans catch.
- Risque UX si objectifs/projets vides.

### CampaignPage

OK:

- Creation campagne.
- Chapitres mensuels.
- Update progress.
- Print.

Problemes:

- Progress bar invisible: track et fill tous deux `bg-cream-secondary`.
- Pas de catch load/create/update.
- Mois Sep-Aug hardcodes.
- Calcul current chapter cote dashboard depend d'un mapping mois assez arbitraire.

### InsightsPage

OK:

- Erreur load geree.
- Charts Recharts.

Problemes:

- Gros chunk lazy: 384.71 kB, gzip 102.60 kB.
- GET insights genere aussi des notifications cote serveur.

### MissionsPage

OK:

- Liste missions.
- Submit mission avec catch.

Problemes:

- Initial load sans catch.

### ParentAccessPage

OK:

- Switch parent avec conservation child token.
- Erreurs affichees.

### ParentPage

OK:

- Dashboard parent.
- Creation mission.
- Validation mission.
- Erreur load.

Problemes:

- Creation/validation peuvent throw sans catch local dedie.
- UX parent encore tres simple.

### AchievementsPage

OK:

- Liste achievements.
- Loading.

Problemes:

- Pas d'error state.
- Depend de bootstrap + API chain sans catch.

### LifeAreasPage

OK:

- Load/update avec error state.

Limite:

- Pas de loading state visible initial.

### ReviewPage

OK:

- Weekly/monthly review.
- Parse existing JSON avec fallback.
- Save state.

Problemes:

- Message unique pour succes/erreur.
- Texte corrompu.

### ReviewsHubPage

Probleme:

- EmptyState "Open review" sans `onAction`, donc action implicite incorrecte.

### NotFoundPage

OK:

- Route 404 custom.

Probleme:

- Texte source actuel dans certains scans et docs a montre des corruptions; verifier visuellement que la version sauvegardee est bien UTF-8.

## 13. Backend API

`server/app.ts`

OK:

- Express app propre.
- JSON limit `256kb`.
- CORS configurable.
- `x-powered-by` disable.
- Headers: `nosniff`, `no-referrer`, `X-Frame-Options DENY`.
- Health endpoint.
- Error handler global.

Probleme:

- Si `ALLOWED_ORIGINS` est absent, CORS est ouvert avec `origin: true`.
- Pour local c'est pratique.
- Pour prod, c'est dangereux si env mal configuree.

`server/middleware/auth.ts`

OK:

- Bearer token.
- Session hash en DB.
- Role guards child/parent.
- Expiration verifiee.

Limite:

- Pas de rotation/session refresh.

`server/services/auth.ts`

OK:

- `scryptSync` avec salt random.
- Token random 32 bytes, hash SHA-256 stocke.
- Sessions 30 jours.

Limite:

- Pas de cout configurable.
- Pas de policy password hors scripts de rotation demo.

`server/routes/auth.ts`

OK:

- Rate limit login.
- Login/me/logout/profile.
- Profile update transactionnel.

Limite:

- Rate limit en memoire, pas distribue.
- Demo accounts doivent absolument etre rotates en prod.

`server/routes/quests.ts`

OK:

- CRUD.
- Completion verifie user.
- Ownership goal/project.
- Zod validation.

Probleme:

- Completion task + XP + achievements hors transaction.
- Si XP echoue apres task complete, etat incoherent possible.

`server/routes/habits.ts`

OK:

- CRUD.
- Due today.
- Log quotidien idempotent via upsert.
- Streak.

Problemes:

- Log + XP + achievement hors transaction.
- Calcul streak combine SQL local date et JS Date, a tester en timezone extreme.
- Custom schedule parser simple.

`server/routes/goals.ts`

OK:

- CRUD.
- Detail goal avec tasks/habits/notes/milestones.
- Empêche completion directe via update pour garder XP verifie.

Problemes:

- Complete goal + XP + achievements hors transaction.
- Milestone complete + XP hors transaction.
- Fichier dense: 201 lignes.

`server/routes/projects.ts`

OK:

- CRUD.
- Detail project.
- Milestones/notes.
- Ownership task project.

Problemes:

- Milestone update + XP hors transaction.
- Status/priority project moins stricts que goals.

`server/routes/missions.ts`

OK fort:

- Parent create.
- Child submit.
- Parent validate.
- Validation utilise `store.transaction`.
- XP + achievements dans la transaction.
- Tests authorization couvrent isolation.

`server/routes/parent.ts`

OK:

- Parent dashboard.
- Liste children.
- Role protected.

`server/routes/dashboard.ts`

OK:

- Snapshot today complet.
- Donnees progression/focus/life balance.

Problemes:

- Logique school month hardcodee.
- Beaucoup de SQL dans route.
- Parent bloque manuellement sur `/today` plutot que `requireChild` direct.

`server/routes/village.ts`

OK:

- Simple.
- `getVillageState`.

`server/services/village.ts`

OK:

- Village state persistant et non-regressant.
- Zones calculees depuis actions reelles.

Problemes:

- Mapping zone `home` / `home_area`, `market` / `discovery` a surveiller.
- Formules de progression approximatives, pas toujours documentees.

`server/routes/discovery.ts`

OK:

- Age group.
- Village level lock.
- Bloque completion si challenge lock connu par id.

Probleme important:

- `periodKey` utilise JS `toISOString`, donc UTC.
- Le reste de l'app utilise souvent SQL `date('now','localtime')`.
- Risque de divergence jour/semaine/mois selon timezone.

`server/routes/focus.ts`

OK:

- Main/secondary limit.
- Weekly challenge.
- Ownership goal/project.

Problemes:

- XP challenge hors transaction.
- Week start SQL traduit par regex en Postgres.

`server/routes/lifeAreas.ts`

OK:

- Liste/update.
- Zod score/trend.

`server/routes/campaigns.ts`

OK:

- Creation campagne 12 chapitres.
- Progress non-regressant.
- Annual summary.

Problemes:

- Mois hardcodes September-August.
- Ne correspond pas forcement a tous pays/rythmes scolaires.

`server/routes/insights.ts`

OK:

- XP timeline.
- Habit heatmap.
- Totals.

Probleme:

- Genere des notifications pendant un GET.
- Logique dupliquee avec `notifications.ts`.

`server/routes/notifications.ts`

OK:

- List, mark read, mark all read.
- Evite doublons journaliers.

Problemes:

- Generation side effect pendant GET.
- La logique est dupliquee avec insights.

`server/routes/reviews.ts`

OK:

- Weekly/monthly reviews.
- Upsert par periode.
- Resume genere.
- XP seulement premier save.

Problemes:

- Save review + XP + achievements hors transaction.
- Date windows utilisent `date(created_at)` sans toujours `localtime`.

## 14. Database et migrations

SQLite:

- `server/db/schema.sql` contient tout le schema local.
- `server/db/migrations` contient 001 a 006.
- `server/db/init.ts` initialise.
- `server/db/migrate.ts` applique migrations.
- `server/db/seed.ts` cree demo child/parent.

Postgres/Supabase:

- `supabase/migrations/202606110001_initial_lifequest_schema.sql`
- `supabase/migrations/202606120001_advanced_phase.sql`
- CI verifie 27 tables et RLS enabled.

OK:

- Schema riche.
- Foreign keys.
- Indexes.
- Migrations versionnees.
- RLS activee et privileges anon/authenticated revoked.

Point subtil:

- RLS est activee, mais il n'y a pas de policies applicatives visibles dans la migration initiale.
- Comme l'app utilise Express/DB server-side et revoke direct API roles, c'est defense in depth.
- Si un jour Supabase client direct est utilise depuis frontend, il faudra des policies completes.

`server/db/store.ts`

OK:

- Abstraction unique `Store`.
- SQLite et Postgres partagent interface.
- Transactions exposees.

Risque fort:

- Traduction SQLite vers Postgres par `replaceAll` et regex.
- Exemples: `date('now','localtime')`, `INSERT OR IGNORE`, booleans, `MAX(...)`.
- Ca marche parce que les requetes sont connues/testees, mais c'est fragile si on ajoute du SQL nouveau.

Recommandation:

- Continuer a couvrir chaque nouvelle query sensible avec test Postgres.
- A moyen terme, remplacer par requetes explicites par runtime ou query builder minimal.

## 15. Securite

Points OK:

- Password hashing avec scrypt + salt.
- Tokens random, hash stocke en DB.
- Bearer sessions expirees.
- Role guards.
- Rate limit login.
- Headers securite de base.
- CORS configurable.
- Authorization tests couvrent isolation child/parent.

Risques:

- Tokens en localStorage.
- CORS ouvert si `ALLOWED_ORIGINS` absent.
- Demo accounts/passwords dans seed, donc rotation obligatoire avant prod.
- Rate limit in-memory.
- Pas de CSRF car bearer/localStorage, mais XSS deviendrait critique.
- Pas de CSP.
- Pas de sanitization speciale car pas de `dangerouslySetInnerHTML`, bon point.

Cherches effectuees:

- Pas de `dangerouslySetInnerHTML`.
- Pas de `eval`.
- Pas de `debugger`.
- `localStorage` limite au client API.

Recommandation prod:

- Ajouter CSP.
- Garder `ALLOWED_ORIGINS` exact.
- Rotation demo obligatoire.
- Evaluer cookie httpOnly si app devient publique sensible.

## 16. Accessibilite et UX

Points OK:

- Focus visible global.
- Modal accessible.
- Certaines zones SVG ont `role="button"`, `tabIndex`, Enter/Space.
- Camera buttons ont `aria-label`.
- Reduced motion global.

Problemes:

- Camera menu utilise `role="dialog"` conditionnel dans un grid flottant sans panneau reel; pas catastrophique mais semantiquement discutable.
- Notification dropdown pas un menu/dialog complet.
- Certains boutons icon-only ont labels, d'autres actions page sont moins explicites.
- EmptyState default action peut etre faux.
- Beaucoup de texte anglais dans une experience probablement francophone.
- Encodage corrompu casse la perception qualite.

## 17. Encodage et contenu texte

Probleme visible majeur:

Patterns detectes:

```text
Â
Ã
â€™
DÃ©couverte
```

Exemples:

- `src/features/island/IslandDashboard.tsx`: `Chapter One Â· New beginnings`
- `src/layouts/AppShell.tsx`: `XP Â· next level`
- `src/pages/FocusPage.tsx`: `Completed · +100 XP` selon encoding source/terminal
- `src/pages/DiscoveryPage.tsx`: `Complete Â·`
- Plusieurs pages ont des apostrophes corrompues.
- `DEPLOYMENT.md` contient `â†’`.

Impact:

- L'app semble non finie.
- Peut casser la confiance utilisateur.
- Peut rendre certains labels absurdes.

Priorite:

- P1 tres haut.
- A corriger avant toute grosse passe UI/UX.

## 18. Performance

Points OK:

- Build Vite code split `InsightsPage`.
- React app pas enorme cote JS.

Problemes:

- PNG trop lourds.
- Beaucoup de gros assets affiches en petit.
- Pas de preloading strategy visible.
- Pas de responsive image pipeline.
- Pas de compression/quantization assets.
- Possible cout de decode fort sur mobile.

Priorite:

- Optimiser assets apres validation visuelle.
- Ne pas modifier l'image centrale de reference sans methode pixel-perfect.

## 19. Tests et couverture

Vitest couvre:

- API week1 et roadmap.
- Gamification.
- Authorization child/parent.
- Habit schedule.

E2E couvre:

- Login/logout child.
- Quest + habit loop.
- Parent mission flow.
- Settings persistence.

Manques:

- Camera controls.
- Drag/wheel/pinch.
- Responsive map.
- Visual screenshot.
- Page error states.
- Discovery locked/unlocked UI.
- Campaign progress UI.
- Notifications UI.
- Accessibility.
- Production smoke local Vercel non execute pendant cet audit.

## 20. Liste priorisee des problemes

### P0 - Bloquants critiques

Aucun P0 detecte dans l'etat actuel.

Justification:

- Build OK.
- Tests OK.
- E2E OK.
- Pas de vuln runtime npm.
- Pas de fail auth obvious.

### P1 - A corriger avant grosse evolution visuelle/prod

1. Encodage texte corrompu.

- Impact: qualite visible directe.
- Fichiers: pages/layout/island/docs.
- Action: remplacer sequences corrompues, verifier fichiers en UTF-8.

2. Assets ile beaucoup trop lourds.

- Impact: chargement et mobile.
- Action: pipeline d'optimisation apres validation visuelle.

3. Camera/scene fragile par constantes hardcodees.

- Impact: tout changement image peut decaler assets.
- Fichiers: `IslandDashboard.tsx`, `CodedIslandScene.tsx`, `styles.css`.
- Action: documenter dimensions/offsets, puis centraliser.

4. Transactions XP/achievements inconsistantes.

- Impact: incoherence possible si erreur partielle.
- Fichiers: quests, habits, goals, projects, reviews.
- Action: adopter pattern missions avec `store.transaction`.

5. CORS ouvert par defaut si env manquante.

- Impact: prod mal configuree plus exposee.
- Action: en prod, fail closed si `VERCEL` ou `NODE_ENV=production` sans `ALLOWED_ORIGINS`.

6. SQL Postgres translation fragile.

- Impact: bugs subtils lors d'ajouts.
- Action: tests Postgres obligatoires pour nouvelles queries.

7. Pas de lint/noUnused.

- Impact: couches mortes et imports inutilises peuvent rester.
- Action: ajouter ESLint ou au moins `noUnusedLocals`.

### P2 - Qualite / maintenance

1. Progress bars invisibles.

- `GoalDetailPage.tsx` milestone fill ligne 193.
- `CampaignPage.tsx` chapter fill ligne 30.

2. EmptyState action implicite incorrecte.

- `EmptyState.tsx` ligne 27.
- Pages: `GoalDetailPage`, `ReviewsHubPage`, possiblement `GoalsPage`, `ProjectsPage`, `HabitsPage`, `QuestsPage`.

3. `bg-warning-soft` inexistant.

- `EmptyState.tsx` ligne 22.

4. `window.location.assign` au lieu de navigation React.

- `TodayPage`, `ProjectDetailPage`.

5. Notifications generees dans GET.

- `insights.ts` et `notifications.ts`.

6. Timezone inconsistent.

- `discovery.ts` JS UTC period vs SQL localtime.
- `reviews.ts` date(created_at) sans localtime.

7. README/docs possiblement stale.

- README parle encore d'architecture coded ocean/river/path/vegetation, alors que la scene actuelle utilise surtout l'image wide map.

8. `api/index.mjs` genere mais suivi.

- Peut etre ok pour Vercel, mais a clarifier.

## 21. Phase 2 - etat des lieux exact

Objectif Phase 2:

- Base propre de scene.
- Ne pas refaire architecture.
- Ne pas changer backend/auth/Supabase/routes.
- Garder la scene fonctionnelle.
- Optimiser/clarifier le code de scene.

Fait:

- Constants scene clarifiees.
- Layers nommes.
- Props inutiles retirees.
- Ambience/ponts structures en data arrays.
- Aucun recalcul asset par asset.
- Tests/build/e2e OK apres changement.

Pas fait:

- Pas de refonte architecture.
- Pas de nouvelle config `islandLayout.ts`.
- Pas d'animations nouvelles.
- Pas d'integration complete des side characters.
- Pas de suppression des anciens assets.
- Pas de nettoyage des fichiers legacy.
- Pas d'optimisation PNG.

Etat:

- Phase 2 est acceptable comme phase "base propre minimale".
- Elle n'est pas une refonte complete.
- Elle est suffisante pour demarrer Phase 3 si on accepte les risques listes.

## 22. Phase 3 - readiness

Phase 3 prevue:

- Integration des nouveaux assets statiques.
- Terrain principal.
- Batiments.
- Pont principal.
- Nuages.
- Ballon.
- Bateau.
- 3 personnages front.

Etat readiness:

- Techniquement pret: oui.
- Proprement pret: oui, mais sous conditions.

Conditions avant Phase 3:

1. Ne pas changer la logique camera.
2. Ne pas recalculer asset par asset.
3. Ne pas toucher backend/auth/Supabase.
4. Garder la wide map comme reference.
5. Ne pas supprimer les assets legacy tant que visuel pas valide.
6. Corriger au moins les textes corrompus visibles si on fait une passe UI en meme temps.

Risque Phase 3:

- Ajouter des assets lourds aggrave la performance.
- Ajouter beaucoup de positions dans JSX va re-rendre la scene difficile a maintenir.
- Les offsets actuels doivent etre manipules avec prudence.

Recommandation:

- Phase 3 devrait etre "statique seulement".
- Aucun mouvement.
- Aucun path animation.
- Aucun nettoyage destructif.
- Apres integration, verification screenshot desktop/mobile obligatoire.

## 23. Plan d'action recommande

Ordre propose:

1. Fix qualite rapide avant Phase 3.

- Corriger encodage visible.
- Corriger progress bars invisibles.
- Corriger `bg-warning-soft`.
- Remplacer `window.location.assign` par navigation React la ou simple.

2. Stabiliser scene sans refonte.

- Ajouter commentaire/documentation sur dimensions wide map et transform.
- Eventuellement extraire `useIslandCamera` plus tard, pas maintenant si on veut vite avancer.
- Garder anciennes couches non branchees jusqu'a validation.

3. Phase 3 integration statique.

- Brancher assets selectionnes.
- Garder positions faciles a modifier.
- Ne pas animer.
- Ne pas supprimer.

4. Verification visuelle.

- Desktop large.
- Laptop.
- Mobile.
- Zoom min/max.
- Drag/pan limites.
- Aucun bord vide.
- Assets alignes.

5. Nettoyage apres validation.

- Retirer couches mortes.
- Retirer references assets non utilisees.
- Optimiser assets web.
- Ajouter tests e2e camera.

6. Phase animation.

- Definir chemins avant mouvement.
- Puis coder animations subtiles.

## 24. Fichiers a toucher en priorite

Tres important:

```text
src/features/island/IslandDashboard.tsx
src/features/island/scene/CodedIslandScene.tsx
src/styles.css
src/features/island/data.ts
src/pages/GoalDetailPage.tsx
src/pages/CampaignPage.tsx
src/components/EmptyState.tsx
src/layouts/AppShell.tsx
```

Backend transactions:

```text
server/routes/quests.ts
server/routes/habits.ts
server/routes/goals.ts
server/routes/projects.ts
server/routes/reviews.ts
```

DB/Prod fragile:

```text
server/db/store.ts
server/db/postgres.ts
supabase/migrations/*
.github/workflows/ci.yml
```

Assets:

```text
public/assets/island/
public/assets-images-export/
```

## 25. Fichiers a ne pas toucher sans raison

Pour la suite visuelle immediate:

```text
server/routes/*
server/services/*
server/db/*
supabase/*
src/lib/api/client.ts
src/store/index.ts
src/App.tsx
src/components/AuthGuards.tsx
```

Sauf si on corrige un bug clairement identifie, la Phase 3 visuelle ne doit pas toucher ces couches.

## 26. Decision finale

Statut global:

```text
Application fonctionnelle: OUI
Base scene utilisable: OUI
Prete pour Phase 3 statique: OUI avec prudence
Prete pour prod publique large: PAS ENCORE
Prete pour grosse animation: NON, chemins et tests visuels manquent
```

Le prochain meilleur move:

```text
1. Micro-fix qualite UI: encodage + progress bars + bg-warning-soft.
2. Ensuite Phase 3 statique.
3. Ensuite verification visuelle.
4. Ensuite cleanup assets/code legacy.
```

