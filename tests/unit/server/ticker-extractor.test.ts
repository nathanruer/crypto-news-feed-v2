import { describe, it, expect } from 'vitest'
import { extractTickers } from '../../../server/utils/ticker-extractor'
import type { TreeOfAlphaMessage } from '../../../shared/types/ws'
import { VALID_NEWS_MESSAGE, MINIMAL_NEWS_MESSAGE } from '../../fixtures/tree-of-alpha-messages'

describe('extractTickers', () => {
  it('should extract tickers from suggestions', () => {
    const result = extractTickers(VALID_NEWS_MESSAGE)
    expect(result).toEqual(['HBAR'])
  })

  it('should return empty array when no suggestions and no symbols', () => {
    const result = extractTickers(MINIMAL_NEWS_MESSAGE)
    expect(result).toEqual([])
  })

  it('should fallback to symbols when no suggestions', () => {
    const msg: TreeOfAlphaMessage = {
      ...MINIMAL_NEWS_MESSAGE,
      symbols: ['BTC_USDT', 'BTC_ETH'],
      suggestions: [],
    }
    const result = extractTickers(msg)
    expect(result).toEqual(['BTC'])
  })

  it('should deduplicate tickers from symbols', () => {
    const msg: TreeOfAlphaMessage = {
      ...MINIMAL_NEWS_MESSAGE,
      symbols: ['ETH_USDT', 'ETH_BTC', 'ETH_BNB'],
      suggestions: [],
    }
    const result = extractTickers(msg)
    expect(result).toEqual(['ETH'])
  })

  it('should handle multiple different tickers from suggestions', () => {
    const msg: TreeOfAlphaMessage = {
      ...MINIMAL_NEWS_MESSAGE,
      suggestions: [
        { coin: 'BTC', found: ['BTC'], symbols: [], supply: 21000000 },
        { coin: 'ETH', found: ['ETH'], symbols: [], supply: 120000000 },
      ],
    }
    const result = extractTickers(msg)
    expect(result).toEqual(['BTC', 'ETH'])
  })

  it('should handle symbols without underscore separator', () => {
    const msg: TreeOfAlphaMessage = {
      ...MINIMAL_NEWS_MESSAGE,
      symbols: ['SOLUSDT'],
      suggestions: [],
    }
    const result = extractTickers(msg)
    expect(result).toEqual(['SOLUSDT'])
  })
})
