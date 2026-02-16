import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NewsItem } from '../../../shared/types/news'
import { insertNewsItem, queryNewsItems } from '../../../server/services/news.service'
import { db } from '../../../server/db'

vi.mock('../../../server/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn().mockResolvedValue([]),
    select: vi.fn(),
    $count: vi.fn(),
  },
}))

const SAMPLE_NEWS_ITEM: NewsItem = {
  id: 'test-123',
  title: 'Bitcoin hits new ATH',
  body: 'Bitcoin has reached a new all-time high today.',
  source: 'Twitter',
  sourceName: 'BTC',
  url: 'https://x.com/example/status/123',
  tickers: ['BTC'],
  time: new Date('2025-06-15T12:00:00Z'),
  receivedAt: new Date('2025-06-15T12:00:01Z'),
  rawData: { _id: 'test-123', title: 'Bitcoin hits new ATH' },
}

describe('news.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('insertNewsItem', () => {
    it('should insert a news item into the database', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockResolvedValue([]),
        }),
      })
      vi.mocked(db.insert).mockImplementation(mockInsert)

      await insertNewsItem(SAMPLE_NEWS_ITEM)

      expect(mockInsert).toHaveBeenCalledOnce()
    })

    it('should pass the correct values to the insert', async () => {
      const mockOnConflict = vi.fn().mockResolvedValue([])
      const mockValues = vi.fn().mockReturnValue({
        onConflictDoNothing: mockOnConflict,
      })
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
      vi.mocked(db.insert).mockImplementation(mockInsert)

      await insertNewsItem(SAMPLE_NEWS_ITEM)

      expect(mockValues).toHaveBeenCalledWith({
        id: SAMPLE_NEWS_ITEM.id,
        title: SAMPLE_NEWS_ITEM.title,
        body: SAMPLE_NEWS_ITEM.body,
        source: SAMPLE_NEWS_ITEM.source,
        sourceName: SAMPLE_NEWS_ITEM.sourceName,
        url: SAMPLE_NEWS_ITEM.url,
        tickers: SAMPLE_NEWS_ITEM.tickers,
        time: SAMPLE_NEWS_ITEM.time,
        receivedAt: SAMPLE_NEWS_ITEM.receivedAt,
        rawData: SAMPLE_NEWS_ITEM.rawData,
      })
    })

    it('should use onConflictDoNothing to handle duplicates', async () => {
      const mockOnConflict = vi.fn().mockResolvedValue([])
      const mockValues = vi.fn().mockReturnValue({
        onConflictDoNothing: mockOnConflict,
      })
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
      vi.mocked(db.insert).mockImplementation(mockInsert)

      await insertNewsItem(SAMPLE_NEWS_ITEM)

      expect(mockOnConflict).toHaveBeenCalledOnce()
    })

    it('should not throw when a duplicate is inserted', async () => {
      const mockOnConflict = vi.fn().mockResolvedValue([])
      const mockValues = vi.fn().mockReturnValue({
        onConflictDoNothing: mockOnConflict,
      })
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
      vi.mocked(db.insert).mockImplementation(mockInsert)

      await expect(insertNewsItem(SAMPLE_NEWS_ITEM)).resolves.not.toThrow()
    })
  })

  describe('queryNewsItems', () => {
    const DB_ROW = {
      id: 'news-1',
      title: 'Bitcoin hits ATH',
      body: 'Bitcoin reached a new all-time high.',
      source: 'CoinDesk',
      sourceName: 'CoinDesk',
      url: 'https://example.com/1',
      tickers: ['BTC'],
      time: new Date('2025-06-01T12:00:00Z'),
      receivedAt: new Date('2025-06-01T12:00:01Z'),
      rawData: {},
    }

    function mockSelectChain(rows: unknown[]) {
      const chain = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(rows),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(db.select).mockReturnValue(chain as any)
      return chain
    }

    it('should query with default page=1 and pageSize=50', async () => {
      const chain = mockSelectChain([DB_ROW])
      vi.mocked(db.$count).mockResolvedValue(1)

      const result = await queryNewsItems()

      expect(chain.limit).toHaveBeenCalledWith(50)
      expect(chain.offset).toHaveBeenCalledWith(0)
      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should apply correct offset for page 2', async () => {
      const chain = mockSelectChain([])
      vi.mocked(db.$count).mockResolvedValue(75)

      const result = await queryNewsItems({ page: 2, pageSize: 50 })

      expect(chain.limit).toHaveBeenCalledWith(50)
      expect(chain.offset).toHaveBeenCalledWith(50)
      expect(result.total).toBe(75)
    })

    it('should respect custom pageSize', async () => {
      const chain = mockSelectChain([DB_ROW])
      vi.mocked(db.$count).mockResolvedValue(10)

      await queryNewsItems({ page: 1, pageSize: 10 })

      expect(chain.limit).toHaveBeenCalledWith(10)
    })

    it('should return total count', async () => {
      mockSelectChain([])
      vi.mocked(db.$count).mockResolvedValue(420)

      const result = await queryNewsItems()

      expect(result.total).toBe(420)
      expect(result.items).toHaveLength(0)
    })

    it('should map DB rows to NewsItem format', async () => {
      mockSelectChain([DB_ROW])
      vi.mocked(db.$count).mockResolvedValue(1)

      const result = await queryNewsItems()

      expect(result.items[0]).toEqual(DB_ROW)
    })
  })
})
