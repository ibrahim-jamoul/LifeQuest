# Instructions pour Codex — intégrer et continuer LifeQuest V3

## Mission

Partir du contenu de ce ZIP comme **base prototype fonctionnelle autonome**, puis auditer avant toute fusion les projets locaux existants (exemples de chemins Windows évoqués par l'utilisateur) :

- `C:\Users\ibraj\Downloads\LifeQuest_MVP_V3_Codex_2026-10-09.zip`
- `C:\Users\ibraj\Downloads\LifeQuest_V3_Pack_Local_5_Espaces.zip`
- `C:\Users\ibraj\Downloads\lqwork\LifeQuest_V3_Prototype.html`
- Les autres archives LifeQuest et le dépôt GitHub accessibles sur le PC.

Les chemins ci-dessus sont **des pistes à vérifier** : ne jamais supposer que ces fichiers existent ou qu'ils sont la dernière source de vérité.

## Règles impératives

1. Orientation **portrait** pour smartphone et tablette. Ne pas remettre de « landscape », même si les anciens cahiers des charges le demandent.
2. Conserver cinq espaces EXACTS : École, Cadeaux, Concentration, Découverte, Parents. Les 10 familles de la matrice sont des matières dans École et NON 10 mondes.
3. Préserver et auditer le code existant avant modification. Ne jamais exécuter de migration ou remplacer des fichiers de l'ancien dépôt sans backup, diff, tests et accord si changement destructeur.
4. Maintenir distinction : « référencé » ≠ « cours prêt » ≠ « activité jouable » ≠ « maîtrise pédagogique validée ».
5. Cours préalable obligatoire ; vidéos finales fournies par le fondateur, durée 60–120 secondes ; supports textuels si utiles.
6. Aucun produit destiné à des mineurs ne doit être publié en vrai accès public sans authentification sérieuse, autorisations parentales, politique de conservation/effacement, minimisation des données, contrôle des contenus et validation juridique.
7. Ne pas prétendre qu'un PIN local dans JavaScript constitue une sécurité parentale. En attendant, bloquer cadeaux réels.
8. Pas de paiements, achats, livraison, partage de profil ou suivi public dans la démo.
9. Produit prioritairement gratuit ; premium hors périmètre MVP.

## Travaux à effectuer, dans l'ordre

### P0 — Reprise technique
- Cartographier ancien code, versions, assets, maquettes et matrices. Recenser toutes les régressions potentielles.
- Exécuter et comparer le prototype autonome du présent ZIP.
- Définir le dépôt cible, tests automatiques et procédure de rollback.

### P0 — Frontend
- Faire évoluer le prototype portrait vers une architecture maintenable (modules isolés ou framework si justifié), réutiliser le code existant compatible.
- Uniformiser les éléments de jeu : animations légères, transitions, mascotte Nova et navigation tactile.
- Vérifier iOS/Android (Safari/Chrome), tailles de téléphone et de tablette, safe areas, zoom, orientation et accessibilité.
- Ajouter les états techniques manquants : panne stockage, vidéo indisponible, sauvegarde, perte connexion, installation non prise en charge.

### P0 — Catalogue École
- Comparer les 115 lignes de `data/catalogue.js` avec la matrice Excel canonique : contenu, objectifs, source et priorités.
- Vérifier les programmes applicables 2026–2027 ; attention aux déploiements échelonnés en sciences/HG.
- Formaliser un schéma `subject → chapter → notion → lesson → activity → attempt → mastery` (prérequis et réactivation si utile).
- Préparer import/export éditorial, versioning, validation pédagogique et pipeline vidéo du fondateur.

### P0 — Moteur de contenus
- Remplacer les vidéos de démonstration par les vraies vidéos validées.
- Créer plus de types de mini-jeux pédagogiquement justifiés, avec feedback, indices progressifs et transferts de compétence.
- Ajouter une banque de quiz et des tests anti-régression ; ne pas générer automatiquement de quiz faux.
- Valider une première tranche de 5–8 notions réellement jouables, puis élargir.

### P0 — Concentration et Cadeaux
- Faire valider la spécification du mode Concentration, actuellement un minuteur d'essai.
- Définir politique d'attribution de récompenses, dépenses, prévention des mécaniques addictives et audit de transactions.
- Mettre en attente toute fonctionnalité cadeau réel jusqu'à validation parentale vérifiée et revue juridique.

### P1 — Durcissement / pilote
- Choisir backend et modèle d'autorisation si des comptes réels sont envisagés.
- Ajouter chiffrement des transports, contrôle d'accès serveur, stockage et suppression de données, politique de cookies, journaux minimisés.
- Conduire essais supervisés par élèves/enseignants/parents ; distinguer métriques observées des métriques fictives.

### Différé
- Construire Découverte (jeu 3D immersif), puis espace Parents complet. Conserver une architecture commune.

## Critères d'acceptation

- Orientation portrait, lobby cinq espaces, aucune confusion avec les matières.
- Enfant : choisir avatar → École → Maths → Fractions → MAT-09 → vidéo → activités → résultats, sans blocage.
- Les 112 notions non jouables ne sont jamais présentées comme achevées.
- Progression persistante après rafraîchissement du navigateur local.
- Cadeau réel non déclenchable par l'enfant seul.
- Tests catalogue et parcours E2E automatisés sur mobile ; pas d'erreurs console bloquantes.
- Captures de preuve pour chaque parcours, rapport de diff, résumé des modifications et des limitations.
