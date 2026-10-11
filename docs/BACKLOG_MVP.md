# Backlog LifeQuest V3 — état de réalisation du ZIP

**36 tâches**, classées dans 7 phases. Les statuts décrivent les fichiers réellement livrés, pas une V1 finalisée.

## 01 — Fondations du jeu

- [x] **LQ-01-01** — Auditer code/assets existants — *fait : prototype, archives HTML et dépôt historique comparés en lecture seule*
- [x] **LQ-01-02** — Définir architecture MVP — *fait : prototype autonome statique*
- [ ] **LQ-01-03** — Créer PWA et fonctionnement local — *partiel : installation dépend HTTPS/support navigateur*
- [x] **LQ-01-04** — Concevoir interfaces portrait smartphones/tablettes — *fait : CSS et E2E émulés de 320×568 à 768×1024 ; appareils réels encore requis*
- [x] **LQ-01-05** — Navigation et composants UI réutilisables — *fait : prototype JS*
- [x] **LQ-01-06** — Sauvegarde profils/progression — *fait : localStorage démo*

## 02 — Écrans principaux

- [x] **LQ-02-01** — Chargement LifeQuest — *fait*
- [x] **LQ-02-02** — Écran titre / Jouer — *fait*
- [ ] **LQ-02-03** — Connexion / sélection profils — *partiel : profils de démonstration sans authentification*
- [ ] **LQ-02-04** — Création/personnalisation personnage — *partiel : 4 avatars symboliques*
- [ ] **LQ-02-05** — Robot mascotte et introduction — *partiel : Nova est un concept SVG*
- [x] **LQ-02-06** — Lobby fusionné avec cinq espaces — *fait*
- [ ] **LQ-02-07** — Navigation/missions/résultats/progression — *partiel : 3 notions jouables*
- [ ] **LQ-02-08** — Profil/pause/paramètres/aide — *partiel : profil et paramètres, pause hors gameplay*

## 03 — Référentiel scolaire 6e

- [ ] **LQ-03-01** — Consulter programmes officiels 2026–2027 — *partiel : sources et calendriers vérifiés*
- [x] **LQ-03-02** — Recenser matières/chapitres/notions — *fait : reprise 115 notions matrice LifeQuest v1, exhaustivité non certifiée*
- [ ] **LQ-03-03** — Structurer ID/objectifs/prérequis — *partiel : ID et domaines, champs pédagogiques à enrichir*
- [x] **LQ-03-04** — Navigation matière → chapitre → notion — *fait*
- [x] **LQ-03-05** — Statuts éditoriaux de disponibilité — *fait*

## 04 — Moteur pédagogique École

- [x] **LQ-04-01** — Créer fiche standard notion — *fait*
- [x] **LQ-04-02** — Lecteur vidéo 1–2 minutes — *fait : 3 démos muettes 70s*
- [x] **LQ-04-03** — Support de cours écrit — *fait : 3 démos*
- [x] **LQ-04-04** — Déblocage activités après lecture — *fait : lecture séquentielle jusqu’à ended, avance directe refusée*
- [x] **LQ-04-05** — Quiz avec correction — *fait : 3 × 3 questions*
- [ ] **LQ-04-06** — Modèles mini-jeux réutilisables — *partiel : 3 mécaniques de démo*
- [ ] **LQ-04-07** — Résultats/récompenses/maîtrise — *partiel : notion validée après quiz≥2/3 et mini-jeu*
- [ ] **LQ-04-08** — Premier lot de notions jouables — *partiel : 3 démos, cible 5–8 validées par enseignant*

## 05 — Concentration

- [ ] **LQ-05-01** — Définir les mécaniques et parcours — *à confirmer : la minuterie est hypothèse*
- [x] **LQ-05-02** — Créer son interface — *fait : interface démo*
- [x] **LQ-05-03** — Session fonctionnelle et fin de session — *fait : minuterie, pause, reprise persistante et historique local*

## 06 — Cadeaux

- [ ] **LQ-06-01** — Définir les règles d’attribution — *partiel : points attribués une fois par notion*
- [ ] **LQ-06-02** — Catalogue virtuel / réel — *partiel : virtuel actif, réel désactivé*
- [ ] **LQ-06-03** — Parcours demande cadeau — *reporté : pas de demande réelle sans vérification parentale*
- [ ] **LQ-06-04** — Validation parentale sécurisée minimale — *reporté et bloquant : aucune validation cadeau réel*

## 07 — Tests et livraison

- [ ] **LQ-07-01** — Tests Android/iOS portrait, installation PWA — *à exécuter sur appareils réels*
- [x] **LQ-07-02** — Corriger bugs et valider MVP local — *fait pour le périmètre local : 6 tests Node et 8 E2E Chrome ; appareils réels suivis par LQ-07-01*
