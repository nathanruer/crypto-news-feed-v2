# Phase 1 — MVP

## Objectif

Dashboard fonctionnel affichant en temps réel les news crypto provenant de Tree of Alpha, avec filtrage, recherche et alertes basiques.

## Features

| # | Feature | Spec | Status |
|---|---------|------|--------|
| 1 | WebSocket proxy Tree of Alpha | PR #1 | Done |
| 2 | Normalisation et persistance des news | PR #2, #3 | Done |
| 3 | Feed temps réel (affichage) | PR #5 | Done |
| 4 | Filtrage par source et ticker | PR #6 | Done |
| 5 | Recherche full-text | PR #7 | Done |
| 6 | Alertes in-app | PR #8 | Done |
| 7 | Chargement news DB + pagination | PR #9 | Done |
| 8 | Design responsive, thème sombre | — | Pending |

## Backlog (chores)

| Chore | Description | Status |
|-------|-------------|--------|
| Logger structuré | Remplacer `console.error/log` par un logger (consola/pino) avec niveaux, contexte, format JSON en prod | Pending |

## Critère de complétion

- [ ] Toutes les features sont livrées et validées
- [ ] `bun test` — tous les tests passent
- [ ] `bun lint` — aucune erreur
- [ ] `bun build` — le build passe
- [ ] Le dashboard est utilisable de bout en bout
