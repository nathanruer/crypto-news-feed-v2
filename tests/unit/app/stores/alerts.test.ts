import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAlertsStore } from '../../../../app/stores/alerts'
import type { AlertRule, AlertEvent } from '../../../../shared/types/alert'

// Mock $fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

function createRule(overrides: Partial<AlertRule> = {}): AlertRule {
  return {
    id: 'rule-' + Math.random().toString(36).slice(2, 6),
    name: 'BTC Alert',
    type: 'ticker',
    value: 'BTC',
    enabled: true,
    createdAt: new Date(),
    ...overrides,
  }
}

function createEvent(overrides: Partial<AlertEvent> = {}): AlertEvent {
  return {
    id: 'evt-' + Math.random().toString(36).slice(2, 6),
    ruleId: 'rule-1',
    ruleName: 'BTC Alert',
    newsId: 'news-1',
    newsTitle: 'Bitcoin ATH',
    triggeredAt: new Date(),
    readAt: null,
    ...overrides,
  }
}

describe('useAlertsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty rules and events', () => {
      const store = useAlertsStore()
      expect(store.rules).toEqual([])
      expect(store.unreadEvents).toEqual([])
    })

    it('should have unreadCount of 0', () => {
      const store = useAlertsStore()
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('fetchRules', () => {
    it('should fetch rules from API', async () => {
      const rules = [createRule({ id: 'r1' }), createRule({ id: 'r2' })]
      mockFetch.mockResolvedValue({ data: rules })

      const store = useAlertsStore()
      await store.fetchRules()

      expect(mockFetch).toHaveBeenCalledWith('/api/alerts')
      expect(store.rules).toEqual(rules)
    })
  })

  describe('createRule', () => {
    it('should post new rule and add to state', async () => {
      const newRule = createRule({ id: 'new-1' })
      mockFetch.mockResolvedValue({ data: newRule })

      const store = useAlertsStore()
      await store.createRule({ name: 'BTC Alert', type: 'ticker', value: 'BTC' })

      expect(mockFetch).toHaveBeenCalledWith('/api/alerts', {
        method: 'POST',
        body: { name: 'BTC Alert', type: 'ticker', value: 'BTC' },
      })
      expect(store.rules).toHaveLength(1)
    })
  })

  describe('updateRule', () => {
    it('should patch rule and update state', async () => {
      const store = useAlertsStore()
      store.rules = [createRule({ id: 'r1', enabled: true })]

      const updated = createRule({ id: 'r1', enabled: false })
      mockFetch.mockResolvedValue({ data: updated })

      await store.updateRule('r1', { enabled: false })

      expect(mockFetch).toHaveBeenCalledWith('/api/alerts/r1', {
        method: 'PATCH',
        body: { enabled: false },
      })
      expect(store.rules[0].enabled).toBe(false)
    })
  })

  describe('deleteRule', () => {
    it('should delete rule and remove from state', async () => {
      const store = useAlertsStore()
      store.rules = [createRule({ id: 'r1' }), createRule({ id: 'r2' })]
      mockFetch.mockResolvedValue({ data: null })

      await store.deleteRule('r1')

      expect(mockFetch).toHaveBeenCalledWith('/api/alerts/r1', { method: 'DELETE' })
      expect(store.rules).toHaveLength(1)
      expect(store.rules[0].id).toBe('r2')
    })
  })

  describe('fetchUnreadEvents', () => {
    it('should fetch unread events from API', async () => {
      const events = [createEvent()]
      mockFetch.mockResolvedValue({ data: events })

      const store = useAlertsStore()
      await store.fetchUnreadEvents()

      expect(mockFetch).toHaveBeenCalledWith('/api/alerts/events')
      expect(store.unreadEvents).toEqual(events)
    })
  })

  describe('markAsRead', () => {
    it('should post read and clear unread events', async () => {
      const store = useAlertsStore()
      store.unreadEvents = [createEvent()]
      mockFetch.mockResolvedValue({ data: null })

      await store.markAsRead()

      expect(mockFetch).toHaveBeenCalledWith('/api/alerts/events/read', { method: 'POST' })
      expect(store.unreadEvents).toEqual([])
    })
  })

  describe('addAlertEvent', () => {
    it('should add event to unread list', () => {
      const store = useAlertsStore()
      const event = createEvent()
      store.addAlertEvent(event)
      expect(store.unreadEvents).toHaveLength(1)
    })

    it('should increment unreadCount', () => {
      const store = useAlertsStore()
      store.addAlertEvent(createEvent())
      store.addAlertEvent(createEvent())
      expect(store.unreadCount).toBe(2)
    })
  })

  describe('unreadCount', () => {
    it('should count unread events', () => {
      const store = useAlertsStore()
      store.unreadEvents = [createEvent(), createEvent()]
      expect(store.unreadCount).toBe(2)
    })

    it('should return 0 when no events', () => {
      const store = useAlertsStore()
      expect(store.unreadCount).toBe(0)
    })
  })
})
