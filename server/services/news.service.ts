import { desc } from 'drizzle-orm'
import type { NewsItem } from '../../shared/types/news'
import { db } from '../db'
import { newsItems } from '../db/schema'

interface QueryNewsParams {
  page?: number
  pageSize?: number
}

interface QueryNewsResult {
  items: NewsItem[]
  total: number
}

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

export async function queryNewsItems(
  params?: QueryNewsParams,
): Promise<QueryNewsResult> {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 50
  const offset = (page - 1) * pageSize

  const [rows, total] = await Promise.all([
    db.select()
      .from(newsItems)
      .orderBy(desc(newsItems.time))
      .limit(pageSize)
      .offset(offset),
    db.$count(newsItems),
  ])

  return { items: rows as NewsItem[], total }
}
