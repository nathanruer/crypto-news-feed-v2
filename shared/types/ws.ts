/** Message brut reçu du WSS Tree of Alpha */
export interface TreeOfAlphaMessage {
  _id: string
  title: string
  source: string
  sourceName?: string
  url: string
  en?: string
  time: number
  symbols: string[]
  suggestions: TreeOfAlphaSuggestion[]
  actions: TreeOfAlphaAction[]
  firstPrice: Record<string, number>
  delay?: number
}

export interface TreeOfAlphaSuggestion {
  coin: string
  found: string[]
  symbols: { exchange: string, symbol: string }[]
  supply?: number
}

export interface TreeOfAlphaAction {
  action: string
  title: string
  icon: string
}

/** Événements envoyés aux clients via le WS interne */
export type WsClientEvent
  = | { type: 'news', data: TreeOfAlphaMessage }
    | { type: 'status', status: ConnectionStatus }

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected'
