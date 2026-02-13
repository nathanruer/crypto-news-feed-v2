import type { NewsItem } from '../../shared/types/news'
import { db } from '../db'
import { newsItems } from '../db/schema'

export async function insertNewsItem(item: NewsItem): Promise<void> {
  await db
    .insert(newsItems)
    .values({
      id: item.id,
      title: item.title,
      body: item.body,
      source: item.source,
      sourceName: item.sourceName,
      url: item.url,
      tickers: item.tickers,
      time: item.time,
      receivedAt: item.receivedAt,
      rawData: item.rawData,
    })
    .onConflictDoNothing()
}
