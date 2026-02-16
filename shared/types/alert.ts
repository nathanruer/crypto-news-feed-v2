export interface AlertRule {
  id: string
  name: string
  type: 'ticker' | 'source'
  value: string
  enabled: boolean
  createdAt: Date
}

export interface SerializedAlertRule {
  id: string
  name: string
  type: 'ticker' | 'source'
  value: string
  enabled: boolean
  createdAt: string
}

export interface AlertEvent {
  id: string
  ruleId: string
  ruleName: string
  newsId: string
  newsTitle: string
  triggeredAt: Date
  readAt: Date | null
}

export interface SerializedAlertEvent {
  id: string
  ruleId: string
  ruleName: string
  newsId: string
  newsTitle: string
  triggeredAt: string
  readAt: string | null
}
