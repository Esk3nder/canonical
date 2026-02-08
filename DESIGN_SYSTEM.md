# Canonical Design System

The authoritative specification for the Canonical Design System — the visual foundation of the Canonical staking portfolio platform. Rooted in the Perplexity AI design language, adapted for institutional finance.

---

## 1. Philosophy & Principles

**Content-first institutional design.** The interface is a vessel for data. Color, typography, and layout serve the content, never compete with it.

- **Invisible Brand**: Clean, considered, invisible — like a Scandinavian subway system. Users should never feel over-branded while reviewing portfolio data.
- **Three Pillars**: Dark mode + Light mode + Accent. The entire visual system reduces to these three elements. Dark/light for the canvas, turquoise/cyan for actions.
- **Warmth Beyond Tech**: Warm accents (apricot, terra cotta) balance the cool turquoise to feel approachable, not cold.
- **Restrained Interactions**: Hover states are subtle color shifts, not dramatic changes. Focus states use warm peach for inviting feedback. Animations are purposeful and fast.

---

## 2. Color Palette

### 2.1 Brand Core

| Token           | Hex       | HSL                | CSS Variable     | Usage                              |
|-----------------|-----------|--------------------|------------------|------------------------------------|
| Offblack        | `#091717` | `180 52% 6%`      | `--foreground`   | Primary text, authority            |
| Off-White       | `#FAF9F6` | `45 29% 97%`      | `--background`, `--card` | Page & card surfaces (seamless) |
| True Turquoise  | `#20808D` | `187 63% 34%`     | `--primary`      | Primary accent, CTAs, interactive  |

### 2.2 Turquoise Scale (Primary Accent)

| Token           | Hex       | HSL                | CSS Variable         |
|-----------------|-----------|--------------------|----------------------|
| Turquoise 100   | `#DEF7F9` | `184 78% 93%`     | `--turquoise-100`    |
| Turquoise 200   | `#92DCE2` | `184 57% 73%`     | `--turquoise-200`    |
| Turquoise 400   | `#2CA0AB` | `185 59% 42%`     | `--turquoise-400`    |
| Turquoise 500   | `#1FB8CD` | `188 73% 46%`     | `--turquoise-500`    |
| Turquoise 600   | `#1A6872` | `187 63% 27%`     | `--turquoise-600`    |
| Turquoise 700   | `#114F56` | `186 67% 20%`     | `--turquoise-700`    |
| Turquoise 800   | `#0B363C` | `187 69% 14%`     | `--turquoise-800`    |

### 2.3 Secondary / Accent Colors

| Token           | Hex       | HSL                | Usage                              |
|-----------------|-----------|--------------------|-----------------------------------|
| Inky Blue       | `#13343B` | `193 52% 15%`     | Dark surfaces, secondary text      |
| Peacock         | `#2E565E` | `189 34% 27%`     | Muted text, subdued accents        |
| Plex Blue       | `#1FB8CD` | `188 73% 46%`     | Interactive elements, links        |
| Sky             | `#BADEDD` | `179 41% 80%`     | Light accent, highlights           |
| Warm Red        | `#BF505C` | `354 41% 53%`     | Error, destructive, danger         |
| Terra Cotta     | `#A84B2F` | `15 57% 42%`      | High severity, warm accent         |
| Apricot         | `#FFD2A6` | `29 100% 83%`     | Warning, warm highlight            |
| Olive           | `#707C36` | `71 38% 35%`      | Success, positive states           |

### 2.4 Light Mode Tokens

