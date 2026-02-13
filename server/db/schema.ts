import { pgTable, text, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core'

export const newsItems = pgTable('news_items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  source: varchar('source', { length: 100 }).notNull(),
  sourceName: varchar('source_name', { length: 100 }).notNull(),
  url: text('url').notNull(),
  tickers: jsonb('tickers').notNull().$type<string[]>(),
  time: timestamp('time', { withTimezone: true }).notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull(),
  rawData: jsonb('raw_data').notNull(),
})
