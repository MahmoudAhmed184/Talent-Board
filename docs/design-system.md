# Talent Board Design System

The visual and interaction language of the Vue SPA in `client/`.

Everything here is implemented. `src/design/tokens.css` is the source of truth
for constants, `src/components/ui/` for primitives, and `src/lib/status.ts` for
how backend state is presented. When this document and the code disagree, the
code is right and this document is a bug.

**Live reference:** run the client and open `/dev/showcase`. It renders every
token and primitive from the real components. It is excluded from production
builds by `vite.config.ts`, so it does not ship.

---

## 1. Principles

1. **Say what is true.** A status badge reflects the API's state, a counter
   counts what was actually loaded, and a "live" indicator only claims live when
   the socket is connected. Where the backend cannot support a feature, the UI
   says so rather than faking it.
2. **Colour is never the only signal.** Every status carries a distinct label
   and icon as well as a tone. The design survives greyscale and colour
   blindness.
3. **Borders separate; shadows float.** Elevation is reserved for surfaces that
   genuinely sit above the page — overlays and hover states.
4. **One primary action per screen.** `UiPageHeader` gives it a fixed home.
5. **Errors stay on the page.** Toasts confirm; they never carry the only copy
   of something the user must read or act on.
6. **Motion clarifies, never gates.** No transition may delay access to content.

---

## 2. Colour

### Primitives

| Group | Tokens |
| --- | --- |
| Neutrals | `ink-950` `#111214`, `ink-900`, `ink-800` `#272A2F`, `ink-700`, `muted-600` `#667085`, `muted-500` `#7D8490` |
| Brand | `brand-900` … `brand-700` `#0877A8`, `brand-600` `#1096C8`, `brand-400` `#67CFF5`, `brand-200`, `brand-100` `#DDF4FD`, `brand-50` |
| Pastels (decorative) | `pastel-peach` `#FADCCB`, `pastel-mint` `#D8F3E8`, `pastel-lilac` `#E7DDFC`, `pastel-sky` `#DCEEF8`, `pastel-rose` `#F8DFF0`, `pastel-neutral` `#E9EDF3` |
| Semantic | `success-fg/bg/border`, `warning-*`, `danger-*`, `info-*` |

### Semantic aliases

Components reference **only** these. A future dark theme re-points this block
and nothing else changes.

`canvas` `surface` `surface-subtle` `surface-sunken` `surface-inverse`
`border` `border-strong` `border-inverse`
`text-primary` `text-secondary` `text-muted` `text-faint` `text-inverse`
`text-inverse-muted` `accent` `accent-hover` `accent-subtle` `focus-ring`

### Contrast rules — measured, not assumed

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `brand-700` on `surface` | **4.98:1** | AA for all text. This is why `--color-accent` is brand-700. |
| `brand-600` on `surface` | **3.38:1** | Large text (≥24px / ≥18.66px bold), borders, focus rings **only**. |
| `muted-600` on `surface` | **4.97:1** | AA. The minimum for real supporting text. |
| `muted-500` on `surface` | **3.77:1** | **Below AA.** Placeholders, disabled text, and decorative icons only. |
| `ink-950` on any pastel | **≥15:1** | Text on job cards is always `ink-950`. |

`src/design/__tests__/tokens.spec.ts` fails the build if the accent is moved off
brand-700, because that would silently break body-copy contrast everywhere.

**Pastels are decorative.** `pastelForId()` derives a card's colour from its job
id so it stays stable between renders. A pastel never encodes status.

### Dark surfaces

The dark band (`surface-inverse`) is used for public navigation and the search
band only. The product is not a dark-mode application; tokens are structured so
a dark theme *remains possible*, but implementing one is out of MVP scope.

---

## 3. Typography

One variable sans stack: `Inter Variable`/`Inter` when available, falling back to
the system UI stack. **No font files are bundled** — see Gaps.

