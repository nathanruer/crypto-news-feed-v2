import { TreeOfAlphaService } from '../services/tree-of-alpha'
import { broadcast } from '../utils/ws-broadcast'
import { normalizeToNewsItem } from '../utils/normalizer'
import { insertNewsItem } from '../services/news.service'
import { evaluateNewsAgainstRules } from '../utils/alert-evaluation'
import { getActiveRules, insertAlertEvent, refreshRulesCache } from '../services/alert.service'
import { logger } from '../utils/logger'

const WS_URL = process.env.TREE_OF_ALPHA_WS_URL || 'wss://news.treeofalpha.com/ws'

export default defineNitroPlugin(async (nitro) => {
  // Load alert rules cache on startup
  try {
    await refreshRulesCache()
  }
  catch {
    logger.error('Failed to load alert rules cache')
  }

  const service = new TreeOfAlphaService(() => new WebSocket(WS_URL))

  service.onNews(async (message) => {
    const newsItem = normalizeToNewsItem(message)
    broadcast({ type: 'news', data: newsItem })

    try {
      await insertNewsItem(newsItem)
    }
    catch (error) {
      logger.error({ newsId: newsItem.id, error }, 'Failed to persist news item')
    }

    // Evaluate alert rules and broadcast matches
    try {
      const matches = evaluateNewsAgainstRules(newsItem, getActiveRules())
      for (const match of matches) {
        const event = await insertAlertEvent(match)
        if (event) broadcast({ type: 'alert', data: event })
      }
    }
    catch (error) {
      logger.error({ newsId: newsItem.id, error }, 'Failed to evaluate alerts')
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