| Token                | Hex       | CSS Variable              | Usage                          |
|----------------------|-----------|---------------------------|--------------------------------|
| Background Primary   | `#FAF9F6` | `--background`            | Page background (Off-White)    |
| Card Surface         | `#FAF9F6` | `--card`                  | Card surfaces (same as bg)     |
| Background Tertiary  | `#F0EFEA` | `--secondary`, `--muted`  | Sidebar, secondary surfaces    |
| Background Hover     | `#EAEEEF` | (use `hover:bg-muted`)    | Hover states                   |
| Text Primary         | `#091717` | `--foreground`            | Main text (Offblack)           |
| Text Secondary       | `#13343B` | `--accent-foreground`     | Secondary text (Inky Blue)     |
| Text Muted           | `#2E565E` | `--muted-foreground`      | Placeholder, subdued (Peacock) |
| Border Default       | `#E4E2DD` | `--border`, `--input`     | Card borders, dividers         |
| Accent Primary       | `#20808D` | `--primary`               | Buttons, links, interactive    |
| Accent Hover         | `#1A6872` | (use `hover:bg-primary/90`) | Hover state for accent       |
| Accent Light         | `#BADEDD` | `--accent`                | Accent backgrounds (Sky)       |

### 2.5 Dark Mode Tokens

| Token                | Hex       | CSS Variable              | Usage                          |
|----------------------|-----------|---------------------------|--------------------------------|
| Background Primary   | `#0C0C0C` | `--background`            | Page background                |
| Background Secondary | `#1A1A1A` | `--card`                  | Card surfaces                  |
| Background Tertiary  | `#242424` | `--secondary`, `--muted`  | Elevated surfaces              |
| Background Hover     | `#3A3A3A` | (use `hover:bg-muted`)    | Hover states                   |
| Text Primary         | `#FFFFFF` | `--foreground`            | Main text                      |
| Text Secondary       | `#B8B8B8` | `--accent-foreground`     | Secondary text                 |
| Text Muted           | `#808080` | `--muted-foreground`      | Placeholder, muted             |
| Border Default       | `#3A3A3A` | `--border`, `--input`     | Borders, dividers              |
| Accent Primary       | `#20B8CD` | `--primary`               | Cyan interactive elements      |
| Accent Warm          | `#F5C1A9` | `--focus-peach`           | Focus ring warm accent         |

### 2.6 Semantic Status Colors

| Status    | Light Hex | Dark Hex  | CSS Variable   | Usage                     |
|-----------|-----------|-----------|----------------|---------------------------|
| Success   | `#20808D` | `#20B8CD` | `--success`    | Positive states, active   |
| Warning   | `#FFD2A6` | `#FFD2A6` | `--warning`    | Caution, pending          |
| Danger    | `#BF505C` | `#BF505C` | `--danger`     | Error, destructive        |

### 2.7 Chart / Data Visualization Palette

| Slot    | Color         | Hex       | CSS Variable |
|---------|---------------|-----------|--------------|
| Chart 1 | True Turquoise | `#20808D` | `--chart-1` |
| Chart 2 | Plex Blue     | `#1FB8CD` | `--chart-2`  |
| Chart 3 | Warm Red      | `#BF505C` | `--chart-3`  |
| Chart 4 | Apricot       | `#FFD2A6` | `--chart-4`  |
| Chart 5 | Olive         | `#707C36` | `--chart-5`  |

### 2.8 Search Flow Colors

| Token         | Hex       | CSS Variable       | Usage                |
|---------------|-----------|--------------------|-----------------------|
| Query Cyan    | `#00C2FF` | `--search-query`   | Search query emphasis |
| Answer Coral  | `#FF6F59` | `--search-answer`  | Answer highlights     |
| Source Yellow | `#F9C74F` | `--search-source`  | Source citations      |
| Result Blue   | `#3A86FF` | `--search-result`  | Result/link accent    |

### 2.9 Custodian Brand Colors

| Custodian         | Color          | Hex       |
|-------------------|----------------|-----------|
| Coinbase Prime    | True Turquoise | `#20808D` |
| Anchorage Digital | Peacock        | `#2E565E` |
| BitGo             | Plex Blue      | `#1FB8CD` |
| Fireblocks        | Warm Red       | `#BF505C` |
| Copper            | Terra Cotta    | `#A84B2F` |
| Figment           | Olive          | `#707C36` |
| Default/Unknown   | Inky Blue      | `#13343B` |

---

## 3. Typography

### 3.1 Font Stack

| Purpose   | Font                                                                        |
|-----------|-----------------------------------------------------------------------------|
| Primary   | `Geist Sans`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `"Helvetica Neue"`, `Arial`, `sans-serif` |
| Monospace | `"Geist Mono"`, `"SF Mono"`, `"Fira Code"`, `Menlo`, `Consolas`, `monospace` |

