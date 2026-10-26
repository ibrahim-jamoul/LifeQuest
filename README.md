# LifeQuest Mobile — prototype Flutter + Flame (14 octobre 2026)

> Nouvelle base mobile autonome, **distincte de LifeQuest V3 PWA**. Code source non compilé dans l'environnement de génération. Produit pour démonstration **sans mineurs identifiables**.

## Obtenir une application sur Windows

Pré-requis : Flutter stable 3.47 ou supérieur (Dart 3.12+), Android Studio/Android SDK et Visual Studio Code. Git et PowerShell recommandés.

```powershell
# 1. Décompresser l'archive puis entrer dans le dossier
cd .\LifeQuest-Mobile

# 2. Générer les projets Android/iOS natifs, récupérer les packages
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap_windows.ps1

# 3. Valider le code (analyse + tests Dart)
powershell -ExecutionPolicy Bypass -File .\scripts\verifier_windows.ps1

# 4. Tester sur émulateur / téléphone Android
flutter devices
flutter run

# 5. Construire un APK DEBUG pour vos essais (après tests réussis)
flutter build apk --debug
```

Pour iOS, compilation/signature avec une machine macOS ou une CI macOS correctement configurée. Android et iOS ne disposent pas encore de leurs runners natifs dans le ZIP ; la commande officielle `flutter create` les génère, sans réécrire les fichiers applicatifs.

## Parcours manuel à essayer

1. Ouvrir le hub sans inscription, choisir « Je découvre ».
2. Répondre à la prédiction sur l'ombre, déplacer le curseur d'angle et passer le transfert (20° vs 70°).
3. Terminer et consulter les notions liées dans le graphe de connaissances.
4. Ouvrir École > Mathématiques > Fractions > MAT-09, lire le cours écrit, manipuler les fractions, répondre à l'exercice de transfert.
5. Tester Concentration, consulter Cadeaux puis Parents : les chiffres doivent provenir de la même sauvegarde locale.
6. Fermer/réouvrir l'application ; le solde et la progression demeurent. Rejouer : pas de doubles crédits.
7. Depuis Profil, réinitialiser la démonstration après confirmation.

## Modules

| Module | Statut du code |
|---|---|
| Hub + navigation Flutter portrait | Implémenté dans les sources |
| Curiosité : ombres avec simulation Flame | Implémenté dans les sources |
| École : 115 entrées, Fractions MAT-09 | Catalogue + 1 expérience codée |
| Concentration : séquence courte | Implémenté dans les sources |
| Cadeaux : étoiles et badges virtuels | Simulation locale codée |
| Parents | Aperçu local (aucune authentification réelle) |
| Découverte | Annoncé comme indisponible, aucune mission développée |
| Backend Supabase | SQL/RLS préparatoires non exécutés |
| Vidéos pédagogiques | Non fournies ; alternative cours écrit explicite |
| Tests / APK / stores | Tests écrits, non exécutés ; APK absent |

## Organisation

- `lib/app/` : thème, navigation et shell.
- `lib/core/models/` : notions, apprentissage, formules, sauvegarde, ledger.
- `lib/core/services/` : Riverpod + repository local substituable.
- `lib/features/` : toutes les fonctionnalités. `curiosity/shadow_game.dart` utilise Flame.
- `assets/illustrations/` : six illustrations SVG originales, pas de dépendances aux images trouvées sur Internet.
- `assets/data/catalogue_6e.txt` : 115 entrées éditoriales reprises du référentiel du dépôt historique.
- `test/`, `integration_test/` : scénarios de tests Dart.
- `supabase/` : migration SQL préparatoire et graines de test.
- `docs/` : audit, architecture, limites, mesures pédagogiques, sécurité et roadmap.
- `scripts/` : démarrage, validation et contrôles statiques.

## Décisions et risques

Le projet suit **Flutter/Dart + Flame, Riverpod, GoRouter, SharedPreferencesAsync**. Les versions des dépendances ont été sélectionnées sur les pages officielles publiées au 14/10/2026 ; elles n'ont pas encore été résolues ensemble par un `pub get` réel. Aucun secret Supabase ni fichier utilisateur de l'ancien projet n'a été importé.

**Avant publication réelle :** contrôle des mineurs, validation pédagogique, données et sécurité serveur, RLS, tests sur appareils physiques, conformité aux règles Apple/Google, revue juridique et support opérationnel.

Lire en priorité `docs/VALIDATION.md`, `docs/AUDIT_EXISTANT.md`, `docs/SECURITE.md`.
