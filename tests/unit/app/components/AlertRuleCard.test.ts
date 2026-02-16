import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AlertRuleCard from '../../../../app/components/domain/alerts/AlertRuleCard.vue'
import type { AlertRule } from '../../../../shared/types/alert'

const defaultRule: AlertRule = {
  id: 'rule-1',
  name: 'BTC Alert',
  type: 'ticker',
  value: 'BTC',
  enabled: true,
  createdAt: new Date('2025-01-01'),
}

describe('AlertRuleCard', () => {
  it('should render rule name', () => {
    const wrapper = mount(AlertRuleCard, { props: { rule: defaultRule } })
    expect(wrapper.text()).toContain('BTC Alert')
  })

  it('should render rule type and value', () => {
    const wrapper = mount(AlertRuleCard, { props: { rule: defaultRule } })
    expect(wrapper.text()).toContain('ticker')
    expect(wrapper.text()).toContain('BTC')
  })

  it('should render source type rule', () => {
    const rule = { ...defaultRule, type: 'source' as const, value: 'Binance' }
    const wrapper = mount(AlertRuleCard, { props: { rule } })
    expect(wrapper.text()).toContain('source')
    expect(wrapper.text()).toContain('Binance')
  })

  it('should emit toggle-enabled when toggle clicked', async () => {
    const wrapper = mount(AlertRuleCard, { props: { rule: defaultRule } })
    await wrapper.find('[data-testid="toggle-enabled"]').trigger('click')
    expect(wrapper.emitted('toggle-enabled')).toEqual([['rule-1']])
  })

  it('should emit delete when delete clicked', async () => {
    const wrapper = mount(AlertRuleCard, { props: { rule: defaultRule } })
    await wrapper.find('[data-testid="delete-rule"]').trigger('click')
    expect(wrapper.emitted('delete')).toEqual([['rule-1']])
  })

  it('should visually indicate disabled state', () => {
    const rule = { ...defaultRule, enabled: false }
    const wrapper = mount(AlertRuleCard, { props: { rule } })
    expect(wrapper.find('[data-testid="rule-card"]').classes()).toContain('opacity-50')
  })

  it('should not have opacity class when enabled', () => {
    const wrapper = mount(AlertRuleCard, { props: { rule: defaultRule } })
    expect(wrapper.find('[data-testid="rule-card"]').classes()).not.toContain('opacity-50')
  })
})
