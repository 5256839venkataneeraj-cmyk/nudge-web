---
name: Warm Accountability
colors:
  surface: '#fff8f6'
  surface-dim: '#e2d8d6'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf1ef'
  surface-container: '#f6ecea'
  surface-container-high: '#f0e6e4'
  surface-container-highest: '#eae0de'
  on-surface: '#1f1b1a'
  on-surface-variant: '#56423c'
  inverse-surface: '#352f2e'
  inverse-on-surface: '#f9eeec'
  outline: '#8a726a'
  outline-variant: '#ddc0b7'
  surface-tint: '#a0401c'
  primary: '#9d3e1a'
  on-primary: '#ffffff'
  primary-container: '#bd5630'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59c'
  secondary: '#486551'
  on-secondary: '#ffffff'
  secondary-container: '#caebd1'
  on-secondary-container: '#4e6b56'
  tertiary: '#5d5875'
  on-tertiary: '#ffffff'
  tertiary-container: '#76718f'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59c'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#802a05'
  secondary-fixed: '#caebd1'
  secondary-fixed-dim: '#aeceb6'
  on-secondary-fixed: '#042011'
  on-secondary-fixed-variant: '#314d3a'
  tertiary-fixed: '#e6deff'
  tertiary-fixed-dim: '#c9c2e4'
  on-tertiary-fixed: '#1c1831'
  on-tertiary-fixed-variant: '#48435f'
  background: '#fff8f6'
  on-background: '#1f1b1a'
  surface-variant: '#eae0de'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is built for a supportive, human-first personal accountability companion tailored to university students. It counters academic paralysis and burnout with warmth, calm reassurance, and gentle forward momentum. The emotional tone avoids cold corporate productivity metrics, abrasive alarmist notifications, or clinical checklist aesthetics. Instead, it feels like a patient mentor or focused study partner: encouraging, grounded, organized, and quietly confident.

The design philosophy combines **Warm Tactile Minimalism** with soft physical metaphors. Interfaces rely on generous negative space, gentle organic roundedness, tactile interactions, and breathable component architecture. Every interaction should feel forgiving rather than punitive—celebrating micro-wins and reducing cognitive strain during demanding academic semesters.

## Colors

The color palette reflects an earthy, comforting academic sanctuary. It balances a motivating terracotta-peach core with tranquil botanical and twilight accents over an oat-and-cream backdrop.

- **Primary (`#D96B43` - Terracotta Peach):** Used for key calls to action, active motivational states, milestone celebrations, and focus prompts. Communicates human warmth and energy without invoking anxiety.
- **Secondary (`#6C8A74` - Soft Earthy Sage):** Applied to success states, completed tasks, restorative habits, and academic pacing tags.
- **Tertiary (`#8A84A3` - Twilight Lavender):** Designated for reflection prompts, audio/voice logs, introspection categories, and study break trackers.
- **Neutral (`#2B2625` - Deep Warm Charcoal):** Delivers rich, legible typographic contrast while softening the harshness of pure black (`#000000`).
- **Canvas & Surface System:** 
  - Base canvas: `#FAF7F2` (Warm Oat Milk).
  - Elevated surfaces: `#FFFFFF` (Soft Crisp Cream).
  - Recessed/Muted containers: `#F2ECE4` (Muted Porridge).
  - Border stroke: `#E8DFD5` (Soft Grain Stroke).

## Typography

The typography leverages **Plus Jakarta Sans** across all roles to project clarity, approachability, and subtle geometric warmth. 

- **Display & Headlines:** Tightly tracked headings (`-0.02em` to `-0.01em`) prevent oversized gaps while maintaining open apertures for friendly legibility.
- **Body:** Generously spaced line heights (1.5x to 1.55x ratio) maintain airiness, reducing visual density for overwhelmed readers navigating deadlines or complex routines.
- **Labels:** Crisp, slightly tracked labels provide quick scanning across chips, badges, and the bottom navigation bar without appearing clinical or overly engineered.

## Layout & Spacing

This mobile-first design system centers around a single-column, fluid vertical rhythm optimized for one-handed operation.

- **Grid & Margins:** The layout operates on a standard mobile fluid canvas framed by a `1.25rem` (`20px`) outer margin, keeping touch targets away from hardware edges while maximizing legible content area.
- **Rhythm & Gaps:** Interior card grids and stacked components leverage a consistent `1rem` (`16px`) gutter. Vertical rhythm groups related items using `space-xs` (4px) and `space-sm` (8px), while distinct contextual blocks are separated by `space-lg` (24px) or `space-xl` (32px).
- **Safe Areas:** Fixed bottom overlays—specifically the bottom tab bar—reserve an 84px content clearance cushion above the physical device home indicator to ensure no scrollable content is obscured.

## Elevation & Depth