| Token | Size | Use |
| --- | --- | --- |
| `text-display` | clamp 36 → 56px | Landing hero only |
| `text-page-title` | clamp 28 → 36px | The single `h1` per page |
| `text-section-title` | clamp 20 → 28px | `h2` |
| `text-card-title` | clamp 17 → 22px | Card and dialog headings |
| `text-body` | 16px / 1.6 | Long-form content |
| `text-support` | 14px / 1.55 | UI copy, form labels, most components |
| `text-meta` | 13px / 1.4 | Timestamps, pills, counts |

Never use `text-faint` for information the user needs.

---

## 4. Shape and elevation

| Radius | Value | Use |
| --- | --- | --- |
| `rounded-control` | 8px | Chips, small toggles |
| `rounded-field` | 10px | Inputs, buttons |
| `rounded-card` | 16px | Cards |
| `rounded-panel` | 20px | Dialogs, drawers |
| `rounded-shell` | 28px | The rounded application container |
| `rounded-pill` | full | Badges, filter chips |

Shadows: `shadow-raised` (resting), `shadow-card-hover`, `shadow-popover`,
`shadow-overlay`. Default separation is a 1px `border`.

---

## 5. Layout

| Breakpoint | Width | Behaviour |
| --- | --- | --- |
| Mobile | 360–430px | One column; filters and nav in drawers |
| Tablet | 768–1024px | Two-column results; sidebar still drawered |
| Desktop | 1280–1440px | Persistent sidebar / filter rail |
| Wide | up to 1600px (`3xl`) | Shell caps at `--size-shell-max` (1536px) |

Sizing tokens: `--size-shell-max`, `--size-content-max` (1280px),
`--size-prose-max` (44rem), `--size-sidebar` (17rem), `--size-filter-rail`
(18rem), `--size-tap-target` (44px).

**Tables never compress.** `UiDataTable` renders a real `<table>` from `md` up
and the same rows as stacked definition lists below it.

`coarse:` variant (`@media (pointer: coarse)`) grows 36px dense controls to the
44px minimum touch target instead of shipping two component sizes.

---

## 6. Component inventory

### Primitives — `src/components/ui/`

`UiAlert` `UiAvatar` `UiBadge` `UiBreadcrumbs` `UiButton` `UiCard` `UiCheckbox`
`UiCompanyLogo` `UiConfirmationDialog` `UiDataTable` `UiDescriptionList`
`UiDialog` `UiDropdownMenu` `UiEmptyState` `UiErrorState` `UiFormField`
`UiIconButton` `UiInput` `UiMenuItem` `UiPageHeader` `UiPagination` `UiPopover`
`UiProgress` `UiRadioGroup` `UiSearchInput` `UiSectionHeader` `UiSelect`
`UiSheet` `UiSkeleton` `UiSpinner` `UiStatCard` `UiStatusBadge` `UiSwitch`
`UiTabs` `UiTagInput` `UiTextarea` `UiToaster` `UiTooltip`

Key variants:

- **Button** — `primary` `secondary` `subtle` `ghost` `danger` `danger-ghost`;
  sizes `sm` `md` `lg`; `loading`, `disabled`, `block`. Renders a `RouterLink`
  or `<a>` when given `to`/`href`, so a navigating control is still a link.
- **Badge / StatusBadge** — tones `neutral` `accent` `info` `success` `warning`
  `danger`; sizes `sm` `md`.
- **Card** — tones `surface` `subtle` `sunken`; padding `none` `sm` `md` `lg`;
  `interactive` adds the restrained 2px lift.

### Deliberately not built

| Component | Why |
| --- | --- |
| `Label`, `HelperText`, `ValidationMessage` | Folded into `UiFormField`. Split apart they carry no styling decision and make it possible to render a label without its error — the exact failure the component prevents. |
| `Combobox` | No MVP surface has an option list long enough to need filtering. Categories and locations are short seeded taxonomies served by a native `UiSelect`; `UiTagInput` covers the one free-entry case (skills). |
| `SortControl` | `GET /api/v1/jobs` accepts no sort parameter. Building one would invent backend behaviour. |
| `SaveJobButton` | Saving jobs is not in the requirements. |

### Domain components

- **Jobs** (`features/jobs/components/`) — `JobCard` `JobListItem` `JobMetadata`
  `JobStatusBadge` `SalaryDisplay` `CompanySummary` `JobSearchBar`
  `JobFilterPanel` `ActiveFilterChips` `JobDiscovery` `JobDetail`
