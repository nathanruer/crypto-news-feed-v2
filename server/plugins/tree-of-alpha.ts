import { TreeOfAlphaService } from '../services/tree-of-alpha'
import { broadcast } from '../utils/ws-broadcast'

const WS_URL = process.env.TREE_OF_ALPHA_WS_URL || 'wss://news.treeofalpha.com/ws'

export default defineNitroPlugin((nitro) => {
  const service = new TreeOfAlphaService(() => new WebSocket(WS_URL))

  service.onNews((message) => {
    broadcast({ type: 'news', data: message })
  })

  service.onStatusChange((status) => {
    broadcast({ type: 'status', status })
  })

  service.start()

  nitro.hooks.hook('close', () => {
    service.stop()
  })
})
