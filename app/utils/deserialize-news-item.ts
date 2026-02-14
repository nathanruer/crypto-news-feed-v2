import type { NewsItem, SerializedNewsItem } from '../../shared/types/news'

export function deserializeNewsItem(raw: SerializedNewsItem): NewsItem {
  return {
    ...raw,
    time: new Date(raw.time),
    receivedAt: new Date(raw.receivedAt),
    rawData: undefined,
  }
}
