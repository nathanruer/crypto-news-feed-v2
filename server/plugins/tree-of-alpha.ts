import { TreeOfAlphaService } from '../services/tree-of-alpha'
import { broadcast } from '../utils/ws-broadcast'
import { normalizeToNewsItem } from '../utils/normalizer'
import { insertNewsItem } from '../services/news.service'

const WS_URL = process.env.TREE_OF_ALPHA_WS_URL || 'wss://news.treeofalpha.com/ws'

export default defineNitroPlugin((nitro) => {
  const service = new TreeOfAlphaService(() => new WebSocket(WS_URL))

  service.onNews(async (message) => {
    broadcast({ type: 'news', data: message })

    const newsItem = normalizeToNewsItem(message)
    try {
      await insertNewsItem(newsItem)
    }
    catch (error) {
      console.error('[tree-of-alpha] Failed to persist news item:', newsItem.id, error)
    }
  })

  service.onStatusChange((status) => {
    broadcast({ type: 'status', status })
  })

  service.start()

  nitro.hooks.hook('close', () => {
    service.stop()
  })
})
