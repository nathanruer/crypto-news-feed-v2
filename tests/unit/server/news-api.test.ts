import { describe, it, expect, vi, beforeEach } from 'vitest'
import { queryNewsItems } from '../../../server/services/news.service'

vi.mock('../../../server/services/news.service', () => ({
  queryNewsItems: vi.fn(),
}))

const SAMPLE_ITEMS = [
  {
    id: 'news-1',
    title: 'BTC ATH',
    body: 'Bitcoin hit ATH',
    source: 'CoinDesk',
    sourceName: 'CoinDesk',
    url: 'https://example.com/1',
    tickers: ['BTC'],
    time: new Date('2025-06-01T12:00:00Z'),
    receivedAt: new Date('2025-06-01T12:00:01Z'),
    rawData: {},
  },
]

/**
 * Extracted handler logic matching server/api/news/index.get.ts
 * We test the pure logic to avoid Nuxt auto-import issues.
 */
async function handleGetNews(query: Record<string, string | undefined>) {
  const page = query.page !== undefined ? Number(query.page) : 1
  const pageSize = query.pageSize !== undefined ? Number(query.pageSize) : 50

  if (!Number.isInteger(page) || page < 1) {
    throw new Error('page must be >= 1')
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new Error('pageSize must be between 1 and 100')
  }

  const result = await queryNewsItems({ page, pageSize })
  return {
    data: result.items,
    meta: { total: result.total, page, pageSize },
  }
}

describe('GET /api/news', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return paginated news with default params', async () => {
    vi.mocked(queryNewsItems).mockResolvedValue({
      items: SAMPLE_ITEMS,
      total: 1,
    })

    const result = await handleGetNews({})

    expect(queryNewsItems).toHaveBeenCalledWith({
      page: 1,
      pageSize: 50,
    })
    expect(result).toEqual({
      data: SAMPLE_ITEMS,
      meta: { total: 1, page: 1, pageSize: 50 },
    })
  })

  it('should parse custom page and pageSize', async () => {
    vi.mocked(queryNewsItems).mockResolvedValue({
      items: [],
      total: 100,
    })

    const result = await handleGetNews({ page: '2', pageSize: '25' })

    expect(queryNewsItems).toHaveBeenCalledWith({
      page: 2,
      pageSize: 25,
    })
    expect(result.meta).toEqual({
      total: 100,
      page: 2,
      pageSize: 25,
    })
  })

  it('should throw for page < 1', async () => {
    await expect(handleGetNews({ page: '0' }))
      .rejects.toThrow('page must be >= 1')
  })

  it('should throw for pageSize > 100', async () => {
    await expect(handleGetNews({ pageSize: '200' }))
      .rejects.toThrow('pageSize must be between 1 and 100')
  })

  it('should throw for pageSize < 1', async () => {
    await expect(handleGetNews({ pageSize: '0' }))
      .rejects.toThrow('pageSize must be between 1 and 100')
  })
})
