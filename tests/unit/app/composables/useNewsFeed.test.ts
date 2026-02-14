import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNewsFeed } from '../../../../app/composables/useNewsFeed'
import { useNewsStore } from '../../../../app/stores/news'

class MockWebSocket {
  static instances: MockWebSocket[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  readyState = 0
  url: string

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }

  close() {
    this.readyState = 3
  }

  simulateOpen() {
    this.readyState = 1
    this.onopen?.()
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }

  simulateClose() {
    this.readyState = 3
    this.onclose?.()
  }
}

describe('useNewsFeed', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    MockWebSocket.instances = []
    vi.stubGlobal('WebSocket', MockWebSocket)
    vi.stubGlobal('location', { protocol: 'http:', host: 'localhost:3000' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should create a WebSocket connection on connect', () => {
    const { connect, disconnect } = useNewsFeed()
    connect()
    expect(MockWebSocket.instances).toHaveLength(1)
    expect(MockWebSocket.instances[0].url).toBe('ws://localhost:3000/_ws')
    disconnect()
  })

  it('should dispatch status events to the store', () => {
    const { connect, disconnect } = useNewsFeed()
    const store = useNewsStore()
    connect()

    const ws = MockWebSocket.instances[0]
    ws.simulateOpen()
    ws.simulateMessage({ type: 'status', status: 'connected' })

    expect(store.connectionStatus).toBe('connected')
    disconnect()
  })

  it('should dispatch news events to the store', () => {
    const { connect, disconnect } = useNewsFeed()
    const store = useNewsStore()
    connect()

    const ws = MockWebSocket.instances[0]
    ws.simulateOpen()
    ws.simulateMessage({
      type: 'news',
      data: {
        id: 'test-1',
        title: 'Test',
        body: 'Body',
        source: 'Twitter',
        sourceName: 'BTC',
        url: 'https://example.com',
        tickers: ['BTC'],
        time: '2025-06-15T12:00:00.000Z',
        receivedAt: '2025-06-15T12:00:01.000Z',
      },
    })

    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe('test-1')
    expect(store.items[0].time).toBeInstanceOf(Date)
    disconnect()
  })

  it('should set status to disconnected on close', () => {
    vi.useFakeTimers()
    const { connect, disconnect } = useNewsFeed()
    const store = useNewsStore()
    connect()

    const ws = MockWebSocket.instances[0]
    ws.simulateOpen()
    ws.simulateMessage({ type: 'status', status: 'connected' })
    ws.simulateClose()

    expect(store.connectionStatus).toBe('disconnected')
    disconnect()
  })

  it('should clean up on disconnect', () => {
    const { connect, disconnect } = useNewsFeed()
    connect()

    const ws = MockWebSocket.instances[0]
    disconnect()

    expect(ws.readyState).toBe(3)
  })
})
