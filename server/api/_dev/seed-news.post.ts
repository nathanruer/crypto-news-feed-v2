import { broadcast, connectedPeersCount } from '../../utils/ws-broadcast'
import { evaluateNewsAgainstRules } from '../../utils/alert-evaluation'
import { getActiveRules, insertAlertEvent } from '../../services/alert.service'
import type { NewsItem } from '../../../shared/types/news'

const SOURCES = ['Twitter', 'Blog', 'Binance', 'CoinDesk', 'The Block']
const TICKERS = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK']
const HEADLINES = [
  'Bitcoin surges past $100K as institutional demand grows',
  'Ethereum ETF sees record inflows',
  'SEC approves new crypto regulation framework',
  'Solana TVL reaches all-time high',
  'Major exchange lists new memecoin',
  'DeFi protocol exploited for $50M',
  'Central bank announces CBDC pilot program',
  'Whale moves 10,000 BTC to cold storage',
]

export default defineEventHandler(async () => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 404 })
  }

  const source = SOURCES[Math.floor(Math.random() * SOURCES.length)]
  const title = HEADLINES[Math.floor(Math.random() * HEADLINES.length)]
  const tickers = TICKERS.filter(() => Math.random() > 0.7)
  if (tickers.length === 0) tickers.push('BTC')

  const newsItem: NewsItem = {
    id: `dev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    body: `${title}. This is a dev-seeded news item for testing the real-time feed.`,
    source,
    sourceName: source,
    url: 'https://example.com/dev-news',
    tickers,
    time: new Date(),
    receivedAt: new Date(),
    rawData: undefined,
  }

  const peers = connectedPeersCount()
  broadcast({ type: 'news', data: newsItem })

  // Evaluate alert rules and broadcast matches
  const matches = evaluateNewsAgainstRules(newsItem, getActiveRules())
  for (const match of matches) {
    const event = await insertAlertEvent(match)
    if (event) broadcast({ type: 'alert', data: event })
  }

  return { ok: true, peers, id: newsItem.id, title: newsItem.title, alerts: matches.length }
})
