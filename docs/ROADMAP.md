# Roadmap de transformation

## V0.1 — Livré comme code source exploratoire
- Hub, 5 mondes accessibles (Découverte annoncée indisponible), interface portrait.
- Curiosité : Ombre (prédiction, Flame, manipulation angle, transfert, conclusion).
- École : catalogue 115 notions 6e (1 pilote jouable + 114 référencées non implémentées), Fractions avec cours écrit/activité visuelle/transfert, vidéo honnêtement absente.
- Concentration : mémoire de séquence, 2 niveaux.
- Cadeaux virtuels : journal local, solde dérivé, échanges simulés idempotents.
- Parents : aperçu local explicitement non sécurisé.
- Graphe de connaissances de 6 nœuds et 4 relations.
- Persistance locale, tests source écrits, migration SQL de préparation.

## V0.2 — Stabilisation technique avant démonstration externe
- Générer les runners Android/iOS avec Flutter stable.
- `flutter analyze`, `flutter test`, `flutter test integration_test`, `flutter build apk --debug`.
- Corriger tout problème remonté par le SDK et tester sur Android réel (petit et grand écran), iOS réel, TalkBack/VoiceOver, modes sans réseau et redémarrage.
- Revoir les modes portrait tablette et le support des gros caractères.
- Ajouter gestion de feedback vocal contrôlable, mesures de performance, animations d'état sobres, validation scientifique et éditoriale.

## V0.3 — Pilote pédagogique
- Intégrer les vidéos validées de 1–2 minutes (sans fausse validation de visionnage), les cours, davantage de variantes de mini-jeux et correction après erreur.
- Ajouter rappel différé et questions de transfert variées ; tests terrain supervision parent/enseignant.
- Réconcilier référentiel de 115 avec éventuelle matrice plus complète (469 signalées, non obtenues).

## V1 — Données et publication sécurisées
- Mettre en place Auth parent, vraie autorisation parent-enfant, RLS testées, suppression/export.
- Prévoir serveur de validation des actions, attribution transactionnelle et idempotente des étoiles, sécurité des API, régulation des comptes mineurs.
- Validation conformité juridique, sécurité mobile, publication Android/iOS, support, observabilité et CI/CD.

## V2+ — Extension maîtrisée
- Variantes 12–14 / 14–16 / 16–18 / adultes pour chaque connaissance stable et difficulté adaptée selon acquis (l'âge ne constitue pas une barrière de contenu).
- Découverte : missions 2D/2.5D Flame, univers visuel distinct, progression narrative, lien explicite aux connaissances.
- Parents : supervision consentie et suggestions d'activités en famille, sans surveillance intrusive.
- Bibliothèque audiovisuelle, pipelines de validation, contenus externes sélectionnés.
