export interface NewsItem {
  id: string
  title: string
  body: string
  source: string
  url: string
  tickers: string[]
  receivedAt: Date
  originalData: unknown
}
