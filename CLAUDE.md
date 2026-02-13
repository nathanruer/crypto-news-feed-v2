# CryptoFeed — Crypto News Dashboard

## Vision

Dashboard web temps réel affichant les news crypto provenant du flux WebSocket de Tree of Alpha (`wss://news.treeofalpha.com/ws`). L'application permet de suivre, filtrer, rechercher et recevoir des alertes sur l'actualité crypto depuis une interface unique.

**Portée** : Side-project partageable, potentiellement open-source.

---

## Stack technique

| Couche | Technologie | Justification |
|--------|------------|---------------|
| **Framework** | Nuxt 3 (Vue 3 + TypeScript) | Full-stack en un seul projet via Nitro, SSR/SSG flexible, excellent DX |
| **Styling** | Tailwind CSS 4 + shadcn-vue | Utility-first, composants accessibles, thème dark/light natif |
| **State management** | Pinia | Store officiel Vue 3, type-safe, devtools intégrés |
| **Database** | PostgreSQL (Neon free tier en prod) | Robuste, requêtes complexes pour analytics, free tier suffisant |
| **ORM** | Drizzle ORM | Type-safe, schema-as-code, migrations auto, léger |
| **WebSocket serveur** | Nitro WebSocket (crossws) | Intégré à Nuxt, pas de serveur séparé |
| **Testing unitaire/intégration** | Vitest + Vue Test Utils | Rapide, compatible Vite, API Jest-like |
| **Testing E2E** | Playwright | Multi-navigateur, fiable, bonne API |
| **Linting/Formatting** | ESLint (flat config) + Prettier | Config Nuxt officielle |
| **Package manager** | Bun | Utilisé uniquement comme package manager (install, scripts). Ultra rapide. |
| **Runtime** | Node.js 22 LTS | Runtime Nuxt/Nitro. Dernière LTS, compatibilité maximale avec crossws/WebSocket. |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Nuxt 3 App                       │
│                                                     │
│  ┌──────────────┐    ┌───────────────────────────┐  │
│  │   Frontend    │    │     Nitro Server           │  │
│  │   (Vue 3)     │◄──►│                           │  │
│  │               │ WS │  ┌─────────────────────┐  │  │
│  │  - Pages      │    │  │  WS Proxy Service   │  │  │
│  │  - Components │    │  │  (Tree of Alpha)     │  │  │
│  │  - Stores     │    │  └────────┬────────────┘  │  │
│  │  - Composables│    │           │               │  │
│  └──────────────┘    │  ┌────────▼────────────┐  │  │
│                      │  │  API Routes          │  │  │
│                      │  │  /api/news           │  │  │
│                      │  │  /api/alerts          │  │  │
│                      │  │  /api/analytics       │  │  │
│                      │  └────────┬────────────┘  │  │
│                      │           │               │  │
│                      │  ┌────────▼────────────┐  │  │
│                      │  │  Drizzle ORM         │  │  │
│                      │  │  PostgreSQL           │  │  │
│                      │  └─────────────────────┘  │  │
│                      │                           │  │
│                      │  ┌─────────────────────┐  │  │
│                      │  │  Notification Engine │  │  │
│                      │  │  (multi-canal)       │  │  │
│                      │  └─────────────────────┘  │  │
│                      └───────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Flux de données WebSocket

1. **Nitro** maintient UNE connexion persistante à `wss://news.treeofalpha.com/ws`
2. Chaque message reçu est :
   - Parsé et normalisé en format interne `NewsItem`
   - Persisté en base PostgreSQL
   - Évalué contre les règles d'alertes actives
   - Broadcast à tous les clients connectés via le WS interne Nitro
3. **Les clients** reçoivent les news en temps réel via le WS interne et peuvent aussi requêter l'historique via les API REST

### Notification Engine (multi-canal)

Architecture extensible basée sur une interface `NotificationProvider` :

```typescript
interface NotificationProvider {
  name: string
  send(alert: Alert, news: NewsItem): Promise<void>
}
```

Providers prévus (par priorité) :
1. **In-app** : Toast + badge + son (MVP)
2. **Telegram** : Bot API (post-MVP)
3. **Discord** : Webhook (post-MVP)
4. **Email** : Resend/Nodemailer (optionnel)

---

## Fonctionnalités — Priorisation

### Phase 1 — MVP

