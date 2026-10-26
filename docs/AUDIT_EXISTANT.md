# Audit des ressources existantes (14 octobre 2026)

## Source accessible

- Dépôt historique : https://github.com/ibrahim-jamoul/LifeQuest (branche `main`), interrogé en lecture seule via le connecteur GitHub.
- `README.md` : prototype JavaScript / PWA portrait publié antérieurement.
- `package.json` : Node + Playwright, **pas de projet Flutter**.
- `data/catalogue.js` : catalogue éditorial de **115 notions** dans dix matières, dont trois jouables dans l'ancienne version (`MAT-09`, `MAT-12`, `MAT-18`). Le fichier est une cartographie éditoriale, non une certification de conformité aux programmes.
- `docs/CODEX_INSTRUCTIONS.md`, `docs/DECISIONS_VALIDÉES.md` : exigences de portrait, cinq espaces, cours avant exercices, séparation des données mineurs et interdiction des cadeaux réels non autorisés.

## Divergences / arbitrages

- Le nouveau cahier des charges évoque **environ 469 notions** d'anciennes versions. **Ce référentiel n'a pas été obtenu ni vérifié**. Le présent ZIP reprend uniquement les 115 notions réellement retracées dans le dépôt main. Aucun chiffre de 469 n'est présenté comme acquis.
- Nouveau cahier des charges : Flutter + Flame, pas de mission Découverte. La nouvelle base est donc distincte du prototype web.
- École : cours et vidéo avant exercices, sauf alternative explicite quand vidéo absente. Pour le pilote Fractions, l'alternative est un cours écrit authentique, avec indisponibilité vidéo visible.
- Parents : aperçu local, pas de contrôle d'accès simulé ; le dispositif de connexion sécurisé relève de la future version serveur.

## Préservation / rollback

- Aucune écriture sur le dépôt GitHub et aucune modification de Supabase ni de Vercel.
- Archive de code Flutter distribuée séparément. Le prototype web reste la référence historique et le rollback immédiat.
- Les contenus vidéos et assets historiques ne sont pas copiés : pas d'extraction intégrale des médias ni licence vérifiée.

## Limites de l'audit

- Pas de clone complet (l'accès DNS sortant depuis l'environnement de fichiers est indisponible) : seuls les fichiers obtenus via connecteur sont documentés.
- Aucun fichier local Windows de l'utilisateur, aucune ancienne archive du projet et aucun référentiel 469 notions n'ont été audités.
