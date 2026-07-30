# Motion Guidelines

Motion exists to explain what changed and where it came from. If an animation
does not answer one of those questions, it should not ship.

Source of truth: `src/design/motion.ts` (JavaScript) and the `--duration-*` /
`--ease-*` tokens in `src/design/tokens.css` (CSS).
`src/design/__tests__/tokens.spec.ts` fails the build if the two drift apart.

---

## 1. Tokens

| Token | Value | Use |
| --- | --- | --- |
| `instant` | 110ms | Press feedback, colour and icon swaps |
| `control` | 165ms | Hover and focus on small controls |
| `element` | 220ms | A component entering or leaving |
| `panel` | 320ms | Dialogs, drawers, page transitions |
| `stagger` | 38ms | Gap between items in a list |

| Easing | Curve | Use |
| --- | --- | --- |
| `entrance` | `cubic-bezier(0.22, 1, 0.36, 1)` | Anything arriving |
| `exit` | `cubic-bezier(0.4, 0, 1, 1)` | Anything leaving — always quicker than its entrance |
| `standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes that neither arrive nor leave |

Springs are restrained and used only for drawers (`spring.panel`) and chips
(`spring.chip`). Travel distances are `travel.sm` (8px) and `travel.md` (16px);
nothing else moves further.

---

## 2. Who owns what

This is the most important rule in this document.

### motion-v owns in-page motion

Page transitions, list stagger, filter chips, toasts, the navigation indicator.
Use the shared presets — never hand-write a duration:

```ts
const preset = useMotionPreset(fadeRise)          // one element
const itemMotion = useStaggeredPreset(fadeRise)   // v-bind="itemMotion(index)"
```

`useStaggeredPreset` merges the delay *into* the animate variant's own
transition. Binding a sibling `:transition` prop alongside a variant that
already contains one silently does nothing — the variant wins.

### reka-ui + CSS keyframes own overlays

Dialogs, sheets, popovers, menus, and tooltips animate with CSS classes keyed
off reka-ui's `data-state` attribute:

```
data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out
```

**Why not motion-v here.** reka-ui keeps a closing overlay mounted until its CSS
animation ends, and that is what actually unmounts it. Driving presence through
`AnimatePresence` + `forceMount` left closed overlays in the DOM permanently.
Presence stays with the library that already owns focus trapping and dismissal;
the keyframes use the same duration and easing tokens, so the motion language is
unchanged — only ownership.

### Page transitions have no exit

`PageTransition.vue` keys a `motion.div` on `route.path`. The remount replays the
enter variant; there is no exit and no `AnimatePresence`.

An earlier version used `AnimatePresence mode="wait"` so the outgoing page would
finish leaving first. It rendered the first page and then left `<main>` empty on
every subsequent navigation: the incoming child is gated on the outgoing child's
exit resolving, and it never did. **A page transition must never be able to
withhold the page**, so the exit was removed rather than reinstated with a
timeout.

---

## 3. Where motion is used

| Surface | Motion |
| --- | --- |
| Route change | Fade + 16px rise, 320ms entrance |
| Search results, lists | Fade + 8px rise, staggered 38ms, capped at 12 items |
| Job card hover | 2px lift + shadow, transform only |
| Filter chips | Spring scale in/out |
| Dialogs | Fade + scale from 0.97 |
| Sheets | Slide from edge |
| Popovers, menus, tooltips | Fade + scale from 0.96, 4px offset |
| Nav indicator | Shared-layout slide (`layoutId`) |
| Toasts | Fade + rise, layout-animated on stack change |
| Skeleton | Pulse, disabled under reduced motion |

The stagger cap matters: at 38ms the twelfth card starts at ~418ms, which is the
edge of reading as "the list arrived" rather than "the list is loading".

---

## 4. Constraints

- **Only `opacity` and `transform`.** The one exception is
  `collapseTransition`, where height *is* the change being communicated.
- **Job card hover is 2px.** Not 8px.
- No floating, bouncing, cursor followers, parallax, or per-paragraph reveals.
- No animation delays access to content.
- No global smooth scrolling — `scroll-behavior: auto` is set explicitly,
  because it fights keyboard navigation and has no usability justification here.
- Motion must work on keyboard focus, not only pointer hover. Interactive cards
  use `focus-within:` alongside `hover:`.
- Nothing animates layout in a way that shifts neighbouring content.

---

## 5. Reduced motion

Honoured twice, deliberately:

1. **Globally in CSS** — `prefers-reduced-motion: reduce` collapses all
   animation and transition durations to `0.01ms`. This is the safety net that
   catches anything hand-written.
2. **In JavaScript** — every preset is a pair. `useMotionPreset()` returns the
   opacity-only variant, and `useStagger()` returns zero delay, so lists appear
   at once instead of trickling in. Movement is *skipped*, not merely shortened.

`RoleNavigation` drops its shared `layoutId` under reduced motion so the
indicator does not slide.

Never call `useReducedMotion()` directly to branch on motion — use
`useMotionPreset` / `useStaggeredPreset` so the fallback stays consistent.

---

## 6. Verification status

Structure, routing, and layout were verified in a browser. **Animation timing
and overlay unmount-on-close were not**: the preview renderer runs with
`document.hidden === true`, so `requestAnimationFrame` never fires, CSS
animations never progress, and `animationend` never dispatches. Any timing
behaviour in this document is asserted from the code and the tokens, not
observed.

Before release, verify in a real browser:

- Dialogs, sheets, popovers, and menus fully unmount after closing.
- Page transitions replay on every navigation.
- `prefers-reduced-motion: reduce` removes movement without breaking layout.
- The nav indicator slides rather than jumping.
