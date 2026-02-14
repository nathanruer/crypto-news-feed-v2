import { describe, it, expect } from 'vitest'
import { deserializeNewsItem } from '../../../../app/utils/deserialize-news-item'
import type { SerializedNewsItem } from '../../../../shared/types/news'

const SERIALIZED_ITEM: SerializedNewsItem = {
  id: 'test-123',
  title: 'Bitcoin hits new ATH',
  body: 'Bitcoin has reached a new all-time high today.',
  source: 'Twitter',
  sourceName: 'BTC',
  url: 'https://x.com/example/status/123',
  tickers: ['BTC'],
  time: '2025-06-15T12:00:00.000Z',
  receivedAt: '2025-06-15T12:00:01.000Z',
}

describe('deserializeNewsItem', () => {
  it('should convert time from ISO string to Date', () => {
    const result = deserializeNewsItem(SERIALIZED_ITEM)
    expect(result.time).toBeInstanceOf(Date)
    expect(result.time.toISOString()).toBe('2025-06-15T12:00:00.000Z')
  })

  it('should convert receivedAt from ISO string to Date', () => {
    const result = deserializeNewsItem(SERIALIZED_ITEM)
    expect(result.receivedAt).toBeInstanceOf(Date)
    expect(result.receivedAt.toISOString()).toBe('2025-06-15T12:00:01.000Z')
  })

  it('should pass through all other fields unchanged', () => {
    const result = deserializeNewsItem(SERIALIZED_ITEM)
    expect(result.id).toBe(SERIALIZED_ITEM.id)
    expect(result.title).toBe(SERIALIZED_ITEM.title)
    expect(result.body).toBe(SERIALIZED_ITEM.body)
    expect(result.source).toBe(SERIALIZED_ITEM.source)
    expect(result.sourceName).toBe(SERIALIZED_ITEM.sourceName)
    expect(result.url).toBe(SERIALIZED_ITEM.url)
    expect(result.tickers).toEqual(SERIALIZED_ITEM.tickers)
  })
})
