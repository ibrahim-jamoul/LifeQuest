# Rapport de validation — LifeQuest V3 MVP local portrait

Date : 11 octobre 2026  
Projet validé : `C:\Users\ibraj\Documents\New project\LifeQuest_V3_MVP_LOCAL_FINAL_2026-10-11`

## Conclusion

Le MVP local est démarrable et testable. Le parcours principal, les cinq espaces, les trois notions de démonstration, la progression, Concentration et les badges virtuels ont été exécutés sans échec dans Chrome système émulé aux formats mobiles retenus.

Aucune base distante, variable secrète ou donnée de production n’a été lue ou modifiée.

## Publication Vercel

- URL stable : `https://lifequest-v3-mvp-portrait.vercel.app`
- URL immuable : `https://lifequest-v3-mvp-portrait-lxodko3w5-ibrahim-jamouls-projects.vercel.app`
- Projet : `lifequest-v3-mvp-portrait` (`prj_9LgqKo6P3qP9gCjBGln06xvgvvtP`)
- Déploiement : `dpl_BWSycuEV9Ypwx4x9asNxvsojh6dw`
- État Vercel : `READY`
- Framework : statique, aucun backend ni variable d’environnement
- Portée publiée : 14 fichiers applicatifs uniquement

Vercel a affecté automatiquement le premier déploiement du nouveau projet à l’environnement `production`. Il n’existe aucun domaine personnalisé, aucune base et aucune migration associée.

Validation distante : page d’accueil HTTP 200, vidéo `MAT-09.mp4` en HTTP 206 avec plage `bytes 0-1023`, puis suite Playwright complète sur l’URL HTTPS : **8 réussis, 0 échec, 16 ignorés intentionnellement** en 55,4 s, sans erreur runtime détectée.

## Préservation et retour arrière

- ZIP joint : conservé intact dans les pièces jointes Codex.
- Baseline décompressée intacte : `C:\Users\ibraj\Documents\New project\LifeQuest_V3_MVP_PORTRAIT_2026-10-11`.
- Copie de développement séparée : `C:\Users\ibraj\Documents\New project\LifeQuest_V3_MVP_LOCAL_FINAL_2026-10-11`.
- Le dépôt historique `lifequest-dashboard` était déjà sale (modifications TSX et TimeDial non suivies). Il a été audité en lecture seule et n’a pas été modifié.
- `docs/SHA256_BASELINE_ZIP.json` conserve le manifeste fourni avec la baseline ; `docs/SHA256_FINAL.json` décrit la copie finale hors dépendances et rapports temporaires.

Pour revenir en arrière, supprimer ou archiver uniquement la copie `...LOCAL_FINAL...`, puis repartir de la baseline ou du ZIP. Aucun écrasement de l’existant n’est nécessaire.

## Audit et intégration

Les documents `README.md`, `docs/CODEX_INSTRUCTIONS.md` et `docs/DECISIONS_VALIDÉES.md` ont été lus intégralement avant modification.

Constats de comparaison :

- `LifeQuest_MVP_Classe_Autonnome.html` contient les mêmes 115 identifiants, domaines et titres que le catalogue du prototype : correspondance 115/115, sans différence.
- `LifeQuest_V3_Panels.html` fournit la logique la plus directement réutilisable pour les mini-jeux en deux temps. Les trois jeux du MVP utilisent désormais un essai guidé, un transfert et trois niveaux d’indice par phase.
- Huit anciennes banques de quiz ont été identifiées, mais n’ont pas été déclarées jouables sans capsule vidéo et validation pédagogique associées.
- Les scènes 3D et 58 images historiques d’environ 49 Mio n’ont pas été intégrées : coût mobile trop élevé et licence non documentée.
- L’ancien système Cadeaux était une simulation locale sans sécurité parentale. Seuls les badges virtuels non dépensables ont été conservés ; tout cadeau réel reste désactivé.

## Fonctionnalités vérifiées

| Domaine | État vérifié |
|---|---|
| Lancement et profils | Écran titre, création, pseudo conservé après changement d’avatar, sélection et rechargement. |
| Lobby | Exactement cinq espaces : École, Cadeaux, Concentration, Découverte, Parents. |
| Référentiel | 115 notions uniques, dix matières, 3 `demo`, 112 `to_produce`. |
| École | Matière → chapitre → notion ; statuts jouable/à produire explicites. |
| MAT-09 | Vidéo locale chargée, seek direct refusé, lecture séquentielle accélérée jusqu’à `ended`, quiz 3/3, deux phases du jeu, +20 points, persistance. |
| MAT-12 | Quiz et deux phases « comparer des fractions » terminés en navigateur ; +20 points. Le test injecte uniquement le statut vidéo déjà visionnée. |
| MAT-18 | Quiz et deux phases périmètre terminés en navigateur ; +20 points. Le test injecte uniquement le statut vidéo déjà visionnée. |
| Progression | Attribution unique des points, non-doublement après rejeu, sauvegarde `localStorage` versionnée et migration v1. |
| Concentration | Missions, 1/3/5 minutes, pause stable, brouillon, reprise après rechargement, fin et historique. Un brouillon ne peut plus être écrasé par une nouvelle session. |
| Cadeaux | Quatre badges virtuels avec progression ; cadeau réel affiché « NON DISPONIBLE », sans demande ni transaction. |
| Découverte / Parents | Présents dans le lobby et explicitement marqués « EN PRÉPARATION ». |
| Portrait | Pas de débordement horizontal sur quatre tailles portrait ; écran de rotation sur téléphone et tablette paysage. |
| Serveur média | Réponses `206` validées pour `bytes=0-1023` et `bytes=-500`, utiles à la lecture mobile des MP4. |
| Erreurs runtime | Aucune `pageerror`, `console.error`, réponse HTTP ≥ 400 ou requête échouée inattendue pendant les E2E. |

