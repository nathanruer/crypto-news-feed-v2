import { defineWebSocketHandler } from 'h3'
import { registerPeer, unregisterPeer } from '../utils/ws-broadcast'
import type { WsClientEvent } from '../../shared/types/ws'

export default defineWebSocketHandler({
  open(peer) {
    registerPeer(peer)
    peer.send(JSON.stringify({
      type: 'status',
      status: 'connected',
    } satisfies WsClientEvent))
  },

  close(peer) {
    unregisterPeer(peer)
  },
})
