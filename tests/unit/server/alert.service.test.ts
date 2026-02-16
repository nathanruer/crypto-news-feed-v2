import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '../../../server/db'

vi.mock('../../../server/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const SAMPLE_RULE_ROW = {
  id: 'uuid-1',
  name: 'BTC Alert',
  type: 'ticker' as const,
  value: 'BTC',
  enabled: true,
  createdAt: new Date('2025-01-01'),
}

const SAMPLE_EVENT_ROW = {
  id: 'evt-1',
  ruleId: 'uuid-1',
  ruleName: 'BTC Alert',
  newsId: 'news-1',
  newsTitle: 'Bitcoin ATH',
  triggeredAt: new Date('2025-01-01'),
  readAt: null,
}

function mockSelectChain(rows: unknown[]) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue(rows),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(db.select).mockReturnValue(chain as any)
  return chain
}

function mockInsertChain(rows: unknown[]) {
  const chain = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(rows),
    onConflictDoNothing: vi.fn().mockResolvedValue(rows),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(db.insert).mockReturnValue(chain as any)
  return chain
}

function mockUpdateChain(rows: unknown[]) {
  const chain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(rows),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(db.update).mockReturnValue(chain as any)
  return chain
}

function mockDeleteChain() {
  const chain = {
    where: vi.fn().mockResolvedValue([]),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(db.delete).mockReturnValue(chain as any)
  return chain
}

describe('alert.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module to clear cache between tests
    vi.resetModules()
  })

  describe('getRules', () => {
    it('should return all rules from database', async () => {
      mockSelectChain([SAMPLE_RULE_ROW])
      const { getRules } = await import('../../../server/services/alert.service')
      const rules = await getRules()
      expect(rules).toEqual([SAMPLE_RULE_ROW])
      expect(db.select).toHaveBeenCalledOnce()
    })
  })

  describe('insertRule', () => {
    it('should insert and return the new rule', async () => {
      mockInsertChain([SAMPLE_RULE_ROW])
      // Mock select for cache refresh
      mockSelectChain([SAMPLE_RULE_ROW])
      const { insertRule } = await import('../../../server/services/alert.service')
      const rule = await insertRule({ name: 'BTC Alert', type: 'ticker', value: 'BTC' })
      expect(rule).toEqual(SAMPLE_RULE_ROW)
      expect(db.insert).toHaveBeenCalledOnce()
    })
  })

  describe('updateRule', () => {
    it('should update and return the modified rule', async () => {
      const updated = { ...SAMPLE_RULE_ROW, enabled: false }
      mockUpdateChain([updated])
      mockSelectChain([updated])
      const { updateRule } = await import('../../../server/services/alert.service')
      const rule = await updateRule('uuid-1', { enabled: false })
      expect(rule).toEqual(updated)
      expect(db.update).toHaveBeenCalledOnce()
    })

    it('should return null when rule not found', async () => {
      mockUpdateChain([])
      const { updateRule } = await import('../../../server/services/alert.service')
      const rule = await updateRule('nonexistent', { enabled: false })
      expect(rule).toBeNull()
    })
  })

  describe('deleteRule', () => {
    it('should delete the rule from database', async () => {
      mockDeleteChain()
      mockSelectChain([])
      const { deleteRule } = await import('../../../server/services/alert.service')
      await deleteRule('uuid-1')
      expect(db.delete).toHaveBeenCalledOnce()
    })
  })

  describe('getUnreadEvents', () => {
    it('should return unread events', async () => {
      mockSelectChain([SAMPLE_EVENT_ROW])
      const { getUnreadEvents } = await import('../../../server/services/alert.service')
      const events = await getUnreadEvents()
      expect(events).toEqual([SAMPLE_EVENT_ROW])
    })
  })

  describe('markEventsAsRead', () => {
    it('should update unread events with readAt timestamp', async () => {
      mockUpdateChain([])
      const { markEventsAsRead } = await import('../../../server/services/alert.service')
      await markEventsAsRead()
      expect(db.update).toHaveBeenCalledOnce()
    })
  })

  describe('insertAlertEvent', () => {
    it('should insert and return the event', async () => {
      mockInsertChain([SAMPLE_EVENT_ROW])
      const { insertAlertEvent } = await import('../../../server/services/alert.service')
      const event = await insertAlertEvent({
        ruleId: 'uuid-1',
        ruleName: 'BTC Alert',
        newsId: 'news-1',
        newsTitle: 'Bitcoin ATH',
        triggeredAt: new Date(),
      })
      expect(event).toEqual(SAMPLE_EVENT_ROW)
    })
  })

  describe('getActiveRules (cache)', () => {
    it('should return cached rules after refreshCache', async () => {
      mockSelectChain([SAMPLE_RULE_ROW])
      const { refreshRulesCache, getActiveRules } = await import('../../../server/services/alert.service')
      await refreshRulesCache()
      const cached = getActiveRules()
      expect(cached).toEqual([SAMPLE_RULE_ROW])
    })

    it('should return empty array before cache is loaded', async () => {
      const { getActiveRules } = await import('../../../server/services/alert.service')
      expect(getActiveRules()).toEqual([])
    })

    it('should refresh cache after insertRule', async () => {
      mockInsertChain([SAMPLE_RULE_ROW])
      const enabledRule = { ...SAMPLE_RULE_ROW, enabled: true }
      mockSelectChain([enabledRule])
      const { insertRule, getActiveRules } = await import('../../../server/services/alert.service')
      await insertRule({ name: 'BTC Alert', type: 'ticker', value: 'BTC' })
      expect(getActiveRules()).toEqual([enabledRule])
    })
  })
})
