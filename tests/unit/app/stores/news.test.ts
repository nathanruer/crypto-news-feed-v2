import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNewsStore } from '../../../../app/stores/news'
import type { NewsItem } from '../../../../shared/types/news'

function createNewsItem(overrides: Partial<NewsItem> = {}): NewsItem {
  return {
    id: 'test-' + Math.random().toString(36).slice(2),
    title: 'Test news',
    body: 'Test body',
    source: 'Twitter',
    sourceName: 'BTC',
    url: 'https://example.com',
    tickers: ['BTC'],
    time: new Date(),
    receivedAt: new Date(),
    rawData: undefined,
    ...overrides,
  }
}

describe('useNewsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addNews', () => {
    it('should add a news item to the beginning of the list', () => {
      const store = useNewsStore()
      const item = createNewsItem({ id: 'first' })
      store.addNews(item)
      expect(store.items[0].id).toBe('first')
    })

    it('should prepend new items', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ id: 'old' }))
      store.addNews(createNewsItem({ id: 'new' }))
      expect(store.items[0].id).toBe('new')
      expect(store.items[1].id).toBe('old')
    })

    it('should cap at 50 items', () => {
      const store = useNewsStore()
      for (let i = 0; i < 55; i++) {
        store.addNews(createNewsItem({ id: `item-${i}` }))
      }
      expect(store.items).toHaveLength(50)
      expect(store.items[0].id).toBe('item-54')
    })

    it('should not add duplicate items with the same id', () => {
      const store = useNewsStore()
      const item = createNewsItem({ id: 'dup' })
      store.addNews(item)
      store.addNews(item)
      expect(store.items).toHaveLength(1)
    })
  })

  describe('setConnectionStatus', () => {
    it('should update connection status', () => {
      const store = useNewsStore()
      expect(store.connectionStatus).toBe('disconnected')
      store.setConnectionStatus('connected')
      expect(store.connectionStatus).toBe('connected')
    })
  })

  describe('getters', () => {
    it('should return news count', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem())
      store.addNews(createNewsItem())
      expect(store.newsCount).toBe(2)
    })

    it('should return isConnected', () => {
      const store = useNewsStore()
      expect(store.isConnected).toBe(false)
      store.setConnectionStatus('connected')
      expect(store.isConnected).toBe(true)
    })
  })
})
