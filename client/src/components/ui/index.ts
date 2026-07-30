/**
 * Barrel for the design-system primitives.
 *
 * Pages import from here (`import { UiButton, UiCard } from '@/components/ui'`)
 * so a component can be renamed or re-implemented in one place.
 *
 * Deliberately *not* in this library:
 *  - `Label` / `HelperText` / `ValidationMessage` — folded into UiFormField,
 *    which is the only thing that can guarantee they stay wired together.
 *  - `Combobox` — no MVP surface has an option list long enough to need
 *    filtering; categories and locations are short seeded taxonomies served by
 *    a native UiSelect. UiTagInput covers the one free-entry case (skills).
 */
export { default as UiAlert } from './UiAlert.vue'
export { default as UiAvatar } from './UiAvatar.vue'
export { default as UiBadge } from './UiBadge.vue'
export { default as UiBreadcrumbs } from './UiBreadcrumbs.vue'
export { default as UiButton } from './UiButton.vue'
export { default as UiCard } from './UiCard.vue'
export { default as UiCheckbox } from './UiCheckbox.vue'
export { default as UiCompanyLogo } from './UiCompanyLogo.vue'
export { default as UiConfirmationDialog } from './UiConfirmationDialog.vue'
export { default as UiDataTable } from './UiDataTable.vue'
export { default as UiDescriptionList } from './UiDescriptionList.vue'
export { default as UiDialog } from './UiDialog.vue'
export { default as UiDropdownMenu } from './UiDropdownMenu.vue'
export { default as UiEmptyState } from './UiEmptyState.vue'
export { default as UiErrorState } from './UiErrorState.vue'
export { default as UiFormField } from './UiFormField.vue'
export { default as UiIconButton } from './UiIconButton.vue'
export { default as UiInput } from './UiInput.vue'
export { default as UiMenuItem } from './UiMenuItem.vue'
export { default as UiPageHeader } from './UiPageHeader.vue'
export { default as UiPagination } from './UiPagination.vue'
export { default as UiPopover } from './UiPopover.vue'
export { default as UiProgress } from './UiProgress.vue'
export { default as UiRadioGroup } from './UiRadioGroup.vue'
export { default as UiSearchInput } from './UiSearchInput.vue'
export { default as UiSectionHeader } from './UiSectionHeader.vue'
export { default as UiSelect } from './UiSelect.vue'
export { default as UiSheet } from './UiSheet.vue'
export { default as UiSkeleton } from './UiSkeleton.vue'
export { default as UiSpinner } from './UiSpinner.vue'
export { default as UiStatCard } from './UiStatCard.vue'
export { default as UiStatusBadge } from './UiStatusBadge.vue'
export { default as UiSwitch } from './UiSwitch.vue'
export { default as UiTabs } from './UiTabs.vue'
export { default as UiTagInput } from './UiTagInput.vue'
export { default as UiTextarea } from './UiTextarea.vue'
export { default as UiToaster } from './UiToaster.vue'
export { default as UiTooltip } from './UiTooltip.vue'

export type { Crumb } from './UiBreadcrumbs.vue'
export type { DataTableColumn } from './UiDataTable.vue'
export type { DescriptionItem } from './UiDescriptionList.vue'
export type { RadioOption } from './UiRadioGroup.vue'
export type { SelectOption } from './UiSelect.vue'
export type { TabItem } from './UiTabs.vue'
export type { ButtonVariant, CardPadding, ControlSize } from './variants'
