import { describe, it, expect, vi, afterEach } from 'vitest'
import { normalizeToNewsItem } from '../../../server/utils/normalizer'
import { VALID_NEWS_MESSAGE, MINIMAL_NEWS_MESSAGE } from '../../fixtures/tree-of-alpha-messages'

describe('normalizeToNewsItem', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should map _id to id', () => {
    const result = normalizeToNewsItem(VALID_NEWS_MESSAGE)
    expect(result.id).toBe(VALID_NEWS_MESSAGE._id)
  })

  it('should map title directly', () => {
    const result = normalizeToNewsItem(VALID_NEWS_MESSAGE)
    expect(result.title).toBe(VALID_NEWS_MESSAGE.title)
  })

  it('should map en field to body', () => {
    const result = normalizeToNewsItem(VALID_NEWS_MESSAGE)
    expect(result.body).toBe(VALID_NEWS_MESSAGE.en)
  })

  it('should map source and sourceName directly', () => {
    const result = normalizeToNewsItem(VALID_NEWS_MESSAGE)
    expect(result.source).toBe(VALID_NEWS_MESSAGE.source)
    expect(result.sourceName).toBe(VALID_NEWS_MESSAGE.sourceName)
  })

  it('should map url directly', () => {
    const result = normalizeToNewsItem(VALID_NEWS_MESSAGE)
    expect(result.url).toBe(VALID_NEWS_MESSAGE.url)
  })

  it('should convert time from epoch ms to Date', () => {
    const result = normalizeToNewsItem(VALID_NEWS_MESSAGE)
    expect(result.time).toBeInstanceOf(Date)
    expect(result.time.getTime()).toBe(VALID_NEWS_MESSAGE.time)
  })

  it('should set receivedAt to current time', () => {
    vi.useFakeTimers()
    const now = new Date('2025-06-15T12:00:00Z')
    vi.setSystemTime(now)

    const result = normalizeToNewsItem(VALID_NEWS_MESSAGE)
    expect(result.receivedAt).toBeInstanceOf(Date)
    expect(result.receivedAt.getTime()).toBe(now.getTime())
  })

  it('should extract tickers from suggestions', () => {
    const result = normalizeToNewsItem(VALID_NEWS_MESSAGE)
    expect(result.tickers).toEqual(['HBAR'])
  })

  it('should return empty tickers when no suggestions and no symbols', () => {
    const result = normalizeToNewsItem(MINIMAL_NEWS_MESSAGE)
    expect(result.tickers).toEqual([])
  })

  it('should store the original message as rawData', () => {
    const result = normalizeToNewsItem(VALID_NEWS_MESSAGE)
    expect(result.rawData).toEqual(VALID_NEWS_MESSAGE)
  })
})