- [ ] Connexion WebSocket au flux Tree of Alpha (backend proxy)
- [ ] Affichage temps réel des news dans un feed scrollable
- [ ] Normalisation et persistance des news en base
- [ ] Design responsive, thème sombre par défaut
- [ ] Filtrage basique (par source, par coin/ticker mentionné)
- [ ] Recherche full-text dans les news
- [ ] Alertes in-app (règles simples : mot-clé, ticker)
- [ ] Page d'historique avec pagination

### Phase 2 — Enrichissements

- [ ] Analytics : volume de news par heure/jour, trending tickers
- [ ] Graphiques (Chart.js ou D3)
- [ ] Providers de notification externes (Telegram, Discord)
- [ ] Gestion avancée des alertes (combinaisons, cooldown, priorités)
- [ ] Sentiment analysis basique (positif/négatif/neutre)
- [ ] Export des données (CSV, JSON)

### Phase 3 — Polish

- [ ] Auth utilisateur (si multi-user)
- [ ] Préférences utilisateur persistées
- [ ] PWA (notifications push navigateur)
- [ ] Rate limiting / abuse prevention
- [ ] Monitoring / health checks

---

## Structure du projet

```
crypto-news-feed-v2/
├── CLAUDE.md                    # Ce fichier
├── nuxt.config.ts
├── package.json
├── drizzle.config.ts
├── playwright.config.ts
├── vitest.config.ts
├── .env.example
│
├── server/                      # Nitro server
│   ├── api/                     # API REST routes
│   │   ├── news/
│   │   ├── alerts/
│   │   └── analytics/
│   ├── ws/                      # WebSocket handlers
│   │   └── feed.ts              # WS endpoint pour les clients
│   ├── services/                # Business logic
│   │   ├── tree-of-alpha.ts     # Connexion au WSS source
│   │   ├── news.service.ts
│   │   ├── alert.service.ts
│   │   └── notification/
│   │       ├── engine.ts        # Dispatch multi-canal
│   │       ├── providers/
│   │       │   ├── in-app.ts
│   │       │   ├── telegram.ts
│   │       │   └── discord.ts
│   │       └── types.ts
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema
│   │   ├── migrations/
│   │   └── index.ts             # DB client singleton
│   └── utils/
│       ├── normalizer.ts        # Normalisation des news
│       └── ticker-extractor.ts  # Extraction des tickers mentionnés
│
├── app/                         # Nuxt app (frontend)
│   ├── pages/
│   │   ├── index.vue            # Dashboard principal (feed live)
│   │   ├── history.vue          # Historique avec recherche
│   │   ├── alerts.vue           # Gestion des alertes
│   │   └── analytics.vue        # Graphiques et stats
│   ├── components/
│   │   ├── news/
│   │   │   ├── NewsFeed.vue     # Feed temps réel
│   │   │   ├── NewsCard.vue     # Carte individuelle
│   │   │   └── NewsFilter.vue   # Barre de filtres
│   │   ├── alerts/
│   │   │   ├── AlertList.vue
│   │   │   └── AlertForm.vue
│   │   ├── analytics/
│   │   │   └── ...
│   │   └── ui/                  # shadcn-vue components
│   ├── composables/
│   │   ├── useNewsFeed.ts       # Composable WebSocket client
│   │   ├── useAlerts.ts
│   │   └── useAnalytics.ts
│   ├── stores/
│   │   ├── news.ts              # Store Pinia news
│   │   └── alerts.ts            # Store Pinia alertes
│   └── assets/
│       └── css/
│           └── main.css         # Tailwind imports
│
├── shared/                      # Code partagé frontend/backend
│   └── types/
│       ├── news.ts              # NewsItem, NewsSource, etc.
│       ├── alert.ts             # Alert, AlertRule, etc.
│       └── notification.ts      # NotificationProvider, etc.
│
└── tests/
    ├── unit/
    │   ├── server/
    │   │   ├── normalizer.test.ts
    │   │   ├── ticker-extractor.test.ts
    │   │   ├── news.service.test.ts
    │   │   └── alert.service.test.ts
    │   └── app/
    │       ├── components/
    │       └── composables/
    ├── integration/
    │   ├── api/
    │   │   ├── news.test.ts
    │   │   └── alerts.test.ts
    │   └── ws/
    │       └── feed.test.ts
    └── e2e/
        ├── feed.spec.ts
        ├── history.spec.ts
        └── alerts.spec.ts
```

