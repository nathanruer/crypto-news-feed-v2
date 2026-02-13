import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NewsItem } from '../../../shared/types/news'
import { insertNewsItem } from '../../../server/services/news.service'
import { db } from '../../../server/db'

vi.mock('../../../server/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn().mockResolvedValue([]),
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
})
