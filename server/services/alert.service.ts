import { eq, isNull } from 'drizzle-orm'
import { db } from '../db'
import { alertRules, alertEvents } from '../db/schema'
import type { AlertRule } from '../../shared/types/alert'

// In-memory cache of active rules for fast evaluation
let cachedActiveRules: AlertRule[] = []

// --- Rules CRUD ---

export async function getRules(): Promise<AlertRule[]> {
  return db.select().from(alertRules).orderBy(alertRules.createdAt)
}

export async function insertRule(data: { name: string, type: 'ticker' | 'source', value: string }) {
  const [rule] = await db.insert(alertRules).values(data).returning()
  await refreshRulesCache()
  return rule
}

export async function updateRule(id: string, data: Partial<Pick<AlertRule, 'name' | 'type' | 'value' | 'enabled'>>) {
  const [rule] = await db.update(alertRules).set(data).where(eq(alertRules.id, id)).returning()
  if (!rule) return null
  await refreshRulesCache()
  return rule
}

export async function deleteRule(id: string) {
  await db.delete(alertRules).where(eq(alertRules.id, id))
  await refreshRulesCache()
}

// --- Events ---

export async function getUnreadEvents() {
  return db.select().from(alertEvents).where(isNull(alertEvents.readAt)).orderBy(alertEvents.triggeredAt)
}

export async function markEventsAsRead() {
  await db.update(alertEvents).set({ readAt: new Date() }).where(isNull(alertEvents.readAt))
}

export async function insertAlertEvent(data: {
  ruleId: string
  ruleName: string
  newsId: string
  newsTitle: string
  triggeredAt: Date
}) {
  const [event] = await db.insert(alertEvents).values(data).returning()
  return event
}

// --- Cache ---

export async function refreshRulesCache() {
  cachedActiveRules = await db
    .select().from(alertRules)
    .where(eq(alertRules.enabled, true))
    .orderBy(alertRules.createdAt)
}

export function getActiveRules(): AlertRule[] {
  return cachedActiveRules
}
