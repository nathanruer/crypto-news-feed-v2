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

  describe('Load More button', () => {
    it('should render when hasMore is true and items exist', () => {
      const wrapper = mount(NewsList, {
        props: { items: [createItem('1')], hasMore: true },
      })
      expect(wrapper.find('[data-testid="load-more-button"]').exists()).toBe(true)
    })

    it('should not render when hasMore is false', () => {
      const wrapper = mount(NewsList, {
        props: { items: [createItem('1')], hasMore: false },
      })
      expect(wrapper.find('[data-testid="load-more-button"]').exists()).toBe(false)
    })

    it('should not render when items are empty', () => {
      const wrapper = mount(NewsList, {
        props: { items: [], hasMore: true },
      })
      expect(wrapper.find('[data-testid="load-more-button"]').exists()).toBe(false)
    })

    it('should show Loading... when isLoading is true', () => {
      const wrapper = mount(NewsList, {
        props: { items: [createItem('1')], hasMore: true, isLoading: true },
      })
      expect(wrapper.find('[data-testid="load-more-button"]').text()).toBe('Loading...')
    })

    it('should show Load more when not loading', () => {
      const wrapper = mount(NewsList, {
        props: { items: [createItem('1')], hasMore: true, isLoading: false },
      })
      expect(wrapper.find('[data-testid="load-more-button"]').text()).toBe('Load more')
    })

    it('should emit load-more when clicked', async () => {
      const wrapper = mount(NewsList, {
        props: { items: [createItem('1')], hasMore: true },
      })
      await wrapper.find('[data-testid="load-more-button"]').trigger('click')
      expect(wrapper.emitted('load-more')).toHaveLength(1)
    })

    it('should be disabled when isLoading is true', () => {
      const wrapper = mount(NewsList, {
        props: { items: [createItem('1')], hasMore: true, isLoading: true },
      })
      const btn = wrapper.find('[data-testid="load-more-button"]')
      expect(btn.attributes('disabled')).toBeDefined()
    })
  })
})
