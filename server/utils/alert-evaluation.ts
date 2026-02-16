import type { AlertRule } from '../../shared/types/alert'
import type { NewsItem } from '../../shared/types/news'

export interface AlertMatch {
  ruleId: string
  ruleName: string
  newsId: string
  newsTitle: string
  triggeredAt: Date
}

/** Evaluate a news item against a list of alert rules. Returns matches (OR across rules). */
export function evaluateNewsAgainstRules(news: NewsItem, rules: AlertRule[]): AlertMatch[] {
  const now = new Date()
  const matches: AlertMatch[] = []

  for (const rule of rules) {
    if (!rule.enabled) continue
    if (!matchesRule(news, rule)) continue
    matches.push({
      ruleId: rule.id,
      ruleName: rule.name,
      newsId: news.id,
      newsTitle: news.title,
      triggeredAt: now,
    })
  }

  return matches
}

function matchesRule(news: NewsItem, rule: AlertRule): boolean {
  if (rule.type === 'ticker') {
    return news.tickers.some(t => t.toLowerCase() === rule.value.toLowerCase())
  }
  if (rule.type === 'source') {
    return news.source.toLowerCase() === rule.value.toLowerCase()
  }
  return false
}
