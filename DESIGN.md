# GOGUMA Design System Specification (v2.0 — Editorial Light)

## 1. Design Philosophy & Aesthetic Direction
GOGUMA v2.0 transitions away from a dense, dark-mode developer IDE (`Sumi Black`) toward an **open, architectural, editorial workspace** inspired by cultural institutions (such as the Sejong Center for the Performing Arts).

- **Gallery White & Visual Breathing Room:** Replace heavy dark containers and `1px` box borders with expansive pure white (`#FFFFFF`) and warm alabaster (`#F7F8FA`) surfaces. Let generous whitespace create natural grouping.
- **Typography Over Boxes:** Establish visual hierarchy through crisp typographic scale, weight, and vertical rhythm rather than enclosing every form group in bordered cards.
- **The Preview as a Curated Stage:** Treat the right-hand Live Preview not as a cramped debug pane, but as an exhibition stage where the user's specification and prototype breathe with clarity.
- **Strict Separation of Concerns (Core Preservation):** All visual updates reside strictly in the presentation layer. Local-first IndexedDB persistence, TipTap v3 rich-text state, CodeMirror bindings, the 3-Tier AI pipeline (`WebLLM → Ollama → Gemini API`), and the 11-document JSZip export engine remain untouched.

---

## 2. Color Palette & Design Tokens

### 2.1 Surfaces & Canvas
| Token Name | Hex Value | Tailwind / CSS Usage | Role & Application |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#FFFFFF` | `bg-white` | Primary editor surface, top header, modal interiors |
| `--bg-stage` | `#F7F8FA` | `bg-[#F7F8FA]` | Right-hand preview stage backdrop, collapsible chapter drawer |
| `--bg-subtle` | `#F1F5F9` | `bg-slate-100` | Hover states, inactive segmented tabs, subtle input fills |
| `--bg-elevated` | `#FFFFFF` | `bg-white` | Floating toolbars, popovers, preview device frame |

### 2.2 Typography & Ink
| Token Name | Hex Value | Tailwind / CSS Usage | Role & Application |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#111827` | `text-gray-900` | Page titles, section headers, active body copy |
| `--text-secondary` | `#4B5563` | `text-gray-600` | Descriptions, helper copy, inactive navigation items |
| `--text-tertiary` | `#9CA3AF` | `text-gray-400` | Placeholders, timestamps, subtle metadata |

### 2.3 Brand & Editorial Accents
| Token Name | Hex Value | Tailwind / CSS Usage | Role & Application |
| :--- | :--- | :--- | :--- |
| `--accent-primary` | `#1E3A8A` | `bg-[#1E3A8A]` / `text-[#1E3A8A]` | Primary CTAs, active chapter marker, key focus rings |
| `--accent-hover` | `#172554` | `hover:bg-[#172554]` | Hover state for primary buttons |
| `--accent-tint` | `#EFF6FF` | `bg-blue-50` | Active chapter pill background, selected tag fill |

### 2.4 Semantic & Hairline Tokens
| Token Name | Hex Value | Role & Application |
| :--- | :--- | :--- |
| `--border-hairline` | `#E5E7EB` | Used **sparingly** only for structural seams (top header bottom, 50:50 split divider) |
| `--status-success` | `#15803D` (bg `#F0FDF4`) | AI Engine connected (`WebLLM` / `Ollama` / `Gemini`), Saved locally |
| `--status-warning` | `#B45309` (bg `#FFFBEB`) | Fallback engine active, unsaved draft indicator |
| `--status-danger` | `#B91C1C` (bg `#FEF2F2`) | Validation errors, destructive actions |

---

## 3. Typography System

