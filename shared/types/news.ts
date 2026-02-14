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

/** NewsItem as received over JSON (dates are ISO strings) */
export interface SerializedNewsItem {
  id: string
  title: string
  body: string
  source: string
  sourceName: string
  url: string
  tickers: string[]
  time: string
  receivedAt: string
}
