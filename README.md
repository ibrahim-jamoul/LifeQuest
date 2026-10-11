# LifeQuest V3 — MVP local portrait

Version de travail validée le 11 octobre 2026. Ce dossier reste une copie locale indépendante : aucune base distante et aucun secret de l’ancien dépôt ne sont utilisés.

## Publication en ligne

La version statique validée est publiée sur Vercel :

**https://lifequest-v3-mvp-portrait.vercel.app**

Projet Vercel : `lifequest-v3-mvp-portrait` · déploiement `dpl_BWSycuEV9Ypwx4x9asNxvsojh6dw`. Seuls les 14 fichiers nécessaires à l’application ont été envoyés ; aucun test, rapport, dépôt Git, fichier `.env` ou contenu historique n’a été publié.

## Ce qui fonctionne réellement

- Parcours lancement → profils locaux → avatar → introduction Nova → lobby avec exactement cinq espaces.
- École → matière → chapitre → notion → vidéo obligatoire → quiz → mini-jeu en deux phases → progression.
- Trois notions de démonstration jouables : `MAT-09`, `MAT-12` et `MAT-18`.
- Vidéos locales d’environ 70 secondes ; les activités restent verrouillées jusqu’à une lecture séquentielle terminée. Une avance directe vers la fin est refusée.
- Quiz de trois questions et mini-jeux « essai guidé → transfert », avec indices progressifs.
- Vingt points attribués une seule fois par notion terminée, sauvegarde locale et reprise après rechargement.
- Concentration : choix d’une mission, sessions de 1, 3 ou 5 minutes, pause, reprise persistante et historique local.
- Cadeaux : quatre badges virtuels automatiques. Le cadeau réel reste explicitement non disponible et aucune transaction n’existe.
- Découverte et Parents sont visibles mais annoncés comme phases ultérieures.
- Interface portrait pour téléphone et tablette ; un écran de rotation masque le jeu en paysage jusqu’à 1 200 px de large ou sur appareil tactile.

Le référentiel conserve les **115 notions** LifeQuest : **3 jouables** et **112 à produire**. Une fiche « à produire » ne fabrique ni vidéo, ni quiz, ni résultat fictif.

## Démarrage local

Prérequis : Node.js 20 ou plus récent.

```powershell
cd "C:\Users\ibraj\Documents\New project\LifeQuest_V3_MVP_LOCAL_FINAL_2026-10-11"
npm start
```

Ouvrir ensuite `http://127.0.0.1:8000`. Sous Windows, `DEMARRER_WINDOWS.bat` lance la même commande. Sous macOS/Linux, utiliser `./DEMARRER_MAC_LINUX.sh`.

Le serveur Node fourni accepte les requêtes HTTP partielles nécessaires à la lecture et à l’avance des fichiers MP4. Ne pas ouvrir directement `index.html`, car les modules JavaScript et le service worker exigent un serveur HTTP.

`APERCU_LOCAL.html` reste disponible pour un aperçu direct hors PWA. Il est généré depuis les mêmes sources avec :

```powershell
npm run build:standalone
```

### Prévisualisation sur le réseau local

```powershell
npm run start:lan
```

Puis ouvrir `http://IP_DU_PC:8000` depuis un appareil du même réseau. Cette commande expose le dossier sur le réseau local : ne l’utiliser que sur un réseau de confiance et l’arrêter avec `Ctrl+C`. L’installation PWA sur téléphone peut nécessiter HTTPS ; aucun déploiement n’est inclus.

## Tests

Installer une fois la dépendance de développement :

```powershell
npm install
```

Puis exécuter :

```powershell
npm run test:all
```

Commandes séparées :

```powershell
npm run check          # syntaxe des sources et du bundle autonome
npm test               # catalogue, modèle, migration et machine d’état
npm run test:e2e       # Chrome système, navigation mobile émulée
python tests/browser_smoke.py  # relais historique vers test:e2e
```

La dernière validation locale a réussi avec 6 tests Node et 8 scénarios navigateur exécutés, sans échec. Les 16 cas Playwright ignorés sont les combinaisons volontairement hors cible de chaque scénario. Les tailles couvertes sont 320×568, 390×844, 540×960, 768×1024, 844×390 et 1024×768. Voir `docs/RAPPORT_VALIDATION_2026-10-11.md` pour le détail et les limites.

## Architecture

- `index.html`, `app.css`, `app.js` : application locale sans framework.
- `core/model.js` : schéma de sauvegarde, migration, progression, badges et minuterie.
- `data/catalogue.js` : référentiel des 115 notions et dix matières.
- `data/activities.js` : trois leçons de démonstration, quiz et mini-jeux.
- `media/*.mp4` : vidéos muettes de démonstration, à remplacer après validation pédagogique.
- `tools/serve.mjs` : serveur local avec prise en charge des plages vidéo.
- `tools/build-standalone.mjs` : génération de l’aperçu autonome.
- `playwright.config.mjs`, `tests/` : contrôles Node et navigation mobile.
- `docs/captures/validation-2026-10-11/` : preuves visuelles de la validation navigateur.

## Réemploi et préservation de l’existant

- Les 115 identifiants, domaines et titres correspondent à l’ancien prototype `LifeQuest_MVP_Classe_Autonnome.html` audité localement.
- Le schéma « essai guidé → transfert » des mini-jeux adapte la logique de `LifeQuest_V3_Panels.html`.
- Le dépôt historique `lifequest-dashboard` contient des modifications utilisateur non validées : il a été audité en lecture seule et n’a pas été fusionné ni écrasé.
- Les 58 images historiques d’environ 49 Mio n’ont pas été copiées : elles sont trop lourdes pour ce MVP et leur licence doit être confirmée.
- Les fichiers `.env.local` des anciens dépôts n’ont jamais été copiés.

Retour arrière disponible :

- baseline décompressée intacte : `..\LifeQuest_V3_MVP_PORTRAIT_2026-10-11` ;
- ZIP original joint à la demande ;
- `docs/SHA256_BASELINE_ZIP.json` conserve le manifeste d’origine ;
- `docs/SHA256_FINAL.json` décrit les fichiers livrés hors dépendances et résultats temporaires.

## Limites assumées

- Les contenus des trois notions restent des démonstrations à valider par des enseignants ; les 112 autres notions ne sont pas jouables.
- Pas d’authentification, de backend, de synchronisation multi-appareils, de contrôle parental sécurisé, d’achat ou de cadeau réel.
- `localStorage` est modifiable et effaçable par l’utilisateur : ce n’est pas un registre de preuve ni un dispositif anti-triche.
- Validation navigateur sur Chrome système émulé, pas encore sur appareils iOS/Android réels, Safari/WebKit, ni en installation PWA complète.
- Les vidéos ne sont pas mises en cache hors ligne ; leur absence affiche une erreur et conserve le verrou des activités.

Avant toute suite, lire `docs/CODEX_INSTRUCTIONS.md`, `docs/DECISIONS_VALIDÉES.md` et le rapport de validation.
