export interface AlertRule {
  id: string
  name: string
  type: 'keyword' | 'ticker'
  value: string
  enabled: boolean
  createdAt: Date
}

export interface Alert {
  id: string
  ruleId: string
  newsId: string
  triggeredAt: Date
}
