# Supabase — préconfiguration, sans connexion

- **Aucune migration n'a été appliquée.** Le dépôt historique contient potentiellement un schéma non audité.
- La migration préfixe toutes les tables `lq_` et active RLS, avec les profils enfants détenus par un parent authentifié.
- Les transactions d'étoiles et les preuves pédagogiques sont **en lecture seule pour les clients**. L'API serveur transactionnelle et idempotente, la validation des scores, la suppression/export des données, le consentement et les autorisations multi-adultes restent à développer et auditer.
- Ne jamais exposer une clé `service_role` dans une application Flutter.
- L'espace Parents de la démo n'est PAS authentifié et ne peut pas être utilisé pour des profils réels.
- Avant application : inspecter le schéma du projet Supabase cible, examiner ses politiques et les migrations, tester en environnement isolé, puis vérifier les adversarial RLS tests décrits dans `docs/SECURITE.md`.
- Les évolutions de la Supabase CLI et du projet doivent être vérifiées selon la documentation officielle avant les migrations.
