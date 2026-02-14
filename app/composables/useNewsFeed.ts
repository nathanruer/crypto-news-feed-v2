import { useNewsStore } from '../stores/news'
import { deserializeNewsItem } from '../utils/deserialize-news-item'
import type { WsClientEvent } from '../../shared/types/ws'

const BASE_RECONNECT_MS = 1_000
const MAX_RECONNECT_MS = 30_000

export function useNewsFeed() {
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  let shouldReconnect = true

  function connect() {
    shouldReconnect = true
    createConnection()
  }

  function disconnect() {
    shouldReconnect = false
    if (reconnectTimer) clearTimeout(reconnectTimer)
    ws?.close()
    ws = null
  }

  function createConnection() {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    ws = new WebSocket(`${proto}//${location.host}/_ws`)

    ws.onopen = () => {
      reconnectAttempts = 0
    }

    ws.onmessage = (event) => {
      const store = useNewsStore()
      try {
        const message = JSON.parse(event.data) as WsClientEvent
        if (message.type === 'status') {
          store.setConnectionStatus(message.status)
        }
        else if (message.type === 'news') {
          store.addNews(deserializeNewsItem(message.data))
        }
      }
      catch {
        // Ignore malformed messages
      }
    }

    ws.onclose = () => {
      const store = useNewsStore()
      store.setConnectionStatus('disconnected')
      ws = null
      if (shouldReconnect) scheduleReconnect()
    }

    ws.onerror = () => {
      // Close handler will trigger reconnection
    }
  }

  function scheduleReconnect() {
    const delay = Math.min(BASE_RECONNECT_MS * 2 ** reconnectAttempts, MAX_RECONNECT_MS)
    reconnectAttempts++
    reconnectTimer = setTimeout(createConnection, delay)
  }

  return { connect, disconnect }
}
