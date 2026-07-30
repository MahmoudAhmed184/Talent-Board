/**
 * Shared class recipes for interactive controls.
 *
 * These live outside the components so a button, a link styled as a button,
 * and a menu trigger cannot drift apart. Components never concatenate raw
 * Tailwind strings for anything defined here.
 */

export type ControlSize = 'sm' | 'md' | 'lg'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'subtle'
  | 'danger'
  | 'danger-ghost'

const BUTTON_BASE =
  'relative inline-flex items-center justify-center gap-2 rounded-field font-semibold ' +
  'whitespace-nowrap select-none border ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--duration-control)] ease-[var(--ease-standard)] ' +
  'active:scale-[0.98] ' +
  'disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60'

/**
 * Sizes are height-first so controls line up on a row regardless of content.
 * `sm` is a desktop-density affordance and grows to the 44px minimum target on
 * touch devices.
 */
const BUTTON_SIZE: Record<ControlSize, string> = {
  sm: 'h-9 coarse:h-11 px-3 text-support',
  md: 'h-11 px-4 text-support',
  lg: 'h-12 px-6 text-body',
}

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  // brand-700 on white text is 4.98:1 — the accessible member of the ramp.
  primary:
    'border-transparent bg-accent text-text-inverse shadow-raised hover:bg-accent-hover',
  secondary:
    'border-border bg-surface text-text-primary shadow-raised hover:bg-surface-subtle hover:border-border-strong',
  ghost: 'border-transparent bg-transparent text-text-secondary hover:bg-surface-sunken',
  subtle: 'border-transparent bg-surface-sunken text-text-primary hover:bg-border',
  danger:
    'border-transparent bg-danger-fg text-text-inverse shadow-raised hover:brightness-110',
  'danger-ghost':
    'border-transparent bg-transparent text-danger-fg hover:bg-danger-bg',
}

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ControlSize = 'md',
  block = false,
): string {
  return [
    BUTTON_BASE,
    BUTTON_SIZE[size],
    BUTTON_VARIANT[variant],
    block ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

/** Square variant of the same recipe, for icon-only controls. */
const ICON_BUTTON_SIZE: Record<ControlSize, string> = {
  sm: 'size-9 coarse:size-11 p-0',
  md: 'size-11 p-0',
  lg: 'size-12 p-0',
}

export function iconButtonClasses(
  variant: ButtonVariant = 'ghost',
  size: ControlSize = 'md',
): string {
  return [BUTTON_BASE, ICON_BUTTON_SIZE[size], BUTTON_VARIANT[variant]].join(' ')
}

/* ------------------------------------------------------------------ *
 * Text inputs, selects, textareas
 * ------------------------------------------------------------------ */

const FIELD_BASE =
  'w-full rounded-field border bg-surface text-text-primary ' +
  'placeholder:text-text-faint ' +
  'transition-[border-color,box-shadow] duration-[var(--duration-control)] ease-[var(--ease-standard)] ' +
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-faint'

const FIELD_SIZE: Record<ControlSize, string> = {
  sm: 'h-9 coarse:h-11 px-3 text-support',
  md: 'h-11 px-3.5 text-support',
  lg: 'h-12 px-4 text-body',
}

export function fieldClasses(
  size: ControlSize = 'md',
  invalid = false,
  withLeadingIcon = false,
): string {
  return [
    FIELD_BASE,
    FIELD_SIZE[size],
    invalid ? 'border-danger-fg' : 'border-border hover:border-border-strong',
    withLeadingIcon ? 'pl-10' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function textareaClasses(invalid = false): string {
  return [
    FIELD_BASE,
    'min-h-28 resize-y px-3.5 py-2.5 text-support leading-6',
    invalid ? 'border-danger-fg' : 'border-border hover:border-border-strong',
  ].join(' ')
}

/* ------------------------------------------------------------------ *
 * Surfaces
 * ------------------------------------------------------------------ */

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export const CARD_PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
}
