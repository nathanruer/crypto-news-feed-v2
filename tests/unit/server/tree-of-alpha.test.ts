import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TreeOfAlphaService } from '../../../server/services/tree-of-alpha'
import { VALID_NEWS_MESSAGE, MALFORMED_JSON } from '../../fixtures/tree-of-alpha-messages'
import type { TreeOfAlphaMessage } from '../../../shared/types/ws'

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1
  static CLOSED = 3

  readyState = MockWebSocket.OPEN
  listeners: Record<string, ((...args: unknown[]) => void)[]> = {}

  addEventListener(event: string, handler: (...args: unknown[]) => void) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(handler)
  }

  removeEventListener(event: string, handler: (...args: unknown[]) => void) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter(h => h !== handler)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners[event]?.forEach(h => h(...args))
  }
}

describe('TreeOfAlphaService', () => {
  let service: TreeOfAlphaService
  let mockWs: MockWebSocket

  beforeEach(() => {
    vi.useFakeTimers()
    mockWs = new MockWebSocket()
    const wsFactory = () => mockWs as unknown as WebSocket
    service = new TreeOfAlphaService(wsFactory)
  })

  afterEach(() => {
    service.stop()
    vi.useRealTimers()
  })

  describe('parseMessage', () => {
    it('should parse a valid Tree of Alpha message', () => {
      const raw = JSON.stringify(VALID_NEWS_MESSAGE)
      const result = service.parseMessage(raw)

      expect(result).not.toBeNull()
      expect(result!._id).toBe(VALID_NEWS_MESSAGE._id)
      expect(result!.title).toBe(VALID_NEWS_MESSAGE.title)
      expect(result!.source).toBe(VALID_NEWS_MESSAGE.source)
    })

    it('should return null for malformed JSON', () => {
      const result = service.parseMessage(MALFORMED_JSON)
      expect(result).toBeNull()
    })

    it('should return null for messages missing _id', () => {
      const result = service.parseMessage(JSON.stringify({ title: 'no id' }))
      expect(result).toBeNull()
    })

    it('should return null for messages missing title', () => {
      const result = service.parseMessage(JSON.stringify({ _id: '123' }))
      expect(result).toBeNull()
    })
  })

  describe('connection', () => {
    it('should call onNews when a valid message is received', () => {
      const handler = vi.fn<(msg: TreeOfAlphaMessage) => void>()
      service.onNews(handler)
      service.start()

      mockWs.emit('message', { data: JSON.stringify(VALID_NEWS_MESSAGE) })

      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith(VALID_NEWS_MESSAGE)
    })

    it('should not call onNews for malformed messages', () => {
      const handler = vi.fn()
      service.onNews(handler)
      service.start()

      mockWs.emit('message', { data: MALFORMED_JSON })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should call onStatusChange when connected', () => {
      const handler = vi.fn()
      service.onStatusChange(handler)
      service.start()

      mockWs.emit('open')

      expect(handler).toHaveBeenCalledWith('connected')
    })

    it('should call onStatusChange with reconnecting on close', () => {
      const handler = vi.fn()
      service.onStatusChange(handler)
      service.start()

      mockWs.emit('close')

      expect(handler).toHaveBeenCalledWith('reconnecting')
    })
  })

  describe('reconnection', () => {
    it('should attempt reconnection with exponential backoff', () => {
      const statusHandler = vi.fn()
      service.onStatusChange(statusHandler)
      service.start()

      // First disconnect
      mockWs.emit('close')
      expect(statusHandler).toHaveBeenCalledWith('reconnecting')

      // After 1s, should reconnect
      vi.advanceTimersByTime(1000)
      expect(service.reconnectAttempts).toBe(1)
    })

    it('should cap backoff at 60 seconds', () => {
      service.start()

      // Simulate many disconnections
      for (let i = 0; i < 10; i++) {
        mockWs.emit('close')
        mockWs = new MockWebSocket()
        vi.advanceTimersByTime(60_000)
      }

      expect(service.currentBackoff).toBeLessThanOrEqual(60_000)
    })

    it('should reset backoff after successful reconnection', () => {
      service.start()

      // Disconnect
      mockWs.emit('close')
      vi.advanceTimersByTime(1000)

      // Reconnect succeeds
      mockWs.emit('open')

      expect(service.reconnectAttempts).toBe(0)
    })
  })
})
