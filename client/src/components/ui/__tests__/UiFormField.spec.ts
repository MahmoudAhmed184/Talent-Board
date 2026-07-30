import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import UiFormField from '../UiFormField.vue'
import UiInput from '../UiInput.vue'

/**
 * UiFormField exists to guarantee the accessibility wiring that is easy to get
 * wrong by hand. These tests pin that contract: a control is always labelled,
 * always described by its hint and error, and an error is always announced.
 */
describe('UiFormField', () => {
  it('associates the label with the control it wraps', () => {
    const wrapper = mount(UiFormField, {
      props: { label: 'Job title' },
      slots: {
        default: ({ id }: { id: string }) => h('input', { id }),
      },
    })

    const label = wrapper.get('label')
    const input = wrapper.get('input')

    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(label.text()).toContain('Job title')
  })

  it('points aria-describedby at the hint and the error together', () => {
    const wrapper = mount(UiFormField, {
      props: { label: 'Email', hint: 'We never share it.', error: 'Enter an email address.' },
      slots: {
        default: ({ id, describedBy }: { id: string; describedBy?: string }) =>
          h('input', { id, 'aria-describedby': describedBy }),
      },
    })

    const describedBy = wrapper.get('input').attributes('aria-describedby')?.split(' ') ?? []

    expect(describedBy).toHaveLength(2)

    // Every referenced id must actually exist, or the reference is dead.
    for (const id of describedBy) {
      expect(wrapper.find(`#${id}`).exists()).toBe(true)
    }
  })

  it('announces validation errors assertively', () => {
    const wrapper = mount(UiFormField, {
      props: { label: 'Email', error: 'Enter an email address.' },
      slots: { default: () => h('input') },
    })

    const alert = wrapper.get('[role="alert"]')

    expect(alert.text()).toContain('Enter an email address.')
  })

  it('exposes "required" to assistive technology, not just as an asterisk', () => {
    const wrapper = mount(UiFormField, {
      props: { label: 'Job title', required: true },
      slots: { default: () => h('input') },
    })

    expect(wrapper.get('label').text()).toContain('(required)')
    expect(wrapper.get('[aria-hidden="true"]').text()).toBe('*')
  })

  it('keeps a visually hidden label in the accessibility tree', () => {
    const wrapper = mount(UiFormField, {
      props: { label: 'Search', labelHidden: true },
      slots: { default: () => h('input') },
    })

    const label = wrapper.get('label')

    expect(label.classes()).toContain('sr-only')
    expect(label.text()).toContain('Search')
  })
})

describe('UiInput', () => {
  it('marks itself invalid and wires its error without any caller effort', () => {
    const wrapper = mount(UiInput, {
      props: { label: 'Email', error: 'That address is not valid.' },
    })

    const input = wrapper.get('input')

    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[role="alert"]').text()).toContain('That address is not valid.')

    const describedBy = input.attributes('aria-describedby')
    expect(describedBy).toBeDefined()
    expect(wrapper.find(`#${describedBy}`).exists()).toBe(true)
  })

  it('does not claim to be invalid when there is no error', () => {
    const wrapper = mount(UiInput, { props: { label: 'Email' } })

    expect(wrapper.get('input').attributes('aria-invalid')).toBeUndefined()
  })

  it('emits null rather than NaN when a number field is cleared', () => {
    const wrapper = mount(UiInput, {
      props: { label: 'Minimum salary', type: 'number', modelValue: 100 },
    })

    const input = wrapper.get('input')
    ;(input.element as HTMLInputElement).value = ''
    input.trigger('input')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
  })
})
