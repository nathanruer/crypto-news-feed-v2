import type { TreeOfAlphaMessage } from '../../shared/types/ws'

export const VALID_NEWS_MESSAGE: TreeOfAlphaMessage = {
  _id: '1770990580707HFJHCtStFoDGSC',
  title: 'HBAR: FedEx Joins Hedera Council to Support the Future of Digital Global Supply Chains',
  source: 'Blogs',
  sourceName: 'HBAR',
  url: 'https://hedera.com/blog/fedex-joins-hedera-council',
  en: 'HBAR: FedEx Joins Hedera Council to Support the Future of Digital Global Supply Chains',
  time: 1770990580710,
  symbols: ['HBAR_USDT', 'HBAR_BTC'],
  suggestions: [
    {
      coin: 'HBAR',
      found: ['HBAR', 'Hedera'],
      symbols: [
        { exchange: 'binance-futures', symbol: 'HBARUSDT' },
        { exchange: 'binance', symbol: 'HBARUSDT' },
      ],
      supply: 50000000000,
    },
  ],
  actions: [
    {
      action: 'BINFUT_HBARUSDT',
      title: 'HBARUSDT PERP',
      icon: 'https://news.treeofalpha.com/static/images/binance_icon.png',
    },
  ],
  firstPrice: { HBARUSDT: 0.09364, HBARBTC: 0.00000139 },
  delay: 5000,
}

export const MINIMAL_NEWS_MESSAGE: TreeOfAlphaMessage = {
  _id: 'minimal123',
  title: 'Bitcoin hits new ATH',
  source: 'Twitter',
  url: 'https://x.com/example/status/123',
  time: Date.now(),
  symbols: [],
  suggestions: [],
  actions: [],
  firstPrice: {},
}

export const TWEET_MESSAGE: TreeOfAlphaMessage = {
  _id: '2022332462836457512',
  title: 'Walrus (@WalrusProtocol)',
  body: 'QUICK REMINDER: @OneFootball is storing their entire football content library on Walrus.',
  type: 'direct',
  link: 'https://twitter.com/WalrusProtocol/status/2022332462836457512',
  coin: 'WAL',
  time: 1770996607573,
  symbols: [],
  suggestions: [
    {
      coin: 'WAL',
      found: ['WAL', 'walrus'],
      symbols: [
        { exchange: 'binance-futures', symbol: 'WALUSDT' },
        { exchange: 'binance', symbol: 'WALUSDT' },
      ],
      supply: 1511666667,
    },
  ],
  actions: [],
  firstPrice: {},
}

export const MALFORMED_JSON = '{ invalid json }'

export const UNKNOWN_FORMAT_MESSAGE = JSON.stringify({
  unexpected: 'format',
  no_id: true,
})
