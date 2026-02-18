import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsFilter from '../../../../app/components/domain/news/NewsFilter.vue'

const defaultProps = {
  sources: ['Binance', 'Twitter'],
  tickers: ['BTC', 'ETH', 'SOL'],
  selectedSources: new Set<string>(),
  selectedTickers: new Set<string>(),
  searchQuery: '',
}

describe('NewsFilter', () => {
  it('should render source chips', () => {
    const wrapper = mount(NewsFilter, { props: defaultProps })
    const sourceChips = wrapper.findAll('[data-testid="source-chip"]')
    expect(sourceChips).toHaveLength(2)
    expect(sourceChips[0].text()).toBe('Binance')
    expect(sourceChips[1].text()).toBe('Twitter')
  })

  it('should render ticker chips', () => {
    const wrapper = mount(NewsFilter, { props: defaultProps })
    const tickerChips = wrapper.findAll('[data-testid="ticker-chip"]')
    expect(tickerChips).toHaveLength(3)
    expect(tickerChips[0].text()).toBe('BTC')
  })

  it('should emit toggle-source when source chip clicked', async () => {
    const wrapper = mount(NewsFilter, { props: defaultProps })
    await wrapper.findAll('[data-testid="source-chip"]')[0].trigger('click')
    expect(wrapper.emitted('toggle-source')).toEqual([['Binance']])
  })

  it('should emit toggle-ticker when ticker chip clicked', async () => {
    const wrapper = mount(NewsFilter, { props: defaultProps })
    await wrapper.findAll('[data-testid="ticker-chip"]')[1].trigger('click')
    expect(wrapper.emitted('toggle-ticker')).toEqual([['ETH']])
  })

  it('should visually distinguish selected source chips', () => {
    const wrapper = mount(NewsFilter, {
      props: { ...defaultProps, selectedSources: new Set(['Twitter']) },
    })
    const chips = wrapper.findAll('[data-testid="source-chip"]')
    expect(chips[1].classes()).toContain('bg-text-accent/20')
    expect(chips[0].classes()).toContain('bg-bg-tertiary')
  })

  it('should visually distinguish selected ticker chips', () => {
    const wrapper = mount(NewsFilter, {
      props: { ...defaultProps, selectedTickers: new Set(['BTC']) },
    })
    const chips = wrapper.findAll('[data-testid="ticker-chip"]')
    expect(chips[0].classes()).toContain('bg-text-accent/20')
    expect(chips[1].classes()).toContain('bg-bg-tertiary')
  })

  it('should show clear button when filters active', () => {
    const wrapper = mount(NewsFilter, {
      props: { ...defaultProps, selectedSources: new Set(['Twitter']) },
    })
    expect(wrapper.find('[data-testid="clear-filters"]').exists()).toBe(true)
  })

  it('should not show clear button when no filters active', () => {
    const wrapper = mount(NewsFilter, { props: defaultProps })
    expect(wrapper.find('[data-testid="clear-filters"]').exists()).toBe(false)
  })

  it('should emit clear-filters when clear button clicked', async () => {
    const wrapper = mount(NewsFilter, {
      props: { ...defaultProps, selectedSources: new Set(['Twitter']) },
    })
    await wrapper.find('[data-testid="clear-filters"]').trigger('click')
    expect(wrapper.emitted('clear-filters')).toHaveLength(1)
  })

  it('should not render sources row when no sources available', () => {
    const wrapper = mount(NewsFilter, {
      props: { ...defaultProps, sources: [] },
    })
    expect(wrapper.find('[data-testid="sources-row"]').exists()).toBe(false)
  })

  it('should not render tickers row when no tickers available', () => {
    const wrapper = mount(NewsFilter, {
      props: { ...defaultProps, tickers: [] },
    })
    expect(wrapper.find('[data-testid="tickers-row"]').exists()).toBe(false)
  })

  it('should render search input', () => {
    const wrapper = mount(NewsFilter, { props: defaultProps })
    expect(wrapper.find('[data-testid="search-input"]').exists()).toBe(true)
  })

  it('should emit update:searchQuery on input', async () => {
    const wrapper = mount(NewsFilter, { props: defaultProps })
    await wrapper.find('[data-testid="search-input"]').setValue('bitcoin')
    expect(wrapper.emitted('update:searchQuery')).toEqual([['bitcoin']])
  })

  it('should show clear button when search query is active', () => {
    const wrapper = mount(NewsFilter, {
      props: { ...defaultProps, searchQuery: 'test' },
    })
    expect(wrapper.find('[data-testid="clear-filters"]').exists()).toBe(true)
  })

  describe('collapsable filter toggle', () => {
    it('should render filter toggle button', () => {
      const wrapper = mount(NewsFilter, { props: defaultProps })
      expect(wrapper.find('[data-testid="filter-toggle"]').exists()).toBe(true)
    })

    it('should show active filter count in badge', () => {
      const wrapper = mount(NewsFilter, {
        props: {
          ...defaultProps,
          selectedSources: new Set(['Binance']),
          selectedTickers: new Set(['BTC', 'ETH']),
        },
      })
      const badge = wrapper.find('[data-testid="filter-badge"]')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('3')
    })

    it('should not show badge when no filters active', () => {
      const wrapper = mount(NewsFilter, { props: defaultProps })
      expect(wrapper.find('[data-testid="filter-badge"]').exists()).toBe(false)
    })

    it('should toggle chip visibility on button click', async () => {
      const wrapper = mount(NewsFilter, { props: defaultProps })
      const chipSection = () => wrapper.find('[data-testid="filter-chips"]')

      expect(chipSection().exists()).toBe(false)

      await wrapper.find('[data-testid="filter-toggle"]').trigger('click')
      expect(chipSection().exists()).toBe(true)

      await wrapper.find('[data-testid="filter-toggle"]').trigger('click')
      expect(chipSection().exists()).toBe(false)
    })
  })
})
