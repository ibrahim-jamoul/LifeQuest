# Sécurité, mineurs, responsabilités

**MVP : démonstration hors ligne, non destinée à héberger de vrais profils d'enfants.**

1. Aucune collecte nominative ni email nécessaire. Profil local fictif. Pas de géolocalisation, suivi marketing, publicité comportementale ni contacts sociaux.
2. Parents : page de démonstration non protégée. Ne pas prétendre qu'il s'agit d'un véritable outil de contrôle parental.
3. Local : `shared_preferences` convient pour de la progression de démonstration non critique. Les données locales ne sont pas chiffrées de manière applicative, peuvent être modifiées, et ne constituent pas une preuve sécurisée.
4. Les étoiles en local sont simulées. En production, transactions serveur atomiques, clés d'idempotence uniques, contrôle parent-enfant serveur et règles anti-double-credit indispensables.
5. Migration SQL : RLS activée par défaut sur toutes les nouvelles tables `lq_`. Les tentatives, progrès, récompenses et inventaires ne peuvent être lus que par le propriétaire du profil, pas modifiés par un client authentifié. Les API d'écriture sécurisées ne sont **pas implémentées**.
6. Danger majeur : ne jamais utiliser les `user_metadata` d'un JWT pour décider des droits. Les autorisations devront reposer sur des tables protégées et les identifiants Auth vérifiés. Attention aux vues et fonctions `SECURITY DEFINER`.
7. Aucune clé secrète, aucun endpoint serveur, aucune identité réelle ou connexion Supabase active n'est intégré au ZIP.
8. Revoir les obligations applicables : informations, consentements parentaux, droits d'accès/suppression/export, durée de conservation, traceurs, minimisation et validation juridique avant tout déploiement impliquant des mineurs.

## Jeux de tests RLS à exécuter EN STAGING uniquement

- Auth A voit uniquement ses profils et leurs preuves d'apprentissage.
- Auth B ne peut pas lire les profils, tentatives, inventaire ou ledger de A.
- Auth A ne peut pas attribuer de crédits, créer des lignes de ledger ou écrire une `mastery` arbitraire depuis le SDK Flutter.
- Les rôles `anon` lisent les connaissances `published`, mais ne voient jamais les profils ou tentatives.
- Les contenus `draft` ne sont pas publiquement visibles.
- Un client ne peut pas lire une relation vers un contenu non publié.
- Suppression d'un profil entraîne l'effacement des relations personnelles via cascade, sous réserve d'un audit du stockage annexé.
- Les opérations concurrentes d'achat virtuel n'entraînent aucun double débit ou solde négatif.

**État : ces tests SQL n'ont pas été exécutés sur Supabase.**
