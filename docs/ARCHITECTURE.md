# Architecture / flux technique

```text
Flutter UI (École / Accueil / Parents / Cadeaux / Concentration)
   │        └── GameWidget(ShadowGame / Flame 2D)
   ▼
Riverpod DemoController ─────────── KnowledgeGraph (ID + relations)
   │               ▲
   │               └── domain: Fraction, ShadowModel, DemoState
   ▼
DemoRepository (interface)
   ├── LocalDemoRepository → SharedPreferencesAsync (JSON, schéma 1)
   └── InMemoryDemoRepository → tests

[future] SupabaseRepository → Auth parent / RLS / PostgreSQL
                              ↳ serveur de validation d'attempts
                              ↳ ledger d'étoiles idempotent
```

Les résultats de Flame sont interprétés par le domaine Dart : Flame n'écrit pas dans le portefeuille.

## Politique des contenus

- Identifiant stable, version et statut éditorial.
- `assets/data/catalogue_6e.txt` : 115 notions référencées, 1 seulement liée à un parcours Flutter complet dans École (`MAT-09`).
- Graphe de six connaissances servant d'exemple de lien transdisciplinaire. Les autres notions n'ont pas de liens publiés.
- Le mode curiosité du jour est actuellement une seule expérience fixe : pas de programmateur quotidien ni d'IA générative.
- Pas de moteur de recommandation : liens explicites stockés en données Dart, préparés à une base relationnelle.
- Flame est utilisé seulement pour la simulation 2D de l'ombre. La manipulation Fractions reste volontairement en widgets Flutter.

## Scalabilité prévue

Une `ContentVariant` future reliera un même ID de notion à une difficulté, des prérequis et un registre lexical. Ne pas créer plusieurs catalogues indépendants selon l'âge.

## Idempotence et limites

La démo dérive son solde du journal immuable `transactions`, avec clés `complete:<id>` et `redeem:<id>`. La sérialisation locale protège contre la répétition normale des taps, mais **n'est pas anti-triche** : fichier et code client sont contrôlables. La version serveur ne doit jamais créditer un solde sur présentation du seul score client.