### 3.2 Type Scale

| Token        | Size   | Line Height | Letter Spacing | Weight | Tailwind Class  | Usage                  |
|--------------|--------|-------------|----------------|--------|-----------------|------------------------|
| Super        | 200px  | 170px       | -3.5px         | 700    | `text-super`    | Hero headlines         |
| Display XL   | 60px   | 65px        | -3.5px         | 700    | `text-display-xl` | Section headlines    |
| Display LG   | 40px   | 42px        | -2.5px         | 700    | `text-display-lg` | Page titles          |
| Heading 2    | 30px   | 36px        | -1.5px         | 600    | `text-heading-2` | Section headers      |
| Heading 3    | 24px   | 32px        | -0.5px         | 600    | `text-heading-3` | Subsection headers   |
| Heading 4    | 20px   | 28px        | -0.3px         | 600    | `text-heading-4` | Card titles          |
| Body Large   | 18px   | 28px        | 0              | 400    | `text-body-lg`  | Answer text, emphasis  |
| Body / Base  | 16px   | 24px        | 0              | 400    | `text-base`     | Default body text      |
| UI           | 14px   | 19px        | 0              | 400–500| `text-ui`       | Labels, navigation     |
| Caption      | 13px   | 18px        | 0              | 400    | `text-caption`  | Secondary info         |
| Badge        | 11px   | 16px        | 0.2px          | 500    | `text-badge`    | Badges, citations      |

### 3.3 Font Weights

| Weight | Name      | Usage                                  |
|--------|-----------|----------------------------------------|
| 400    | Regular   | Body text, paragraphs                  |
| 500    | Medium    | UI labels, navigation, emphasis        |
| 600    | Semibold  | Headings, card titles                  |
| 700    | Bold      | Display headlines, strong emphasis     |

---

## 4. Spacing

Based on an **8px grid** with 4px half-steps.

| Token  | Value  | Tailwind | Usage                                |
|--------|--------|----------|--------------------------------------|
| 0      | 0px    | `0`      | Reset                                |
| 0.5    | 2px    | `0.5`    | Micro spacing, icon gaps             |
| 1      | 4px    | `1`      | Tight element gaps                   |
| 1.5    | 6px    | `1.5`    | Small badge padding                  |
| 2      | 8px    | `2`      | Default inline gap, tight padding    |
| 3      | 12px   | `3`      | Input vertical padding               |
| 4      | 16px   | `4`      | Standard padding, section gap        |
| 5      | 20px   | `5`      | Card padding, component spacing      |
| 6      | 24px   | `6`      | Section spacing                      |
| 8      | 32px   | `8`      | Large section gaps                   |
| 10     | 40px   | `10`     | Major section spacing                |
| 12     | 48px   | `12`     | Page-level vertical gaps             |
| 16     | 64px   | `16`     | Hero section spacing                 |
| 20     | 80px   | `20`     | Landing page section gaps            |
| 24     | 96px   | `24`     | Major page divisions                 |

### Component-Specific Spacing

| Component              | Spacing            |
|------------------------|--------------------|
| Input padding          | `12px 16px` (py-3 px-4) |
| Card padding           | `20px` (p-5)      |
| Button padding (sm)    | `8px 16px`         |
| Button padding (md)    | `10px 20px`        |
| Button padding (lg)    | `12px 24px`        |
| Nav item padding       | `8px 12px`         |
| Sidebar width          | `260px` expanded, `60px` collapsed |

---

## 5. Border Radius

| Token    | Value   | Tailwind      | Usage                               |
|----------|---------|---------------|--------------------------------------|
| none     | 0px     | `rounded-none`| No rounding                          |
| sm       | 4px     | `rounded-sm`  | Small elements, badges, citations    |
| default  | 5px     | `rounded`     | Buttons, inputs (Canonical default)  |
| md       | 8px     | `rounded-md`  | Cards, containers, dropdowns         |
| lg       | 12px    | `rounded-lg`  | Search bar, panels, modals           |
| xl       | 16px    | `rounded-xl`  | Prominent elements                   |
| 2xl      | 20px    | `rounded-2xl` | Marketing buttons, pill shapes       |
| full     | 9999px  | `rounded-full`| Circular buttons, avatars            |

