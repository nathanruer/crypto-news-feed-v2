import type { TreeOfAlphaMessage } from '../../shared/types/ws'

export function extractTickers(message: TreeOfAlphaMessage): string[] {
  if (message.suggestions && message.suggestions.length > 0) {
    return message.suggestions.map(s => s.coin)
  }

  if (message.symbols && message.symbols.length > 0) {
    const tickers = message.symbols.map((s) => {
      const parts = s.split('_')
      return parts.length > 1 ? parts[0] : s
    })
    return [...new Set(tickers)]
  }

  return []
}
