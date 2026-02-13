# feat: WebSocket Proxy Tree of Alpha

## 1. Discovery & Cadrage

### Résumé

Établir une connexion WebSocket persistante côté serveur (Nitro) vers `wss://news.treeofalpha.com/ws` et redistribuer les messages reçus à tous les clients connectés au dashboard via un WebSocket interne Nitro.

### Périmètre

**IN scope** :
- Connexion au WSS Tree of Alpha (public, sans auth)
- Reconnexion automatique avec backoff exponentiel
- Parsing et typage des messages entrants
- Broadcast aux clients connectés via WS interne
- Indicateur de statut de connexion (connecté / reconnexion / déconnecté)

**OUT of scope** :
- Persistance en base de données (feature suivante)
- Normalisation avancée des messages (feature suivante)
- Filtrage côté serveur (feature ultérieure)

### Dépendances

- Aucune feature pré-requise
- Nitro WebSocket expérimental activé (`nuxt.config.ts` — déjà en place)

---

## 2. Spécification fonctionnelle

### User Stories

```
En tant qu'utilisateur du dashboard,
je veux voir les news crypto apparaître en temps réel,
afin de suivre l'actualité sans rafraîchir la page.
```

```
En tant qu'utilisateur du dashboard,
je veux voir le statut de connexion au flux de news,
afin de savoir si les données arrivent bien ou si la connexion est perdue.
```

### Critères d'acceptation

```
GIVEN le serveur Nitro est démarré
WHEN le service Tree of Alpha démarre
THEN une connexion WebSocket est établie vers wss://news.treeofalpha.com/ws
AND un log info confirme la connexion
```

```
GIVEN la connexion au WSS est établie
WHEN un message arrive du flux Tree of Alpha
THEN le message est parsé en type TreeOfAlphaMessage
AND le message est broadcasté à tous les clients WS connectés
```

```
GIVEN la connexion au WSS est perdue
WHEN le serveur détecte la déconnexion
THEN une reconnexion est tentée avec backoff exponentiel (1s, 2s, 4s, 8s... max 60s)
AND un événement { type: "status", status: "reconnecting" } est envoyé aux clients
```

```
GIVEN la reconnexion réussit
WHEN la connexion est rétablie
THEN un événement { type: "status", status: "connected" } est envoyé aux clients
AND le flux de news reprend normalement
```

### Cas limites

- **Message malformé** : le WSS envoie du JSON invalide → log warning, ignorer le message, ne pas crash
- **Aucun client connecté** : le serveur reçoit les messages mais n'a personne à qui broadcaster → les messages sont ignorés (pas de buffering)
- **Burst de messages** : 100+ messages/seconde → pas de throttling pour l'instant, on broadcast tout

---

## 3. Design technique

### Fichiers impactés

| Action | Fichier | Description |
|--------|---------|-------------|
| Créer | `shared/types/ws.ts` | Types pour les messages WS (TreeOfAlphaMessage, WsEvent) |
| Créer | `server/services/tree-of-alpha.ts` | Service de connexion au WSS source |
| Créer | `server/routes/_ws.ts` | WebSocket endpoint Nitro pour les clients |
| Créer | `tests/unit/server/tree-of-alpha.test.ts` | Tests unitaires du service |
| Créer | `tests/fixtures/tree-of-alpha-messages.ts` | Messages exemples pour les tests |

### Types TypeScript

```typescript
// shared/types/ws.ts

/** Message brut reçu du WSS Tree of Alpha */
export interface TreeOfAlphaMessage {
  _id: string
  title: string
  source: string
  sourceName: string
  url: string
  en: string
  time: number
  symbols: string[]
  suggestions: TreeOfAlphaSuggestion[]
  actions: TreeOfAlphaAction[]
  firstPrice: Record<string, number>
  delay?: number
}

interface TreeOfAlphaSuggestion {
  coin: string
  found: string[]
  symbols: { exchange: string; symbol: string }[]
  supply?: number
}

interface TreeOfAlphaAction {
  action: string
  title: string
  icon: string
}

/** Événements envoyés aux clients via le WS interne */
export type WsClientEvent =
  | { type: 'news'; data: TreeOfAlphaMessage }
  | { type: 'status'; status: 'connected' | 'reconnecting' | 'disconnected' }
```

### Architecture du flux

```
Tree of Alpha WSS                  Nitro Server                    Clients
━━━━━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━━━
                       ┌──────────────────────────┐
  wss://news...   ──── │  tree-of-alpha.ts         │
                       │  (1 connexion persistante) │
                       │                            │
                       │  parse → validate → emit   │
                       └───────────┬──────────────┘
                                   │ broadcast
                       ┌───────────▼──────────────┐
                       │  _ws.ts                   │ ──── Client 1
                       │  (endpoint WS interne)    │ ──── Client 2
                       │                           │ ──── Client N
                       └───────────────────────────┘
```

### Stratégie de reconnexion

```
Tentative 1 : attendre 1s
Tentative 2 : attendre 2s
Tentative 3 : attendre 4s
Tentative 4 : attendre 8s
...
Tentative N : attendre min(2^N secondes, 60s)

Après reconnexion réussie : reset du compteur
```

### Risques techniques

- **crossws (Nitro WS)** : API encore expérimentale. Si un problème bloque, fallback possible vers un ws classique avec `ws` package.
- **Memory leak** : S'assurer que les listeners sont nettoyés à la déconnexion des clients.

### Complexité : **M** (Medium)

---

## 4. Tâches

- [ ] T1: Créer les types WS dans `shared/types/ws.ts`
- [ ] T2: Créer les fixtures de test dans `tests/fixtures/tree-of-alpha-messages.ts`
- [ ] T3: Implémenter le service `tree-of-alpha.ts` avec reconnexion (TDD)
- [ ] T4: Implémenter l'endpoint WS client `server/routes/_ws.ts`
- [ ] T5: Tester manuellement avec `bun dev` + wscat/websocat
- [ ] T6: Lint + tests + build passent

---

## 5. Résumé de livraison

_À remplir une fois la feature terminée._
