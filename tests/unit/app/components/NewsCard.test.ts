import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsCard from '../../../../app/components/domain/news/NewsCard.vue'
import type { NewsItem } from '../../../../shared/types/news'

const ITEM: NewsItem = {
  id: 'test-1',
  title: 'Bitcoin hits new ATH',
  body: 'Bitcoin has reached a new all-time high, surpassing $100,000 for the first time.',
  source: 'Twitter',
  sourceName: 'BTC',
  url: 'https://example.com/news/1',
  tickers: ['BTC', 'ETH'],
  time: new Date('2025-06-15T12:00:00Z'),
  receivedAt: new Date('2025-06-15T12:00:01Z'),
  rawData: undefined,
}

describe('NewsCard', () => {
  it('should render the title', () => {
    const wrapper = mount(NewsCard, { props: { item: ITEM } })
    expect(wrapper.find('h3').text()).toBe(ITEM.title)
  })

  it('should render the body', () => {
    const wrapper = mount(NewsCard, { props: { item: ITEM } })
    expect(wrapper.find('p').text()).toContain('Bitcoin has reached')
  })

  it('should render the source name', () => {
    const wrapper = mount(NewsCard, { props: { item: ITEM } })
    expect(wrapper.find('header span').text()).toBe('BTC')
  })

  it('should render ticker badges', () => {
    const wrapper = mount(NewsCard, { props: { item: ITEM } })
    const badges = wrapper.findAll('footer span')
    expect(badges).toHaveLength(2)
    expect(badges[0].text()).toBe('BTC')
    expect(badges[1].text()).toBe('ETH')
  })

  it('should render relative time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:05:00Z'))
    try {
      const wrapper = mount(NewsCard, { props: { item: ITEM } })
      expect(wrapper.find('time').text()).toBe('5m ago')
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('should render external link when url is present', () => {
    const wrapper = mount(NewsCard, { props: { item: ITEM } })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe(ITEM.url)
    expect(link.attributes('target')).toBe('_blank')
  })

  it('should not render external link when url is empty', () => {
    const wrapper = mount(NewsCard, { props: { item: { ...ITEM, url: '' } } })
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('should not render body when body equals title', () => {
    const wrapper = mount(NewsCard, {
      props: { item: { ...ITEM, body: ITEM.title } },
    })
    expect(wrapper.find('p').exists()).toBe(false)
  })
})