---

## Process de delivery — Feature Lifecycle

Chaque nouvelle feature suit un pipeline professionnel en 6 étapes. L'agent (Claude) ne commence **jamais** à coder avant d'avoir complété les étapes 1 à 3 et obtenu la validation du développeur.

### Étape 1 — Discovery & Cadrage

**Déclencheur** : Le développeur demande une nouvelle feature ou un changement.

**L'agent produit** :

1. **Résumé de la demande** : Reformulation en 1-2 phrases pour confirmer la compréhension
2. **Questions de clarification** : Tout ce qui est ambigu ou sous-spécifié est identifié et posé au développeur AVANT d'avancer
3. **Périmètre explicite** :
   - **IN scope** : Ce qui sera livré
   - **OUT of scope** : Ce qui ne sera PAS livré (et pourquoi)
4. **Dépendances** : Features ou composants pré-requis qui doivent exister

> **Gate** : Le développeur valide le cadrage avant de passer à l'étape 2.

### Étape 2 — Spécification fonctionnelle

**L'agent produit un document de spec** (dans un commentaire ou un fichier `docs/specs/FEAT-xxx.md` si le développeur le souhaite) contenant :

1. **User Stories** au format standard :
   ```
   En tant que [utilisateur],
   je veux [action],
   afin de [bénéfice].
   ```

2. **Critères d'acceptation** (Given/When/Then) :
   ```
   GIVEN l'utilisateur est sur le dashboard
   WHEN une nouvelle news arrive via WebSocket
   THEN la news apparaît en haut du feed sans rechargement
   AND un indicateur visuel signale la nouvelle entrée
   ```

3. **Cas limites identifiés** :
   - Que se passe-t-il si le WebSocket se déconnecte ?
   - Que se passe-t-il si la DB est pleine ?
   - Que se passe-t-il avec 1000 news en 1 minute ?

4. **Maquette textuelle** (si UI) : Description ASCII ou structurelle du rendu attendu

> **Gate** : Le développeur valide la spec. Tout désaccord est résolu ici, pas pendant le dev.

### Étape 3 — Design technique

**L'agent produit** :

1. **Fichiers impactés** : Liste exhaustive des fichiers à créer/modifier
2. **Modèle de données** : Nouvelles tables, colonnes, ou modifications de schema Drizzle
3. **Interfaces/Types** : Définition TypeScript des nouveaux types dans `shared/types/`
4. **API contract** : Endpoints REST ou messages WS ajoutés/modifiés (méthode, path, payload, response)
5. **Diagramme de flux** (si pertinent) : Séquence des opérations
6. **Risques techniques** : Points d'attention, compromis, dette technique potentielle
7. **Estimation de complexité** : S / M / L / XL (pas de durée, juste la taille relative)

> **Gate** : Le développeur valide le design technique. C'est le dernier point de validation avant le code.

### Étape 4 — Découpage en tâches

**L'agent découpe la feature en tâches atomiques** ordonnées, chacune :
- Indépendamment testable
- Livrable en un commit
- Décrite avec un verbe d'action (`Créer`, `Implémenter`, `Ajouter`, `Modifier`)

Exemple :
```
Feature: Filtrage par ticker
├── T1: Définir le type TickerFilter dans shared/types/news.ts
├── T2: Implémenter extractTickers() dans server/utils/ticker-extractor.ts (TDD)
├── T3: Ajouter la colonne `tickers` au schema news + migration
├── T4: Modifier news.service.ts pour persister les tickers extraits (TDD)
├── T5: Créer GET /api/news?ticker=BTC avec filtrage DB (TDD)
├── T6: Implémenter le composant NewsFilter.vue avec sélecteur de tickers
├── T7: Connecter le filtre au store Pinia et à l'API
├── T8: Test E2E du parcours filtrage
└── T9: Commit final + mise à jour CLAUDE.md si nécessaire
```

Les tâches sont trackées via le **TodoWrite** de l'agent tout au long de l'implémentation.

> **Pas de gate ici** : Le découpage est une conséquence directe du design validé. L'agent enchaîne directement sur l'implémentation.

### Étape 5 — Implémentation TDD

