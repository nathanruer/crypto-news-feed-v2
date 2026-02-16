import { pgTable, text, timestamp, jsonb, varchar, uuid, boolean } from 'drizzle-orm/pg-core'

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

export const alertRules = pgTable('alert_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull().$type<'ticker' | 'source'>(),
  value: varchar('value', { length: 100 }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const alertEvents = pgTable('alert_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  ruleId: uuid('rule_id').notNull().references(() => alertRules.id, { onDelete: 'cascade' }),
  ruleName: varchar('rule_name', { length: 100 }).notNull(),
  newsId: text('news_id').notNull(),
  newsTitle: text('news_title').notNull(),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp('read_at', { withTimezone: true }),
})
