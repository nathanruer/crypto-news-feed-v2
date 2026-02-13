import type { Alert } from './alert'
import type { NewsItem } from './news'

export interface NotificationProvider {
  name: string
  send(alert: Alert, news: NewsItem): Promise<void>
}