Chaque tâche suit le cycle **Red-Green-Refactor** :

1. **RED** : Écrire le(s) test(s) qui décrivent le comportement attendu → les tests échouent
2. **GREEN** : Écrire le code **minimal** pour faire passer les tests
3. **REFACTOR** : Nettoyer (nommage, extraction, simplification) en gardant les tests verts
4. **COMMIT** : Un commit par tâche complétée (tests + implémentation)

**Ordre de développement par couche** (pour chaque tâche) :
1. Types/interfaces (`shared/types/`)
2. Tests unitaires → implémentation des services/utils
3. Tests d'intégration → implémentation des API routes
4. Tests composants → implémentation des composants Vue
5. Tests E2E → validation du parcours utilisateur

**Conventions de testing** :
- **Fichiers** : `*.test.ts` pour unit/intégration, `*.spec.ts` pour E2E
- **Nommage** : `describe('NomDuModule')` → `it('should faire quelque chose de précis')`
- **Mocking** : Mocker les dépendances externes (WebSocket Tree of Alpha, DB en tests unitaires)
- **Fixtures** : `tests/fixtures/` pour les données de test réutilisables
- **Couverture** : Viser 80%+ sur la logique métier (services, utils, stores)
- **Pas de test pour le trivial** : Pas de tests pour du pur wiring ou de la config

### Étape 6 — Review & Clôture

Une fois toutes les tâches complétées :

1. **L'agent exécute** :
   - `bun test` — tous les tests passent
   - `bun lint` — aucune erreur de lint
   - `bun build` — le build passe
2. **L'agent produit un résumé de livraison** :
   - Ce qui a été implémenté
   - Fichiers créés/modifiés
   - Tests ajoutés (nombre et couverture)
   - Décisions prises en cours de route
   - Dette technique identifiée (si applicable)
3. **Le développeur fait sa propre review** et signale les ajustements

> **La feature n'est considérée comme terminée qu'après validation du développeur.**

---

### Récapitulatif visuel du pipeline

```
 Demande          Cadrage         Spec            Design          Tâches          TDD             Review
───────► [ 1. Discovery ] ──► [ 2. Spec ] ──► [ 3. Design ] ──► [ 4. Tasks ] ──► [ 5. Code ] ──► [ 6. Done ]
              │                    │                │                                                  │
              ▼                    ▼                ▼                                                  ▼
          Validation          Validation        Validation                                        Validation
          développeur         développeur       développeur                                       développeur
```

**Règle d'or** : L'agent ne touche pas au code avant que les étapes 1-3 soient validées. En cas de doute, il demande. Mieux vaut poser une question de trop que de livrer quelque chose de faux.

---

## Conventions de développement

### Code style