## Modifications principales

- Correction de la perte du pseudo lors du choix d’avatar.
- Mise en page portrait adaptée de 320×568 à 768×1024, avec overlay paysage tablette.
- Modèle local centralisé et migrable dans `core/model.js`.
- Séparation claire des 3 notions jouables et des 112 contenus à produire.
- Verrou vidéo renforcé : fin réelle requise et avance directe refusée avant première complétion.
- Mini-jeux MAT-09, MAT-12 et MAT-18 étendus à deux phases avec indices progressifs.
- Concentration rendue persistante, avec pause/reprise, historique et garde contre l’écrasement d’une session.
- Cadeaux enrichi de quatre badges virtuels ; mécanisme réel maintenu inactif.
- Serveur Node portable avec requêtes Range standards et suffixes.
- Génération automatique de `APERCU_LOCAL.html` pour éviter la divergence entre bundle et sources.
- Cache PWA versionné et nettoyage limité aux caches LifeQuest.
- Suite Playwright multi-format, captures et manifeste SHA-256 final.

## Tests exécutés

Environnement : Windows, PowerShell 7.6.5, Node.js 24.15.0, npm 11.12.1, Google Chrome 154.0.8037.57.

Commande finale :

```powershell
npm run test:all
```

Résultat :

- génération de l’aperçu autonome : réussie ;
- vérification syntaxique : réussie ;
- tests Node : **6 réussis, 0 échec** ;
- Playwright : **8 réussis, 0 échec, 16 ignorés intentionnellement** en 53,5 s ;
- `npm install --ignore-scripts` : trois paquets installés, zéro vulnérabilité signalée.

Les 16 tests ignorés correspondent aux combinaisons hors cible : les scénarios portrait ne sont pas rejoués en paysage, et les deux parcours longs sont limités au projet 390×844.

Viewports :

- portrait : 320×568, 390×844, 540×960 et 768×1024 ;
- paysage : 844×390 et 1024×768.

Captures contrôlées visuellement :

- `docs/captures/validation-2026-10-11/01-lobby-390x844.png` ;
- `02-video-deverrouillee-390x844.png` ;
- `03-notion-terminee-390x844.png` ;
- `04-cadeaux-390x844.png` ;
- `04b-cadeau-reel-desactive-390x844.png` ;
- `05-concentration-historique-390x844.png` ;
- `06-rotation-1024x768.png`.

## Limites connues

- La vidéo MAT-09 a été lue séquentiellement à vitesse ×16 pour le test ; ce test prouve le parcours média et le signal `ended`, pas 70 secondes de visionnage humain attentif.
- Le verrou vidéo est une barrière pédagogique côté client, pas une protection anti-triche. Le stockage local peut être modifié manuellement.
- Chrome émulé ne remplace pas des essais sur iPhone/iPad Safari et appareils Android réels.
- L’installation PWA, la reprise après mise à jour, le stockage refusé, le mode totalement hors ligne et les technologies d’assistance n’ont pas encore une campagne dédiée.
- Les vidéos de démonstration sont muettes et les contenus n’ont pas reçu de validation pédagogique formelle.
- Pas de comptes, backend, contrôle parental sécurisé, synchronisation, paiement, livraison ou cadeau réel.
- Les vidéos ne sont volontairement pas mises en cache hors ligne.
- Découverte et Parents sont hors périmètre fonctionnel de cette phase.

## Tâches restantes recommandées

1. Tester sur au moins un iPhone/iPad Safari et un téléphone/tablette Android réels, puis corriger les écarts tactiles, vidéo et PWA.
2. Faire valider MAT-09, MAT-12 et MAT-18 par un enseignant et remplacer les capsules de démonstration.
3. Ajouter une passe accessibilité complète : lecteur d’écran, ordre du focus, contrastes, zoom 200 % et réduction des animations.
4. Tester explicitement stockage refusé/corrompu, absence vidéo, hors ligne et mise à jour de service worker.
5. Produire progressivement les 112 contenus manquants sans changer leur statut avant validation réelle.
6. Faire tester la mécanique Concentration par des enfants/parents avant d’en faire un système définitif.
7. Concevoir Découverte, puis Parents, avec modèle de sécurité et consentement dédiés.
8. Valider les droits et optimiser les ressources historiques avant toute réintégration visuelle.

## Commandes de reprise

```powershell
cd "C:\Users\ibraj\Documents\New project\LifeQuest_V3_MVP_LOCAL_FINAL_2026-10-11"
npm install
npm start
```

Application : `http://127.0.0.1:8000`  
Arrêt : `Ctrl+C`
