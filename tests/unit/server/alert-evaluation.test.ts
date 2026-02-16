import { describe, it, expect } from 'vitest'
import { evaluateNewsAgainstRules } from '../../../server/utils/alert-evaluation'
import type { NewsItem } from '../../../shared/types/news'
import type { AlertRule } from '../../../shared/types/alert'

function createNewsItem(overrides: Partial<NewsItem> = {}): NewsItem {
  return {
    id: 'news-1',
    title: 'Bitcoin hits new ATH',
    body: 'BTC surpasses $100k',
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

function createRule(overrides: Partial<AlertRule> = {}): AlertRule {
  return {
    id: 'rule-1',
    name: 'BTC Alert',
    type: 'ticker',
    value: 'BTC',
    enabled: true,
    createdAt: new Date(),
    ...overrides,
  }
}

describe('evaluateNewsAgainstRules', () => {
  it('should return empty array when no rules', () => {
    const news = createNewsItem()
    expect(evaluateNewsAgainstRules(news, [])).toEqual([])
  })

  it('should match ticker rule when news contains the ticker', () => {
    const news = createNewsItem({ tickers: ['BTC', 'ETH'] })
    const rules = [createRule({ type: 'ticker', value: 'BTC' })]
    const matches = evaluateNewsAgainstRules(news, rules)
    expect(matches).toHaveLength(1)
    expect(matches[0].ruleId).toBe('rule-1')
    expect(matches[0].newsId).toBe('news-1')
    expect(matches[0].ruleName).toBe('BTC Alert')
    expect(matches[0].newsTitle).toBe('Bitcoin hits new ATH')
  })

  it('should not match ticker rule when news does not contain the ticker', () => {
    const news = createNewsItem({ tickers: ['ETH'] })
    const rules = [createRule({ type: 'ticker', value: 'BTC' })]
    expect(evaluateNewsAgainstRules(news, rules)).toEqual([])
  })

  it('should match source rule when news source matches', () => {
    const news = createNewsItem({ source: 'Binance' })
    const rules = [createRule({ type: 'source', value: 'Binance', name: 'Binance Alert' })]
    const matches = evaluateNewsAgainstRules(news, rules)
    expect(matches).toHaveLength(1)
    expect(matches[0].ruleId).toBe('rule-1')
  })

  it('should not match source rule when source differs', () => {
    const news = createNewsItem({ source: 'Twitter' })
    const rules = [createRule({ type: 'source', value: 'Binance' })]
    expect(evaluateNewsAgainstRules(news, rules)).toEqual([])
  })

  it('should match source case-insensitively', () => {
    const news = createNewsItem({ source: 'binance' })
    const rules = [createRule({ type: 'source', value: 'Binance' })]
    expect(evaluateNewsAgainstRules(news, rules)).toHaveLength(1)
  })

  it('should match ticker case-insensitively', () => {
    const news = createNewsItem({ tickers: ['btc'] })
    const rules = [createRule({ type: 'ticker', value: 'BTC' })]
    expect(evaluateNewsAgainstRules(news, rules)).toHaveLength(1)
  })

  it('should skip disabled rules', () => {
    const news = createNewsItem({ tickers: ['BTC'] })
    const rules = [createRule({ enabled: false })]
    expect(evaluateNewsAgainstRules(news, rules)).toEqual([])
  })

  it('should match multiple rules against same news', () => {
    const news = createNewsItem({ tickers: ['BTC'], source: 'Binance' })
    const rules = [
      createRule({ id: 'r1', type: 'ticker', value: 'BTC', name: 'BTC Alert' }),
      createRule({ id: 'r2', type: 'source', value: 'Binance', name: 'Binance Alert' }),
    ]
    const matches = evaluateNewsAgainstRules(news, rules)
    expect(matches).toHaveLength(2)
    expect(matches.map(m => m.ruleId)).toEqual(['r1', 'r2'])
  })

  it('should not duplicate matches for same rule', () => {
    const news = createNewsItem({ tickers: ['BTC'] })
    const rules = [createRule()]
    const matches = evaluateNewsAgainstRules(news, rules)
    expect(matches).toHaveLength(1)
  })

  it('should include triggeredAt timestamp in matches', () => {
    const news = createNewsItem()
    const rules = [createRule()]
    const matches = evaluateNewsAgainstRules(news, rules)
    expect(matches[0].triggeredAt).toBeInstanceOf(Date)
  })
})