- **TypeScript strict** : `strict: true`, pas de `any` sauf cas exceptionnel documenté
- **Composition API** uniquement (pas d'Options API)
- **`<script setup lang="ts">`** pour tous les composants Vue
- **Auto-imports** Nuxt activés (composables, utils, components)
- **Nommage** :
  - Composants : PascalCase (`NewsCard.vue`)
  - Composables : camelCase avec préfixe `use` (`useNewsFeed.ts`)
  - Services : camelCase avec suffixe `.service.ts`
  - Types/interfaces : PascalCase (`NewsItem`, `AlertRule`)
  - Constantes : UPPER_SNAKE_CASE

### Garde-fous de code health

Limites strictes. Si un fichier/fonction dépasse ces seuils, c'est un signal de refactoring immédiat — pas de dette "on verra plus tard".

| Règle | Limite | Action si dépassée |
|-------|--------|-------------------|
| Lignes par fichier | **150 max** (composants), **200 max** (services/utils) | Extraire en sous-modules |
| Lignes par fonction | **30 max** | Découper en fonctions privées |
| Paramètres par fonction | **4 max** | Utiliser un objet de config |
| Niveaux d'indentation | **3 max** | Early return, extraction |
| Lignes par `<template>` Vue | **80 max** | Extraire en sous-composants |
| Props par composant | **8 max** | Le composant fait trop de choses → découper |
| Imports par fichier | **15 max** | Le module a trop de dépendances → repenser |

**Quand extraire un composant** :
- Il rend plus de 3 éléments logiquement distincts
- Il a sa propre logique d'état interne
- Il est réutilisé (ou réutilisable) ailleurs
- Le `<template>` dépasse 80 lignes

**Quand extraire un composable** :
- De la logique avec état est dupliquée entre 2+ composants
- Un composant mélange logique métier et logique UI
- Le `<script setup>` dépasse 60 lignes de logique

---

## Architecture des composants

### Hiérarchie à 3 niveaux

```
app/components/
├── ui/              # Niveau 1 — Primitives (shadcn-vue)
│   ├── Button.vue       Aucune logique métier. Props = variants visuels.
│   ├── Card.vue         Pas de fetch, pas de store, pas de routing.
│   ├── Badge.vue        Réutilisable partout. Testé visuellement.
│   └── ...
│
├── domain/          # Niveau 2 — Composants métier
│   ├── news/
│   │   ├── NewsCard.vue         Affiche UNE news. Props: NewsItem.
│   │   ├── NewsCardSkeleton.vue Loading state d'une NewsCard.
│   │   ├── NewsList.vue         Liste de NewsCard. Props: NewsItem[].
│   │   ├── NewsFilter.vue       Barre de filtres. Émet des FilterChange.
│   │   └── NewsSearchBar.vue    Input de recherche avec debounce.
│   ├── alerts/
│   │   ├── AlertCard.vue
│   │   ├── AlertForm.vue
│   │   └── AlertList.vue
│   └── analytics/
│       └── ...
│
└── layout/          # Niveau 3 — Structure de page
    ├── AppHeader.vue
    ├── AppSidebar.vue
    └── AppFooter.vue
```

### Conventions de composants

```vue
<!-- Ordre des sections dans un .vue -->
<script setup lang="ts">
// 1. Imports de types
// 2. Props & Emits (defineProps, defineEmits)
// 3. Composables (useX)
// 4. State réactif (ref, computed)
// 5. Watchers (watch, watchEffect)
// 6. Fonctions handlers
// 7. Lifecycle hooks (onMounted, etc.)
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
  /* Styles scopés, Tailwind en priorité via les classes */
</style>
```

**Règles dures** :
- **Props down, events up** — jamais de mutation directe d'un prop
- **Un composant = une responsabilité** — si le nom contient "And" (ex: `NewsListAndFilter`), c'est deux composants
- **Pas de logique métier dans les composants UI** — les `ui/` ne connaissent ni Pinia, ni les API, ni les types métier
- **Pas de `v-if` / `v-else` en cascade (>2)** — extraire en composant ou utiliser un mapping
- **Slots nommés** pour la composition, pas des props de rendu complexes
- **Chaque composant domain/ a son skeleton/loading state** associé

### Conventions de state (Pinia)

- **Un store par domaine** : `news.ts`, `alerts.ts` — pas de store "global fourre-tout"
- **Actions pour les side-effects** (fetch, WS), **getters pour les dérivations** (filtrage, tri)
- **Pas d'accès direct au store depuis les composants `ui/`** — les composants domain passent les données en props
- **Stores légers** : si un store dépasse 100 lignes, extraire la logique dans un service

---

## Design system

### Thème — Dark first

L'app est conçue dark-first (écran de trading). Le thème light est un bonus, pas la priorité.

### Tokens de design (via Tailwind / CSS custom properties)

```css
/* Palette sémantique — définie dans main.css, consommée via Tailwind */
:root {
  /* Surfaces */
  --color-bg-primary: ...;      /* Fond principal */
  --color-bg-secondary: ...;    /* Fond cartes/panels */
  --color-bg-tertiary: ...;     /* Fond inputs/hover */

  /* Texte */
  --color-text-primary: ...;    /* Texte principal */
  --color-text-secondary: ...;  /* Texte secondaire/muted */
  --color-text-accent: ...;     /* Liens, éléments interactifs */

  /* Sémantique */
  --color-bullish: ...;         /* Vert — news positives, hausse */
  --color-bearish: ...;         /* Rouge — news négatives, baisse */
  --color-warning: ...;         /* Orange — alertes */
  --color-info: ...;            /* Bleu — informatif */

  /* Espacement — échelle 4px */
  /* Utiliser les classes Tailwind : p-1 (4px), p-2 (8px), p-3 (12px), p-4 (16px)... */

  /* Typographie */
  --font-mono: 'JetBrains Mono', monospace;  /* Code, tickers, timestamps */
  --font-sans: 'Inter', sans-serif;          /* Tout le reste */
}
```

### Conventions shadcn-vue

- Installer les composants via `npx shadcn-vue@latest add <component>`
- Ne **jamais modifier** les fichiers générés dans `ui/` — override via props/slots/classes
- Si un composant shadcn ne couvre pas le besoin → créer un composant domain/ qui le wrap

---

## Convention API

### Format de réponse standard

Toutes les réponses API suivent un enveloppe uniforme :

```typescript
// Succès
interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    pageSize?: number
  }
}

// Erreur
interface ApiError {
  error: {
    code: string        // Machine-readable: "NEWS_NOT_FOUND", "VALIDATION_ERROR"
    message: string     // Human-readable: "News item not found"
    details?: unknown   // Détails additionnels (erreurs de validation, etc.)
  }
}
```

### Conventions REST

| Action | Méthode | Pattern | Exemple |
|--------|---------|---------|---------|
| Lister | GET | `/api/{resource}` | `GET /api/news?page=1&ticker=BTC` |
| Détail | GET | `/api/{resource}/:id` | `GET /api/news/123` |
| Créer | POST | `/api/{resource}` | `POST /api/alerts` |
| Modifier | PATCH | `/api/{resource}/:id` | `PATCH /api/alerts/42` |
| Supprimer | DELETE | `/api/{resource}/:id` | `DELETE /api/alerts/42` |

### Pagination

```typescript
// Query params
GET /api/news?page=1&pageSize=50&sort=createdAt:desc

// Réponse
{
  "data": [...],
  "meta": { "total": 1420, "page": 1, "pageSize": 50 }
}
```

### Codes d'erreur HTTP

- `400` : Erreur de validation (input invalide)
- `404` : Ressource non trouvée
- `422` : Entité non traitable (logique métier)
- `500` : Erreur serveur inattendue (loggée, jamais de détails exposés au client)

---

## Stratégie d'erreurs

### Serveur (Nitro)

- **Erreurs attendues** (validation, not found) : Retourner le format `ApiError` avec le bon code HTTP. Pas de log error, juste un log info.
- **Erreurs inattendues** (crash, timeout DB) : Catch global, log complet (stack trace), retourner `500` avec message générique.
- **Erreurs WebSocket** (déconnexion Tree of Alpha) : Reconnexion automatique avec backoff exponentiel (1s, 2s, 4s, 8s... max 60s). Log chaque tentative. Broadcast d'un événement `connection_status` aux clients.

### Client (Vue)

- **Composable `useApi()`** : Wrapper autour de `$fetch` qui gère automatiquement les erreurs, le loading state et le typing.
- **Toast pour les erreurs utilisateur** : Erreurs 4xx → toast warning avec le message. Erreurs 5xx → toast error générique "Une erreur est survenue".
- **État de connexion WS visible** : Indicateur dans le header (connecté / reconnexion en cours / déconnecté).
- **Pas de `try/catch` silencieux** : Chaque catch doit soit afficher un feedback utilisateur, soit remonter l'erreur.

---

## Boucle d'auto-amélioration

Le CLAUDE.md est un **document vivant** qui s'enrichit au fil du projet.

### Quand mettre à jour le CLAUDE.md

| Événement | Action |
|-----------|--------|
| Nouveau pattern récurrent découvert | Ajouter dans les conventions |
| Bug causé par un oubli de convention | Renforcer la règle concernée |
| Refactoring structurel | Mettre à jour la structure du projet |
| Nouvelle dépendance ajoutée | Mettre à jour la stack technique |
| Feature complétée | Cocher dans la checklist des phases |
| Décision d'architecture prise | Documenter dans Notes d'architecture |

### Memory files (auto-apprentissage de l'agent)

L'agent maintient des fichiers mémoire dans `.claude/` pour les patterns appris :
- Erreurs récurrentes et leurs solutions
- Patterns spécifiques au projet découverts en cours de route
- Préférences du développeur observées au fil des interactions

Ces fichiers sont consultés automatiquement au début de chaque session.

### Checklist de qualité pré-commit

Avant chaque commit, l'agent vérifie :

- [ ] Les tests ajoutés/modifiés passent (`bun test`)
- [ ] Pas de régression sur les tests existants
- [ ] Aucun fichier ne dépasse les limites de code health
- [ ] Le lint passe (`bun lint`)
- [ ] Les types sont corrects (`vue-tsc --noEmit`)
- [ ] Les nouvelles dépendances sont justifiées
- [ ] Pas de `console.log` oublié (sauf logging structuré intentionnel)
- [ ] Pas de secret / credential dans le code
- [ ] Les composants UI ne contiennent pas de logique métier

---

### Git

- **Branches** : `feature/xxx`, `fix/xxx`, `refactor/xxx`
- **Commits** : Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`)
- **PR** : Toujours avec description et lien vers l'issue/feature

### Variables d'environnement

```env
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/cryptofeed
TREE_OF_ALPHA_WS_URL=wss://news.treeofalpha.com/ws

# Notifications (optionnel)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
DISCORD_WEBHOOK_URL=
```

---

## Commandes

```bash
bun dev              # Dev server (Nuxt)
bun build            # Build production
bun test             # Tous les tests (Vitest)
bun test:unit        # Tests unitaires seulement
bun test:integration # Tests d'intégration seulement
bun test:e2e         # Tests E2E (Playwright)
bun test:coverage    # Couverture de code
bun db:generate      # Générer les migrations Drizzle
bun db:migrate       # Appliquer les migrations
bun db:studio        # Drizzle Studio (UI pour la DB)
bun lint             # Linting
bun lint:fix         # Fix auto des erreurs de lint
```

---

## Déploiement (à finaliser)

**Cible** : Un seul service qui tourne 24/7 (nécessaire pour le proxy WS).

Options évaluées :
- **Fly.io** : Free tier avec 3 shared VMs, bon pour commencer. ~$0-5/mois.
- **Railway** : DX excellent, ~$5/mois.
- **Render** : Free tier (spin down après inactivité — problématique pour un WS persistant). Paid à $7/mois.
- **VPS classique** (Hetzner, OVH) : ~$4/mois, contrôle total, Docker.

**Base de données** : Neon PostgreSQL free tier (512MB, 0.25 vCPU). Suffisant pour des milliers de news texte.

---

## Configuration Claude Code — MCP Servers

### Installation

```bash
# Context7 — Docs à jour pour Nuxt, Vue, Drizzle, Tailwind (gratuit, 1000 req/mois)
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# Nuxt UI — Accès aux composants, exemples, docs Nuxt UI (gratuit, officiel)
claude mcp add --transport http nuxt-ui https://ui.nuxt.com/mcp

# Playwright — Pilotage navigateur pour tests E2E (gratuit, local)
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

### Usage

| MCP | Quand l'utiliser | Déclencheur |
|-----|-----------------|-------------|
| **Context7** | Avant d'utiliser une API Nuxt/Vue/Drizzle/Tailwind — pour éviter les patterns obsolètes | Ajouter `use context7` dans le prompt, ou l'agent l'utilise quand il doute d'une API |
| **Nuxt UI** | Quand on intègre un composant UI — pour connaître les props, slots, variants disponibles | L'agent consulte avant de créer/modifier un composant `ui/` |
| **Playwright** | Pour les tests E2E — piloter un vrai navigateur, vérifier le rendu, débugger visuellement | Étape 5 du pipeline (tests E2E) et debug visuel |

### Règles d'utilisation des MCP

- **Context7** : Toujours consulter avant d'écrire du code utilisant une API de framework. Ne pas se fier uniquement à la mémoire du modèle pour les API Nuxt 3 / Vue 3 / Drizzle.
- **Nuxt UI** : Toujours vérifier les props et variants disponibles avant d'utiliser un composant. Ne pas deviner les noms de props.
- **Playwright** : Utiliser le mode headless par défaut. Mode visible (`headed`) uniquement pour le debug.

---

## Notes d'architecture

- Le proxy WebSocket est le coeur du système. Sa résilience est critique : reconnexion automatique, backoff exponentiel, logging des déconnexions.
- Les news sont immutables une fois persistées — pas d'update, seulement des inserts. Cela simplifie le caching et la concurrence.
- L'extraction des tickers est heuristique (regex + dictionnaire connu). On itérera sur la précision.
- Le système d'alertes évalue les règles à chaque news entrante. Attention à la performance si beaucoup de règles → indexation côté DB ou évaluation in-memory avec cache.