### Component Radius Assignments

| Component        | Radius  |
|------------------|---------|
| Search bar       | `12px` (rounded-lg) |
| Answer cards     | `8px` (rounded-md) |
| Primary buttons  | `5px` (rounded) |
| Input fields     | `5px` (rounded) |
| Citation badges  | `4px` (rounded-sm) |
| User avatar      | `9999px` (rounded-full) |
| Dropdown menus   | `8px` (rounded-md) |
| Modal dialogs    | `12px` (rounded-lg) |
| Tooltips         | `6px` |

---

## 6. Shadows & Elevation

### Light Mode

| Token        | Value                                                            | Usage              |
|--------------|------------------------------------------------------------------|--------------------|
| xs           | `0 1px 2px rgba(0,0,0,0.05)`                                    | Subtle lift        |
| sm           | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`       | Cards at rest      |
| md           | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` | Elevated cards |
| lg           | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| xl           | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | Modals |

### Dark Mode

| Token        | Value                                      |
|--------------|--------------------------------------------|
| sm           | `0 2px 8px rgba(0,0,0,0.3)`               |
| md           | `0 4px 12px rgba(0,0,0,0.4)`              |
| lg           | `0 16px 48px rgba(0,0,0,0.5)`             |

### Focus Rings

| Token        | Value                                         | Usage                    |
|--------------|-----------------------------------------------|--------------------------|
| focus-peach  | `0 0 0 2px rgba(245, 193, 169, 0.2)`         | Warm focus (inputs)      |
| focus-cyan   | `0 0 0 2px rgba(32, 184, 205, 0.3)`          | Turquoise focus (CTAs)   |

---

## 7. Animations & Transitions

### Timing Tokens

| Token    | Duration | Easing                              | Usage                    |
|----------|----------|-------------------------------------|--------------------------|
| fast     | 100ms    | `ease-out`                          | Hover color changes      |
| default  | 150ms    | `cubic-bezier(0.4, 0, 0.2, 1)`     | Standard UI transitions  |
| medium   | 200ms    | `ease`                              | Sidebar expand/collapse  |
| slow     | 300ms    | `cubic-bezier(0.4, 0, 0.2, 1)`     | Modal enter/exit         |
| spring   | 500ms    | `cubic-bezier(0.34, 1.56, 0.64, 1)`| Bounce/spring effects    |

