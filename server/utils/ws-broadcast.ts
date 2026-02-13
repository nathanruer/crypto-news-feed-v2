import type { Peer } from 'crossws'
import type { WsClientEvent } from '../../shared/types/ws'

const peers = new Set<Peer>()

export function registerPeer(peer: Peer) {
  peers.add(peer)
}

export function unregisterPeer(peer: Peer) {
  peers.delete(peer)
}

export function broadcast(event: WsClientEvent) {
  const payload = JSON.stringify(event)
  for (const peer of peers) {
    peer.send(payload)
  }
}

export function connectedPeersCount(): number {
  return peers.size
}
