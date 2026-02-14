import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsList from '../../../../app/components/domain/news/NewsList.vue'
import type { NewsItem } from '../../../../shared/types/news'

function createItem(id: string): NewsItem {
  return {
    id,
    title: `News ${id}`,
    body: `Body for ${id}`,
    source: 'Twitter',
    sourceName: 'BTC',
    url: 'https://example.com',
    tickers: ['BTC'],
    time: new Date(),
    receivedAt: new Date(),
    rawData: undefined,
  }
}

describe('NewsList', () => {
  it('should render empty state when no items', () => {
    const wrapper = mount(NewsList, { props: { items: [] } })
    expect(wrapper.text()).toContain('Waiting for news...')
  })

  it('should render news cards when items are provided', () => {
    const items = [createItem('1'), createItem('2')]
    const wrapper = mount(NewsList, { props: { items } })
    expect(wrapper.text()).not.toContain('Waiting for news...')
    expect(wrapper.text()).toContain('News 1')
    expect(wrapper.text()).toContain('News 2')
  })

  it('should not show empty state when items exist', () => {
    const wrapper = mount(NewsList, { props: { items: [createItem('1')] } })
    expect(wrapper.text()).not.toContain('Waiting for news...')
  })
})