- **Applications** (`features/applications/components/`) — `ApplicationCard`
  `ApplicantCard` `ApplicationTimeline` `ApplyDialog`
- **Candidate** — `ResumeUploader` `ResumeCard` `ProfileCompletion`
- **Employer** — `JobForm` `LogoUpload`
- **Admin** — `ModerationQueueItem` `ModerationDecisionPanel`
- **Cross-cutting** — `RoleNavigation` `AccountMenu` `AppLogo`
  `RealtimeStatusIndicator` `PageTransition` `ApplicationStatusBadge`

---

## 7. Status presentation

`src/lib/status.ts` is the only place a backend state becomes a label, tone, and
icon. Nothing maps a status inline.

**Application statuses** (from `App\Enums\ApplicationStatus`):
`submitted` · `under_review` · `accepted` (shown as "Accepted") · `rejected`
(shown as **"Not selected"**, phrased from the candidate's side) · `cancelled`.

**Job moderation statuses** (`approval_status`): `pending` (shown as "Pending
review") · `approved` (shown as **"Published"**) · `rejected`.

`expired` is **derived, not stored**: an approved listing past its
`application_deadline`. `jobDisplayStatus()` folds this in so no surface can
show "Published" for a listing that no longer accepts applications. Expiry is
never derived for pending or rejected listings.

An unrecognised status from a newer API degrades to a neutral "Unknown" badge —
never a raw enum string.

---

## 8. Accessibility

Targets WCAG 2.1 AA for the core journeys.

- One `<h1>` per page via `UiPageHeader`; `UiSectionHeader` renders `h2`/`h3`.
  `UiEmptyState` renders its title as a `<p>` by default and accepts
  `title-as="h1"` for pages that *are* an empty state (401/403/404).
- A single global `:focus-visible` outline (`--color-focus-ring`, 2px, 2px
  offset). Components may reposition it, never remove it.
- Overlays use reka-ui: focus trap, focus restoration to the trigger, scroll
  lock, Escape, and outside-click are not re-implemented.
- Clickable cards are `<article>` with one stretched title link
  (`after:absolute after:inset-0`), never a `<div>` with a click handler.
  Secondary actions sit above it with `relative z-10`.
- Icon-only controls require a `label` prop — the type system makes it
  impossible to ship an unlabelled one.
- Decorative icons are `aria-hidden`. Status is text + icon + tone.
- Field errors use `role="alert"`; result counts and pagination summaries use
  polite live regions.
- Minimum 44px touch targets, enforced on coarse pointers.
- `prefers-reduced-motion` is honoured globally in CSS *and* branched on in JS,
  so animation is skipped rather than merely shortened.

---

## 9. Conventions

- `<script setup lang="ts">`, props destructured from `defineProps<>()`.
- Pinia setup stores only; `useTemplateRef()` for DOM refs.
- `useRoute()` takes no path argument — the `sfc-typed-router` Volar plugin
  (configured in `tsconfig.app.json`) narrows it per page file.
- Imports use the `@/` alias (`vite.config.ts` + `tsconfig.app.json`).
- No `any`. No duplicated status maps or class strings.
- **Never give a component-valued prop an inline default.** Vue treats a
  function default as a factory and invokes it; a Lucide icon is a functional
  component, so `icon = Inbox` throws. Resolve with a `computed` instead.

---

## 10. Gaps and follow-ups

1. **Inter is not bundled.** The stack prefers Inter and falls back to system
   UI. Adding the variable font locally is a follow-up; it needs a licence
   decision and binary assets.
2. **Dark theme** is prepared for but not implemented (out of MVP scope).
3. **Contrast ratios above were computed, not measured with an auditing tool.**
   An automated axe/Lighthouse pass over the running app is still outstanding.
4. `tsconfig.app.json` sets `rootDir: "."` so the typed-router Volar plugin can
   resolve page files; harmless under `noEmit`.
5. Running a **production** build rewrites `src/typed-router.d.ts` without the
   `/dev/showcase` route. Regenerate with a development-mode build before
   committing if the diff appears.
