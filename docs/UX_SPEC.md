# Direction artistique et parcours

## Identité permanente

- Positionnement : une aventure de compréhension, pas une reproduction de TikTok ni un catalogue de vidéos.
- Mobile portrait, surfaces tactiles généreuses, textes courts et lisibles, hiérarchie simple.
- Palette de base : encre `#202846`, blanc `#FFFFFF`, fond `#F7F7FC`, violet `#7760DB`.
- Couleurs par espace : École jaune doux `#FFCC68`, Concentration turquoise `#37B5A4`, Cadeaux corail `#FF917E`, Parents violet, Découverte bleu `#6AABF0`.
- Mascotte Nova : illustration vectorielle créée pour ce prototype ; pas de contexte spatial imposé à l'identité globale.
- Illustrations : SVG originaux indépendants des écrans ; l'interactivité est réalisée par les widgets Flutter et Flame, jamais simulée par une image fixe.

## Plan du produit

```text
Accueil (hub)
├── Curiosité du jour (Ombres)
│   ├── Prédiction
│   ├── Manipulation Flame
│   ├── Transfert
│   └── Conclusion → liens de connaissance
├── École
│   └── 6e → Mathématiques → Fractions → MAT-09
│       ├── Cours écrit (vidéo non disponible)
│       ├── Manipulation visuelle
│       ├── Question de transfert
│       └── Résultat → graphe de connaissances
├── Concentration
│   └── Mémoire de séquence (2 niveaux)
├── Cadeaux
│   ├── Solde et inventaire virtuels
│   └── Historique de transactions
├── Parents (aperçu local non sécurisé)
├── Découverte (page d'attente)
└── Profil démo → effacement volontaire
```

## Design à améliorer lors des tests réels

- Test portrait 320×568 jusqu'aux tablettes en grand affichage, zones d'interaction, lecteur d'écran, contraste et taille des caractères.
- Ajouter des interactions et transitions animées mesurées, retour haptique facultatif, aides contextualisées et lecture audio si le prototype est validé.
- Éviter les mécanismes de « streak » culpabilisants, l'autoplay, les boucles infinies et les comparaisons sociales.
