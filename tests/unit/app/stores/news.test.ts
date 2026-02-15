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

  describe('availableSources', () => {
    it('should return unique sources sorted alphabetically', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ source: 'Twitter' }))
      store.addNews(createNewsItem({ source: 'Binance' }))
      store.addNews(createNewsItem({ source: 'Twitter' }))
      expect(store.availableSources).toEqual(['Binance', 'Twitter'])
    })

    it('should return empty array when no items', () => {
      const store = useNewsStore()
      expect(store.availableSources).toEqual([])
    })
  })

  describe('availableTickers', () => {
    it('should return unique tickers sorted alphabetically', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ tickers: ['ETH', 'BTC'] }))
      store.addNews(createNewsItem({ tickers: ['BTC', 'SOL'] }))
      expect(store.availableTickers).toEqual(['BTC', 'ETH', 'SOL'])
    })

    it('should return empty array when no items have tickers', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ tickers: [] }))
      expect(store.availableTickers).toEqual([])
    })
  })

  describe('toggleSource', () => {
    it('should add source when not selected', () => {
      const store = useNewsStore()
      store.toggleSource('Twitter')
      expect(store.selectedSources.has('Twitter')).toBe(true)
    })

    it('should remove source when already selected', () => {
      const store = useNewsStore()
      store.toggleSource('Twitter')
      store.toggleSource('Twitter')
      expect(store.selectedSources.has('Twitter')).toBe(false)
    })
  })

  describe('toggleTicker', () => {
    it('should add ticker when not selected', () => {
      const store = useNewsStore()
      store.toggleTicker('BTC')
      expect(store.selectedTickers.has('BTC')).toBe(true)
    })

    it('should remove ticker when already selected', () => {
      const store = useNewsStore()
      store.toggleTicker('BTC')
      store.toggleTicker('BTC')
      expect(store.selectedTickers.has('BTC')).toBe(false)
    })
  })

  describe('clearFilters', () => {
    it('should clear both selected sources and tickers', () => {
      const store = useNewsStore()
      store.toggleSource('Twitter')
      store.toggleTicker('BTC')
      store.clearFilters()
      expect(store.selectedSources.size).toBe(0)
      expect(store.selectedTickers.size).toBe(0)
    })
  })

  describe('filteredItems', () => {
    it('should return all items when no filters active', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ source: 'Twitter' }))
      store.addNews(createNewsItem({ source: 'Binance' }))
      expect(store.filteredItems).toHaveLength(2)
    })

    it('should filter by selected source', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ id: 'tw', source: 'Twitter' }))
      store.addNews(createNewsItem({ id: 'bn', source: 'Binance' }))
      store.toggleSource('Twitter')
      expect(store.filteredItems).toHaveLength(1)
      expect(store.filteredItems[0].id).toBe('tw')
    })

    it('should OR multiple sources', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ id: 'tw', source: 'Twitter' }))
      store.addNews(createNewsItem({ id: 'bn', source: 'Binance' }))
      store.addNews(createNewsItem({ id: 'bg', source: 'Blog' }))
      store.toggleSource('Twitter')
      store.toggleSource('Binance')
      expect(store.filteredItems).toHaveLength(2)
    })

    it('should filter by selected ticker', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ id: 'btc', tickers: ['BTC'] }))
      store.addNews(createNewsItem({ id: 'eth', tickers: ['ETH'] }))
      store.toggleTicker('BTC')
      expect(store.filteredItems).toHaveLength(1)
      expect(store.filteredItems[0].id).toBe('btc')
    })

    it('should OR multiple tickers', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ id: 'btc', tickers: ['BTC'] }))
      store.addNews(createNewsItem({ id: 'eth', tickers: ['ETH'] }))
      store.addNews(createNewsItem({ id: 'sol', tickers: ['SOL'] }))
      store.toggleTicker('BTC')
      store.toggleTicker('ETH')
      expect(store.filteredItems).toHaveLength(2)
    })

    it('should AND source and ticker filters', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ id: 'tw-btc', source: 'Twitter', tickers: ['BTC'] }))
      store.addNews(createNewsItem({ id: 'tw-eth', source: 'Twitter', tickers: ['ETH'] }))
      store.addNews(createNewsItem({ id: 'bn-btc', source: 'Binance', tickers: ['BTC'] }))
      store.toggleSource('Twitter')
      store.toggleTicker('BTC')
      expect(store.filteredItems).toHaveLength(1)
      expect(store.filteredItems[0].id).toBe('tw-btc')
    })

    it('should return empty when no items match', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ source: 'Twitter', tickers: ['BTC'] }))
      store.toggleSource('Binance')
      expect(store.filteredItems).toHaveLength(0)
    })
  })

  describe('hasActiveFilters', () => {
    it('should return false when no filters selected', () => {
      const store = useNewsStore()
      expect(store.hasActiveFilters).toBe(false)
    })

    it('should return true when sources selected', () => {
      const store = useNewsStore()
      store.toggleSource('Twitter')
      expect(store.hasActiveFilters).toBe(true)
    })

    it('should return true when tickers selected', () => {
      const store = useNewsStore()
      store.toggleTicker('BTC')
      expect(store.hasActiveFilters).toBe(true)
    })
  })

  describe('filteredCount', () => {
    it('should equal items length when no filters', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem())
      store.addNews(createNewsItem())
      expect(store.filteredCount).toBe(2)
    })

    it('should equal filtered items count when filters active', () => {
      const store = useNewsStore()
      store.addNews(createNewsItem({ source: 'Twitter' }))
      store.addNews(createNewsItem({ source: 'Binance' }))
      store.toggleSource('Twitter')
      expect(store.filteredCount).toBe(1)
    })
  })
})
