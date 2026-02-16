/** Raw message received from Tree of Alpha WSS (multiple formats: news, tweets, etc.) */
export interface TreeOfAlphaMessage {
  _id: string
  title: string
  time: number
  suggestions?: TreeOfAlphaSuggestion[]
  // News fields
  source?: string
  sourceName?: string
  url?: string
  en?: string
  symbols?: string[]
  actions?: TreeOfAlphaAction[]
  firstPrice?: Record<string, number>
  delay?: number
  // Tweet/direct fields
  body?: string
  link?: string
  type?: string
  coin?: string
  icon?: string
  image?: string
  info?: Record<string, unknown>
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

/** Events sent to clients via the internal WS */
export type WsClientEvent
  = | { type: 'news', data: import('./news').SerializedNewsItem }
    | { type: 'status', status: ConnectionStatus }
    | { type: 'alert', data: import('./alert').SerializedAlertEvent }

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected'