### 3.1 Font Families
- **Primary Sans (UI & Editorial):** `'Pretendard Variable', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
- **Monospace (Code & Spec Raw View):** `'JetBrains Mono', 'Fira Code', monospace`

### 3.2 Type Scale & Rhythm
- **Base Document Line-Height:** `1.7` on `html`, `body`, prose paragraphs, and TipTap editorial flow for generous gallery readability.
- **Chapter Display Title:** `1.75rem` (`28px`), `font-bold` (`700`), `tracking-[-0.025em]`, `leading-[1.3]`
- **Section Heading:** `1.125rem` (`18px`), `font-semibold` (`600`), `tracking-[-0.015em]`, `leading-[1.4]`
- **Editorial Body / TipTap Prose:** `0.9375rem` (`15px`), `font-normal` (`400`), `leading-[1.7]`
- **UI Control / Label:** `0.8125rem` (`13px`), `font-medium` (`500`), `leading-[1.4]`
- **Micro Metadata / Badge:** `0.75rem` (`12px`), `font-medium` (`500`), `tracking-[0.02em]`

### 3.3 Global CSS & Tailwind v4 Theme Foundation (`index.html` & `src/index.css`)
- **Single Light Foundation:** Root `<html>` (`color-scheme: light`) and `<body>` are unified on `#FFFFFF` canvas with `#111827` primary ink and `#EFF6FF` / `#1E3A8A` text selection. No `.dark` variant overrides or `#0B0C10` / `#0E1217` dark surfaces remain in global styles.
- **Token Availability:** All surface, ink, accent, hairline, and semantic tokens are defined in `:root` and mirrored in Tailwind v4 `@theme` (`--color-canvas`, `--color-stage`, `--color-subtle`, `--color-ink-primary`, `--color-ink-secondary`, `--color-accent-primary`, `--color-hairline`), alongside `--font-sans` (`Pretendard Variable`, `Plus Jakarta Sans`) and `--font-mono` (`JetBrains Mono`).

---

## 4. Spatial Architecture & Layout Shell

### 4.1 Reclaiming Horizontal Space (Collapsible Navigation + 50:50 Split)
Replace the rigid 3-column IDE grid (`Sidebar + Editor + Preview`) with a breathable 2-pane studio:

1. **Top Utility Header (`h-14` / `56px`):**
   - Pure white (`#FFFFFF`) with a single `1px solid #E5E7EB` bottom hairline.
   - **Left:** Chapter Drawer Toggle button + GOGUMA wordmark + Current Project Title (inline editable).
   - **Center:** Compact Chapter Progress / Quick-Jump Pill (e.g., `02. Core Architecture`).
   - **Right:** 3-Tier AI Engine Status Indicator (`WebLLM` / `Ollama` / `Gemini`) + Primary CTA (`Export 11 Specs` in `#1E3A8A`).

2. **Collapsible Chapter Navigation (Rail / Slide-Over Drawer):**
   - **Default State:** Collapsed to a minimal `52px` icon/number rail (or hidden drawer) so the main workspace enjoys maximum width.
   - **Expanded State:** `240px` clean drawer in `#F7F8FA` listing the specification chapters with generous row height (`40px`), active `#EFF6FF` pill highlight, and `#1E3A8A` text.

3. **50:50 Fluid Split Workspace (`h-[calc(100vh-56px)]`):**
   - **Left Pane — Editorial Specification Input (`50%` width):**
     - Background: `#FFFFFF`.
     - Inner container: `max-w-3xl mx-auto px-10 py-12` (generous side and top breathing room).
     - Form sections are separated by `space-y-12` and subtle typographic headers—**no outer `1px` card boxes**.
   - **Right Pane — Curated Preview Stage (`50%` width):**
     - Background: `#F7F8FA` (Warm Alabaster stage).
     - Separated from the left pane by a single `1px solid #E5E7EB` vertical divider.
     - Displays a floating minimal toolbar at the top (`Live Preview` / `Spec Document` / `Code View` toggle + viewport width switcher) and centers the rendered output on an elevated white canvas (`shadow-[0_12px_32px_-4px_rgba(15,23,42,0.06)]`).

---

## 5. Component Styling Standards

- **Inputs & Textareas:** Borderless or bottom-hairline/soft-fill (`bg-[#F7F8FA] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/15 rounded-lg px-4 py-3 transition-all`). Avoid harsh dark outlines.
- **Example / Prompt Suggestions:** Instead of boxed cards, render as subtle tonal callouts (`bg-[#F7F8FA] rounded-xl p-5`) with a crisp `#1E3A8A` label.
- **Primary Button:** `bg-[#1E3A8A] hover:bg-[#172554] text-white font-medium px-4 py-2 rounded-lg shadow-xs transition-colors`.
- **Secondary / Ghost Button:** `text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors`.
- **CodeMirror Integration:** Configure CodeMirror to use a clean light theme (`githubLight` or custom `#F7F8FA` surface with `#111827` syntax ink) to eliminate dark-mode visual shock.