Visual depth is achieved through layered tonal warmth, delicate borders, and soft ambient drop shadows rather than stark elevation planes.

- **Surface Tiers:** 
  - *Base Surface:* The natural canvas (`#FAF7F2`) hosts uncontained labels and structural headers.
  - *Card Surface:* Pure cream surfaces (`#FFFFFF`) rise slightly above the canvas with a `1px` subtle outline in `#E8DFD5`.
  - *Sunken Recesses:* Sub-elements, input troughs, and nested metadata blocks use `#F2ECE4` with no border to convey inset depth.
- **Ambient Shadow System:**
  - *Resting Card:* `0 4px 16px -2px rgba(43, 38, 37, 0.04)`—subtle, warm-tinted soft contact shadow.
  - *Floating Interactive / Raised Mic Button:* `0 8px 24px -4px rgba(217, 107, 67, 0.28)`—tinted with primary terracotta pigment to create an inviting, buoyant presence.
  - *Bottom Bar Shadow:* `0 -4px 20px 0 rgba(43, 38, 37, 0.03)`—keeps the navigation gently separated from the scrolling canvas.

## Shapes

The shape system adopts a pill-centric, hyper-rounded geometry (`level 3`), removing rigid corners to evoke gentleness and warmth.

- **Cards & Sheets:** Content panels, modal bottom sheets, and routine containers utilize large radii (`rounded-2xl` at `1.25rem` / `20px`, stepping up to `rounded-3xl` at `1.75rem` / `28px` for overarching wrappers).
- **Interactive Controls:** Buttons, chips, search bars, and tags adopt full pill shapes (`9999px`), inviting tactile touch interactions.
- **Micro Elements:** Checkboxes use generous corner rounding (`8px`) rather than sharp 90-degree corners, harmonizing with the overarching circular ethos.

## Components

### Buttons
- **Primary Action Button:** Full pill shape (`rounded-full`), background `#D96B43`, text `#FFFFFF` (`label-lg`). Includes a subtle press-down micro-interaction (`scale: 0.98`) with 16px vertical and 24px horizontal padding.
- **Secondary / Ghost Button:** Light cream background (`#FFFFFF`) with a `1px` border in `#E8DFD5`, text `#2B2625`. Hover/press transitions gently to `#F2ECE4`.
- **Soft Motive Button:** Background in translucent sage (`rgba(108, 138, 116, 0.12)`) with `#6C8A74` text, used for low-friction secondary affirmations.

### Cards & Accountability Tiles
- Constructed with `#FFFFFF` background, `24px` border radius, and a crisp `1px` stroke in `#E8DFD5`.
- Inner content features generous padding (`1.25rem` / `20px`). Cards display a warm progress indicator along the bottom or left edge, avoiding cold percentage bars in favor of friendly visual check-marks and progress pips.

### Chips & Badges
- **Status & Subject Tags:** Pill-shaped tags (`rounded-full`) with `6px` vertical and `12px` horizontal padding. Typography set in `label-sm`.
- **Sage Variant (Habits/Complete):** `#EAF0EB` background with `#405947` text.
- **Lavender Variant (Reflection/Break):** `#EFEFF5` background with `#55506E` text.
- **Amber Variant (Upcoming/Nudge):** `#FAECE6` background with `#9E4322` text.

### Form Inputs & Text Fields
- Recessed pill or high-radius container (`rounded-2xl`) using `#F2ECE4` background with an inset `1px` transparent border.
- On focus, transitions to `#FFFFFF` background, a `1.5px` border in `#D96B43`, and a soft terracotta ambient glow (`rgba(217, 107, 67, 0.12)`). Typography set in `body-md`.

### Checkboxes & Selection Controls
- Custom squircle (`24px × 24px`, `8px` corner radius) with `1.5px` border in `#E8DFD5`.
- When checked, animates into a solid `#6C8A74` fill with a smooth, off-white micro checkmark, accompanied by a subtle rewarding tactile snap.

### Navigation: Fixed Bottom Tab Bar & Raised Voice Button
- **Bar Frame:** Floating or docked full-width bar (`height: 68px`) with `#FFFFFF` background and a delicate top divider in `#E8DFD5`.
- **Destinations (4 Items):** Home, Chat, Schedule, Summary. Displayed as vertically stacked icon-and-label pairs in `label-sm`. Active items tint to `#D96B43`; inactive items rest in `#8A84A3`.
- **Central Action Button (Voice/Mic Nudge):**
  - Circular (`56px × 56px`), centered along the horizontal axis, raised `-20px` above the tab bar plane.
  - Filled with `#D96B43` and elevated by a soft radiant shadow (`rgba(217, 107, 67, 0.35)`).
  - Contains a crisp white microphone icon, providing an immediate, friction-free way for students to talk through anxiety, log tasks verbally, or start an audio reflection.