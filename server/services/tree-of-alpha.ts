import type { TreeOfAlphaMessage, ConnectionStatus } from '../../shared/types/ws'

type WsFactory = () => WebSocket
type NewsHandler = (msg: TreeOfAlphaMessage) => void
type StatusHandler = (status: ConnectionStatus) => void

const MAX_BACKOFF_MS = 60_000
const BASE_BACKOFF_MS = 1_000

export class TreeOfAlphaService {
  private ws: WebSocket | null = null
  private wsFactory: WsFactory
  private newsHandlers: NewsHandler[] = []
  private statusHandlers: StatusHandler[] = []
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  reconnectAttempts = 0
  currentBackoff = 0

  constructor(wsFactory: WsFactory) {
    this.wsFactory = wsFactory
  }

  start() {
    this.connect()
  }

  stop() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }

  onNews(handler: NewsHandler) {
    this.newsHandlers.push(handler)
  }

  onStatusChange(handler: StatusHandler) {
    this.statusHandlers.push(handler)
  }

  parseMessage(raw: string): TreeOfAlphaMessage | null {
    try {
      const data = JSON.parse(raw)
      if (!data._id || !data.title) return null
      return data as TreeOfAlphaMessage
    }
    catch {
      return null
    }
  }

  private connect() {
    this.ws = this.wsFactory()
    this.ws.addEventListener('open', this.handleOpen)
    this.ws.addEventListener('message', this.handleMessage)
    this.ws.addEventListener('close', this.handleClose)
    this.ws.addEventListener('error', this.handleError)
  }

  private handleOpen = () => {
    this.reconnectAttempts = 0
    this.currentBackoff = 0
    this.emitStatus('connected')
  }

  private handleMessage = (event: MessageEvent | { data: string }) => {
    const raw = typeof event.data === 'string' ? event.data : String(event.data)
    const message = this.parseMessage(raw)
    if (message) {
      this.newsHandlers.forEach(h => h(message))
    }
  }

  private handleClose = () => {
    this.emitStatus('reconnecting')
    this.scheduleReconnect()
  }

  private handleError = () => {
    // Error is always followed by close, reconnection handled there
  }

  private scheduleReconnect() {
    this.currentBackoff = Math.min(
      BASE_BACKOFF_MS * 2 ** this.reconnectAttempts,
      MAX_BACKOFF_MS,
    )
    this.reconnectAttempts++

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.currentBackoff)
  }

  private emitStatus(status: ConnectionStatus) {
    this.statusHandlers.forEach(h => h(status))
  }
}
