import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AlertRuleForm from '../../../../app/components/domain/alerts/AlertRuleForm.vue'

describe('AlertRuleForm', () => {
  it('should render form inputs', () => {
    const wrapper = mount(AlertRuleForm)
    expect(wrapper.find('[data-testid="rule-name"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="rule-type"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="rule-value"]').exists()).toBe(true)
  })

  it('should render submit button', () => {
    const wrapper = mount(AlertRuleForm)
    expect(wrapper.find('[data-testid="submit-rule"]').exists()).toBe(true)
  })

  it('should emit create with form data on submit', async () => {
    const wrapper = mount(AlertRuleForm)
    await wrapper.find('[data-testid="rule-name"]').setValue('My Alert')
    await wrapper.find('[data-testid="rule-type"]').setValue('ticker')
    await wrapper.find('[data-testid="rule-value"]').setValue('ETH')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('create')).toEqual([[{ name: 'My Alert', type: 'ticker', value: 'ETH' }]])
  })

  it('should not emit when name is empty', async () => {
    const wrapper = mount(AlertRuleForm)
    await wrapper.find('[data-testid="rule-type"]').setValue('ticker')
    await wrapper.find('[data-testid="rule-value"]').setValue('ETH')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('create')).toBeUndefined()
  })

  it('should not emit when value is empty', async () => {
    const wrapper = mount(AlertRuleForm)
    await wrapper.find('[data-testid="rule-name"]').setValue('My Alert')
    await wrapper.find('[data-testid="rule-type"]').setValue('ticker')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('create')).toBeUndefined()
  })

  it('should reset form after successful submit', async () => {
    const wrapper = mount(AlertRuleForm)
    const nameInput = wrapper.find('[data-testid="rule-name"]')
    const valueInput = wrapper.find('[data-testid="rule-value"]')
    await nameInput.setValue('My Alert')
    await wrapper.find('[data-testid="rule-type"]').setValue('ticker')
    await valueInput.setValue('ETH')
    await wrapper.find('form').trigger('submit')
    expect((nameInput.element as HTMLInputElement).value).toBe('')
    expect((valueInput.element as HTMLInputElement).value).toBe('')
  })
})