### Easing Functions

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);   /* Material ease-in-out */
--ease-in:      cubic-bezier(0.4, 0, 1, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Standard Animation Patterns

| Pattern          | Tailwind Class    | Description                            |
|------------------|-------------------|----------------------------------------|
| Fade In          | `animate-fade-in` | Opacity 0→1, 150ms ease-out           |
| Slide Up         | `animate-slide-up`| Y+8px→0 with fade, 200ms ease-out     |
| Shimmer          | `animate-shimmer` | Gradient sweep for loading skeletons   |
| Pulse            | `animate-pulse`   | Opacity pulse for live indicators      |
| Modal In         | `animate-modal-in`| Scale 0.95→1 with fade, 200ms         |
| Modal Out        | `animate-modal-out`| Scale 1→0.95 with fade, 150ms        |

### Interaction Patterns

- **Search bar focus**: `transition: border-color 150ms ease, box-shadow 150ms ease`
- **Card hover lift**: `transform: translateY(-2px); box-shadow: shadow-md` over 200ms
- **Sidebar collapse**: `transition: width 200ms ease`
- **Button hover**: Background color shift over 150ms

---

## 8. Component Patterns

### 8.1 SearchBar

The centerpiece search input.

- **Size**: Full-width, max `550px`, height `48px`
- **Border radius**: `12px` (rounded-lg)
- **Padding**: `12px 16px`
- **Font size**: 18px (text-body-lg)
- **Focus**: Turquoise border + `focus-cyan` ring shadow
- **Submit button**: Circular (`9999px`), `50px × 50px`, turquoise background, white icon
- **Variants**: `default` (centered, full-width), `compact` (header bar, smaller)
- **Placeholder**: Muted text color

### 8.2 AnswerCard

Display card for structured answers.

- **Background**: Off-White (`bg-card`)
- **Border**: Default border + turquoise left accent stripe (3px)
- **Border radius**: `8px` (rounded-md)
- **Padding**: `20px`
- **Max width**: `42rem` (672px)
- **Header**: Sparkle icon + "Answer" label in turquoise, 24px semibold
- **Body**: 16px body text, 24px line-height
- **Animation**: `animate-slide-up` on mount

### 8.3 CitationBadge

Inline superscript citation numbers.

- **Size**: `18px` min-width/height
- **Font**: 11px (text-badge), semibold
- **Colors**: Turquoise-100 bg, turquoise-700 text (light); turquoise/15% bg (dark)
- **Border radius**: `4px` (rounded-sm)
- **Position**: `vertical-align: super`, inline
- **Hover**: Turquoise-200 bg (light); turquoise/30% bg (dark)

### 8.4 SourceCard

Expandable source reference.

- **Layout**: Flex row — favicon (20px, rounded-sm) + title (14px, medium) + domain (12px, muted)
- **Background**: Tertiary (#F0EFEA light / #282828 dark)
- **Border**: Default border color
- **Border radius**: `8px` (rounded-md)
- **Padding**: `12px 16px`
- **Hover**: Background shifts to hover state
- **Expand**: Uses Collapsible to show snippet text

### 8.5 CodeBlock

Styled code display with copy functionality.

- **Header**: Language label + copy button, 13px muted text, tertiary background
- **Body**: Offblack bg (#091717), monospace font, 14px, 22px line-height
- **Border radius**: `8px` (rounded-md)
- **Copy button**: Ghost style, appears on hover
- **Light mode variant**: Tertiary bg (#F3F3EE), offblack text

### 8.6 Buttons

| Variant     | Background     | Text           | Border         | Radius | Usage          |
|-------------|----------------|----------------|----------------|--------|----------------|
| Primary     | Turquoise      | White          | None           | 5px    | Primary CTAs   |
| Secondary   | Transparent    | Turquoise      | Turquoise      | 5px    | Secondary actions |
| Ghost       | Transparent    | Foreground     | None           | 5px    | Subtle actions |
| Destructive | Warm Red       | White          | None           | 5px    | Danger actions |
| Pill        | Turquoise      | White          | None           | 20px   | Marketing CTAs |

**States**: Hover darkens bg by 10%. Active darkens by 20%. Disabled at 50% opacity.

### 8.7 Badges

| Variant     | Background                | Text               | Usage                |
|-------------|---------------------------|---------------------|----------------------|
| default     | Turquoise                 | White               | Default state        |
| active      | Turquoise-100             | Turquoise-800       | Active/online        |
| pending     | Apricot/20%               | Terra Cotta         | Waiting states       |
| success     | Turquoise-100             | Turquoise-700       | Positive             |
| warning     | Apricot/20%               | Terra Cotta         | Caution              |
| danger      | Warm Red/10%              | Warm Red            | Error                |
| critical    | Warm Red                  | White               | Critical severity    |
| high        | Terra Cotta               | White               | High severity        |
| medium      | Apricot                   | Offblack            | Medium severity      |
| low         | Plex Blue                 | White               | Low severity         |
| slashed     | Warm Red/10%              | Warm Red            | Slashed validators   |
| exited      | Muted                     | Muted foreground    | Exited validators    |
| info        | Sky                       | Inky Blue           | Informational        |
| neutral     | Inky Blue                 | White               | Neutral state        |

### 8.8 Cards

- **Background**: Off-White (`bg-card`, same as `bg-background`) in light, #1A1A1A in dark
- **Border**: `1px solid` border token
- **Border radius**: `8px` (rounded-md)
- **Padding**: `20px` (p-5)
- **Shadow**: `shadow-sm` at rest, `shadow-md` on hover (optional)

### 8.9 Sidebar

- **Width**: `260px` expanded, `60px` collapsed
- **Background**: Tertiary surface (light), #1A1A1A (dark) — via `--sidebar-background`
- **Border**: Right border using border token
- **Nav items**: `8px 12px` padding, `8px` border-radius, 14px medium text
- **Active state**: Turquoise-100 bg with turquoise text (light); tertiary bg with cyan text (dark)
- **Hover**: Muted bg
- **Transition**: `width 200ms ease`

### 8.10 Toggle / Switch

- **Size**: `44px × 24px`
- **Off state**: Border color bg (light), #3A3A3A (dark)
- **On state**: Turquoise bg
- **Thumb**: `20px × 20px`, white, `shadow-xs`
- **Transition**: `200ms ease`

---

## 9. Layout

### Content Widths

| Token            | Value   | Tailwind            | Usage                     |
|------------------|---------|---------------------|---------------------------|
| thread-max       | 42rem   | `max-w-thread`      | Answer thread content     |
| search-max       | 550px   | `max-w-search`      | Search input on home      |
| content-max      | 768px   | `max-w-content`     | Article/page content      |
| container-md     | 960px   | `max-w-container-md`| Medium containers         |
| container-lg     | 1200px  | `max-w-container-lg`| Wide containers           |
| container-xl     | 1440px  | `max-w-container-xl`| Full-width containers     |

### Responsive Breakpoints

| Breakpoint | Value   | Behavior                              |
|------------|---------|---------------------------------------|
| sm         | 640px   | Mobile landscape                      |
| md         | 768px   | Tablet portrait, sidebar collapses    |
| lg         | 1024px  | Tablet landscape, sidebar shows       |
| xl         | 1280px  | Desktop                               |
| 2xl        | 1536px  | Large desktop                         |

### Layout Patterns

- **Dashboard**: Sidebar (left) + header (top) + main content area (fluid, max-w-7xl)
- **Detail pages**: Sidebar + centered content (max-w-content)
- **Mobile**: Full-width, hamburger menu, stacked layout

---

## 10. Dark Mode

### Implementation

- **Method**: Class-based via `next-themes`
- **Toggle**: `<ThemeToggle />` component in site header
- **Attribute**: `.dark` class on `<html>` element
- **Default**: Light mode, with system preference detection

### Color Mapping (Light → Dark)

| Token              | Light          | Dark           |
|--------------------|----------------|----------------|
| Background         | `#FAF9F6`      | `#0C0C0C`      |
| Card               | `#FAF9F6`      | `#1A1A1A`      |
| Secondary          | `#F0EFEA`      | `#242424`      |
| Foreground         | `#091717`      | `#FFFFFF`       |
| Muted Foreground   | `#2E565E`      | `#808080`       |
| Border             | `#E4E2DD`      | `#3A3A3A`       |
| Primary            | `#20808D`      | `#20B8CD`       |
| Accent             | `#BADEDD`      | `#242424`       |

---

## 11. CSS Variable Reference

### Light Mode (`:root`)

```css
:root {
  --background: 45 29% 97%;
  --foreground: 180 52% 6%;
  --card: 45 29% 97%;
  --card-foreground: 180 52% 6%;
  --popover: 0 0% 100%;
  --popover-foreground: 180 52% 6%;
  --primary: 187 63% 34%;
  --primary-foreground: 0 0% 100%;
  --secondary: 45 18% 93%;
  --secondary-foreground: 180 52% 6%;
  --muted: 45 18% 93%;
  --muted-foreground: 189 34% 27%;
  --accent: 179 41% 80%;
  --accent-foreground: 193 52% 15%;
  --destructive: 354 41% 53%;
  --destructive-foreground: 0 0% 100%;
  --border: 45 12% 88%;
  --input: 45 12% 88%;
  --ring: 187 63% 34%;
  --success: 187 63% 34%;
  --success-foreground: 0 0% 100%;
  --warning: 29 100% 83%;
  --warning-foreground: 180 52% 6%;
  --danger: 354 41% 53%;
  --danger-foreground: 0 0% 100%;
  --chart-1: 187 63% 34%;
  --chart-2: 188 73% 46%;
  --chart-3: 354 41% 53%;
  --chart-4: 29 100% 83%;
  --chart-5: 71 38% 35%;
  --turquoise-100: 184 78% 93%;
  --turquoise-200: 184 57% 73%;
  --turquoise-400: 185 59% 42%;
  --turquoise-500: 188 73% 46%;
  --turquoise-600: 187 63% 27%;
  --turquoise-700: 186 67% 20%;
  --turquoise-800: 187 69% 14%;
  --search-query: 194 100% 50%;
  --search-answer: 6 100% 67%;
  --search-source: 42 94% 64%;
  --search-result: 219 100% 61%;
  --radius: 0.3125rem;
  --sidebar-background: 45 18% 93%;
  --sidebar-foreground: 180 52% 6%;
  --sidebar-primary: 187 63% 34%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 179 41% 80%;
  --sidebar-accent-foreground: 193 52% 15%;
  --sidebar-border: 45 12% 88%;
  --sidebar-ring: 187 63% 34%;
}
```

### Dark Mode (`.dark`)

```css
.dark {
  --background: 0 0% 5%;
  --foreground: 0 0% 100%;
  --card: 0 0% 10%;
  --card-foreground: 0 0% 100%;
  --popover: 0 0% 10%;
  --popover-foreground: 0 0% 100%;
  --primary: 189 73% 46%;
  --primary-foreground: 0 0% 5%;
  --secondary: 0 0% 14%;
  --secondary-foreground: 0 0% 100%;
  --muted: 0 0% 14%;
  --muted-foreground: 0 0% 50%;
  --accent: 0 0% 14%;
  --accent-foreground: 0 0% 72%;
  --destructive: 354 41% 53%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 23%;
  --input: 0 0% 23%;
  --ring: 189 73% 46%;
  --success: 189 73% 46%;
  --success-foreground: 0 0% 5%;
  --warning: 29 100% 83%;
  --warning-foreground: 0 0% 5%;
  --danger: 354 41% 53%;
  --danger-foreground: 0 0% 100%;
  --chart-1: 189 73% 46%;
  --chart-2: 187 63% 34%;
  --chart-3: 6 100% 67%;
  --chart-4: 29 100% 83%;
  --chart-5: 42 94% 64%;
  --turquoise-100: 189 30% 20%;
  --turquoise-200: 189 40% 25%;
  --turquoise-400: 189 55% 35%;
  --turquoise-500: 189 73% 46%;
  --turquoise-600: 189 78% 52%;
  --turquoise-700: 189 82% 60%;
  --turquoise-800: 189 85% 70%;
  --search-query: 194 100% 50%;
  --search-answer: 6 100% 67%;
  --search-source: 42 94% 64%;
  --search-result: 219 100% 61%;
  --sidebar-background: 0 0% 10%;
  --sidebar-foreground: 0 0% 100%;
  --sidebar-primary: 189 73% 46%;
  --sidebar-primary-foreground: 0 0% 5%;
  --sidebar-accent: 0 0% 14%;
  --sidebar-accent-foreground: 0 0% 100%;
  --sidebar-border: 0 0% 23%;
  --sidebar-ring: 189 73% 46%;
}
```

---

## 12. Tailwind Token Reference

### Custom Color Utilities

| Class               | Value                           |
|---------------------|---------------------------------|
| `bg-turquoise-*`    | Turquoise scale 100–800         |
| `text-offblack`     | `#091717`                       |
| `bg-off-white`      | `#FAF9F6`                       |
| `text-inky-blue`    | `#13343B`                       |
| `bg-peacock`        | `#2E565E`                       |
| `text-plex-blue`    | `#1FB8CD`                       |
| `bg-sky`            | `#BADEDD`                       |
| `text-warm-red`     | `#BF505C`                       |
| `bg-terra-cotta`    | `#A84B2F`                       |
| `bg-apricot`        | `#FFD2A6`                       |
| `text-olive`        | `#707C36`                       |

### Custom Font Size Utilities

| Class              | Size / Line Height / Spacing          |
|--------------------|---------------------------------------|
| `text-display-xl`  | 60px / 65px / -3.5px                  |
| `text-display-lg`  | 40px / 42px / -2.5px                  |
| `text-heading-2`   | 30px / 36px / -1.5px                  |
| `text-heading-3`   | 24px / 32px / -0.5px                  |
| `text-heading-4`   | 20px / 28px / -0.3px                  |
| `text-body-lg`     | 18px / 28px                            |
| `text-ui`          | 14px / 19px                            |
| `text-caption`     | 13px / 18px                            |
| `text-badge`       | 11px / 16px / 0.2px                   |

### Custom Shadow Utilities

| Class              | Description                     |
|--------------------|---------------------------------|
| `shadow-xs`        | Subtle lift                     |
| `shadow-focus-peach` | Warm peach focus ring         |
| `shadow-focus-cyan`  | Turquoise focus ring          |
| `shadow-dark-sm`   | Dark mode card shadow           |
| `shadow-dark-md`   | Dark mode elevated shadow       |
| `shadow-dark-lg`   | Dark mode modal shadow          |

### Custom Animation Utilities

| Class               | Description                    |
|---------------------|--------------------------------|
| `animate-fade-in`   | Fade in, 150ms ease-out        |
| `animate-slide-up`  | Slide up + fade, 200ms         |
| `animate-shimmer`   | Loading skeleton shimmer       |
| `animate-pulse`     | Opacity pulse for indicators   |
| `animate-modal-in`  | Modal enter, 200ms             |
| `animate-modal-out` | Modal exit, 150ms              |

---

## 13. Usage Guidelines

### Always Use Semantic Tokens

```tsx
// CORRECT — adapts to light/dark mode
<div className="bg-background text-foreground border-border" />
<div className="bg-card text-muted-foreground" />
<button className="bg-primary text-primary-foreground" />

// INCORRECT — hardcoded colors break dark mode
<div className="bg-white text-gray-900 border-gray-200" />
<div className="bg-slate-50 text-slate-500" />
```

### Color Class Migration Map

| Instead of...                 | Use...                    |
|-------------------------------|---------------------------|
| `text-gray-900`, `text-slate-900` | `text-foreground`    |
| `text-gray-500`, `text-slate-500` | `text-muted-foreground` |
| `bg-white`                    | `bg-background` or `bg-card` |
| `bg-slate-50`, `bg-gray-50`  | `bg-muted` or `bg-secondary` |
| `border-slate-200`           | `border-border`            |
| `text-green-600`             | `text-success`             |
| `text-red-600`               | `text-destructive`         |
| `bg-green-50`                | `bg-success/10`            |
| `bg-red-50`                  | `bg-destructive/10`        |

### Badge Variant Selection

| Condition              | Variant      |
|------------------------|-------------- |
| Active validator       | `active`     |
| Pending activation     | `pending`    |
| Slashed validator      | `slashed`    |
| Exited validator       | `exited`     |
| Critical exception     | `critical`   |
| High severity          | `high`       |
| Medium severity        | `medium`     |
| Low severity           | `low`        |
| Informational          | `info`       |
| Neutral/default        | `neutral`    |

### Shadow Level Guide

| Context              | Shadow Level |
|----------------------|-------------- |
| Flat elements        | `none`       |
| Cards at rest        | `shadow-sm`  |
| Elevated cards       | `shadow-md`  |
| Dropdowns, popovers  | `shadow-lg`  |
| Modals               | `shadow-xl`  |
| Focus rings          | `shadow-focus-cyan` or `shadow-focus-peach` |

### Accessibility

- All text must meet **WCAG AA** contrast ratios in both light and dark modes
- Offblack (#091717) on Off-White (#FAF9F6): **16.2:1** ratio
- White on Turquoise (#20808D): **3.7:1** (use for large text/icons only, or use offblack text on turquoise-100)
- White on #0C0C0C (dark bg): **20.3:1** ratio
- Focus indicators must be visible — use focus-cyan or focus-peach ring shadows
- Interactive elements must have visible hover/active states
