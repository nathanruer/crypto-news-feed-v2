import type { TreeOfAlphaMessage } from '../../shared/types/ws'
import type { NewsItem } from '../../shared/types/news'
import { extractTickers } from './ticker-extractor'

export function normalizeToNewsItem(message: TreeOfAlphaMessage): NewsItem {
  return {
    id: message._id,
    title: message.title,
    body: message.en,
    source: message.source,
    sourceName: message.sourceName,
    url: message.url,
    tickers: extractTickers(message),
    time: new Date(message.time),
    receivedAt: new Date(),
    rawData: message,
  }
}
