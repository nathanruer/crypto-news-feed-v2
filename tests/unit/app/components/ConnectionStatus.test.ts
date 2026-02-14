import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConnectionStatus from '../../../../app/components/domain/news/ConnectionStatus.vue'

describe('ConnectionStatus', () => {
  it('should show green dot and "Connected" when connected', () => {
    const wrapper = mount(ConnectionStatus, { props: { status: 'connected' } })
    const dot = wrapper.find('span.rounded-full')
    expect(dot.classes()).toContain('bg-bullish')
    expect(wrapper.text()).toContain('Connected')
  })

  it('should show orange dot and "Reconnecting..." when reconnecting', () => {
    const wrapper = mount(ConnectionStatus, { props: { status: 'reconnecting' } })
    const dot = wrapper.find('span.rounded-full')
    expect(dot.classes()).toContain('bg-warning')
    expect(dot.classes()).toContain('animate-pulse')
    expect(wrapper.text()).toContain('Reconnecting...')
  })

  it('should show red dot and "Disconnected" when disconnected', () => {
    const wrapper = mount(ConnectionStatus, { props: { status: 'disconnected' } })
    const dot = wrapper.find('span.rounded-full')
    expect(dot.classes()).toContain('bg-bearish')
    expect(wrapper.text()).toContain('Disconnected')
  })
})
