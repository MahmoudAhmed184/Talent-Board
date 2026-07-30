import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiEmptyState from '../UiEmptyState.vue'

describe('UiEmptyState', () => {
  it('renders its title as a paragraph by default', () => {
    // Inside a page section the surrounding heading already owns the outline;
    // a second heading here would corrupt it.
    const wrapper = mount(UiEmptyState, { props: { title: 'No applications yet' } })

    expect(wrapper.find('h1').exists()).toBe(false)
    expect(wrapper.find('h2').exists()).toBe(false)
    expect(wrapper.get('p').text()).toBe('No applications yet')
  })

  it('can render its title as the page heading', () => {
    // The 401, 403, and 404 pages *are* an empty state, so without this they
    // would ship with no `h1` at all.
    const wrapper = mount(UiEmptyState, {
      props: { title: 'We could not find that page', titleAs: 'h1' },
    })

    expect(wrapper.get('h1').text()).toBe('We could not find that page')
  })

  it('hides the decorative icon from assistive technology', () => {
    const wrapper = mount(UiEmptyState, { props: { title: 'Nothing here' } })

    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })
})
