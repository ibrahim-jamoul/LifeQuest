# Sécurité et protection des mineurs — prérequis avant diffusion réelle

Ce prototype ne doit pas être mis en production pour des enfants non supervisés en l'état.

- **Stockage** : pseudo, progression, points et sessions de concentration en localStorage, lisibles/modifiables par toute personne ayant accès à l'appareil. Aucune valeur de preuve pour des cadeaux réels.
- **Comptes** : faux profils locaux uniquement ; aucune identité vérifiée, aucune séparation multi-utilisateurs fiable ; absence de backend.
- **Parents** : accès PIN envisagé, non construit. Un PIN uniquement front-end ne sécurise pas l'approbation d'une récompense.
- **Cadeaux réels** : aucun achat, livraison, conversion ni échange autorisé. Le mode Catalogue rappelle l'interdiction. Valider avec un conseil juridique avant toute émission de cadeau tangible ou valeur monétaire.
- **Données personnelles** : minimiser collectes, éviter géolocalisation et données sensibles, développer confidentialité, suppression/export, durées de conservation et cadre parental avant pilote nominatif.
- **Pédagogie** : les quiz de démo ne prouvent pas l'efficacité du dispositif. Relecture par enseignant et tests utilisateur obligatoires.
- **PWA** : HTTPS sur appareil réel, politiques CSP, revue dépendances/ressources, désactivation des anciens caches lors mises à jour.
- **Video gate** : l'événement `ended` est une règle UX, pas un contrôle de visionnage sécurisé ; contournable en DevTools. Suffisant pour démo locale ; pas un mécanisme anti-triche ou d'éligibilité cadeau.
