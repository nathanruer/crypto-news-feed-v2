export interface NewsItem {
  id: string
  title: string
  body: string
  source: string
  sourceName: string
  url: string
  tickers: string[]
  time: Date
  receivedAt: Date
  rawData: unknown
}
