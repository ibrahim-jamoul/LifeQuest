# Plan de validation — protocole pilote local

## Contrôles automatiques fournis

- `npm test` : 115 entrées uniques, 10 familles, 3 cours en deux phases, modèle, migration, progression et attribution unique des points.
- `npm run test:e2e` : Chrome système sur 320×568, 390×844, 540×960, 768×1024, 844×390 et 1024×768 ; profil, cinq espaces, portrait, vidéo, trois notions jouables, cadeaux, concentration et persistance.
- `python tests/browser_smoke.py` : relais historique vers la même suite Playwright Node.
- `npm run test:all` : régénération de l’aperçu, syntaxe, tests Node et E2E.
- À compléter sur appareils réels : iOS Safari, Android Chrome, réseau lent/déconnecté, installation PWA, accessibilité clavier/lecteurs d’écran, stockage refusé et erreurs vidéo.

## Critères P0

- Pas de page blanche et pas d'erreur JavaScript non gérée.
- 5 espaces exactement dans le lobby ; 2 indisponibles annoncés.
- Parcours École classe 6e présent : matière → chapitre → notion → leçon → quiz + mini-jeu → résultat.
- On ne peut pas lancer les activités d'une notion jouable avant l'achèvement vidéo initiale.
- Récompenses virtuelles attribuées au maximum une fois par notion terminée.
- Aucun achat ni validation cadeau réel côté enfant.
- Mobile 320–540 px sans débordement horizontal et tablettes utilisables, **portrait**, pas paysage.

## Tests manuels essentiels

1. Créer un profil, quitter, rouvrir : progression conservée localement.
2. Lancer un cours puis le quitter avant la fin : activités restent verrouillées.
3. Terminer le cours et faire des réponses fausses : corrections affichées, possibilité de poursuivre.
4. Rejouer mini-jeu et quiz : points non multipliés.
5. Ouvrir Cadeaux : achat réel impossible.
6. Ouvrir Parents, Découverte : visible mais non trompeur.
7. Essayer d'installer la PWA sur Android et iOS : documenter les différences et limites, ne pas supposer verrouillage portrait universel.
