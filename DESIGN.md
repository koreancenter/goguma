# GOGUMA Design System Specification (v2.1 — Sejong Editorial Monochrome)

## 1. Design Philosophy & Aesthetic Direction
GOGUMA v2.1 adopts the **architectural editorial minimalism** of the Sejong Center for the Performing Arts (`sejongpac.or.kr`) — uniting **Sumi Ink (`#111111`)** typography with **Gallery White (`#FFFFFF`)** and **Warm Hanji Paper (`#F6F5F1`)**.

- **Architectural Edges & Zero Box Clutter:** Replace SaaS-style rounded cards (`rounded-xl`/`2xl`), floating shadows, and pastel tint pills (`bg-[#EFF6FF]`) with sharp `0px–2px` geometry, expansive whitespace, and disciplined `1px` structural hairlines (`#E4E2DC`).
- **Editorial Typographic Contrast:** Pair geometric architectural display sans-serif (`Plus Jakarta Sans` + `SUIT Variable`) with crisp UI/prose sans-serif (`DM Sans` + `SUIT Variable`), anchored by bold weight contrast (`700/800` vs `400`) and tabular editorial numbering (`01`, `02`, ...).
- **The Preview as an Exhibition Frame:** Treat the right-hand Live Preview as an archival exhibition stage on warm hanji paper (`#F6F5F1`) rather than a cramped developer pane.
- **Strict Separation of Concerns (Core Preservation):** All updates reside strictly in the presentation layer. Local-first IndexedDB persistence, TipTap v3 rich-text state, CodeMirror bindings, the 3-Tier AI pipeline (`WebLLM → Ollama → Gemini API`), and the 11-document JSZip export engine remain untouched.

---

## 2. Color Palette & Design Tokens

### 2.1 Surfaces & Canvas
| Token Name | Hex Value | Tailwind / CSS Usage | Role & Application |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#FFFFFF` | `bg-white` | Primary editor surface, top header, unboxed reading canvas |
| `--bg-stage` | `#F6F5F1` | `bg-[#F6F5F1]` | Warm Hanji stage backdrop, preview mat, chapter index drawer |
| `--bg-subtle` | `#EFEDE7` | `bg-[#EFEDE7]` | Subtle hover surfaces, inactive editorial fills |
| `--bg-elevated` | `#FFFFFF` | `bg-white` | Elevated exhibition frames, popovers, preview device stage |

### 2.2 Typography & Sumi Ink
| Token Name | Hex Value | Tailwind / CSS Usage | Role & Application |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#111111` | `text-[#111111]` | Display headlines, section headers, active navigation, solid buttons |
| `--text-body` | `#1C1C1A` | `text-[#1C1C1A]` | Long-form editor copy and specification prose |
| `--text-secondary` | `#52524E` | `text-[#52524E]` | Descriptions, helper copy, inactive navigation items |
| `--text-tertiary` | `#8C8B85` | `text-[#8C8B85]` | Editorial kickers, timestamps, subtle index numbers |

### 2.3 Brand & Architectural Accents
| Token Name | Hex Value | Tailwind / CSS Usage | Role & Application |
| :--- | :--- | :--- | :--- |
| `--accent-primary` | `#111111` | `bg-[#111111]` / `text-[#111111]` | Primary CTAs, active underline bars, sharp focus rings |
| `--accent-hover` | `#2A2A28` | `hover:bg-[#2A2A28]` | Charcoal hover lift for primary solid actions |
| `--accent-tint` | `#F2F1EC` | `bg-[#F2F1EC]` | Restrained warm tint for active list rows |
| `--accent-seal` | `#8B261D` | `text-[#8B261D]` | Optional muted cultural seal accent (used sparingly) |

### 2.4 Semantic & Hairline Tokens
| Token Name | Hex Value | Role & Application |
| :--- | :--- | :--- |
| `--border-hairline` | `#E4E2DC` | Structural `1px` seams (top header bottom, 50:50 split divider, row separators) |
| `--border-hairline-strong` | `#CBC8BF` | Focused input bottom lines, table headers, emphasized dividers |
| `--status-success` | `#1F5132` (bg `#F3F7F4`) | Local persistence confirmed, AI engine ready |
| `--status-warning` | `#8A5314` (bg `#FAF6EE`) | Unsaved draft or fallback indicator |
| `--status-danger` | `#8B261D` (bg `#FBF3F2`) | Validation errors, destructive actions |

---

## 3. Typography System

### 3.1 Font Families (2+1 Editorial Sans-Serif Rule)
- **Editorial Display (`--font-display`):** `'Plus Jakarta Sans', 'SUIT Variable', -apple-system, BlinkMacSystemFont, sans-serif`
- **Primary Sans (UI & Body Prose, `--font-sans`):** `'DM Sans', 'SUIT Variable', -apple-system, BlinkMacSystemFont, sans-serif`
- **Monospace (Strictly Inside Code-Viewer Blocks Only, `--font-mono`):** `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### 3.2 Type Scale & Rhythm
- **Display Hero / Exhibition Title:** `clamp(2.5rem, 4.5vw, 4rem)`, `font-display`, `font-weight: 700`, `letter-spacing: -0.03em`, `line-height: 1.15`, `text-wrap: balance`
- **Main Chapter / Section Title:** `2rem`–`2.5rem` (`32px`–`40px`), `font-display`, `font-weight: 700`, `letter-spacing: -0.03em`, `line-height: 1.2`
- **Base Document Flow:** `15.5px`, `font-sans`, `font-weight: 400`, `line-height: 1.75`–`1.8`, `letter-spacing: -0.01em`, color `#1C1C1A`
- **Editorial Kicker & Index:** `11px`, `tracking-[0.16em]`, `uppercase`, `tabular-nums`, color `#8C8B85`

---

## 4. Component & Spatial Standards (Phase 1–3 Roadmap)
- **Sharp Geometry:** Standard radius is `0px` (`rounded-none`) for layout containers/frames/dividers and `2px` (`rounded-[2px]`) for interactive buttons and inputs.
- **Hairline & Margin Structure:** Separate content with generous vertical spacing (`space-y-12` to `space-y-16`) and `1px` full-width hairlines (`#E4E2DC`) rather than nested cards or `border-l-4` stripes.
- **Zero-Pill Discipline:** Metadata, statuses, and chapter numbers are rendered as unboxed inline typography separated by `·` or `/`, never pill capsules.
- **CodeMirror & Tiptap Alignment:** Light archival theme (`#FFFFFF` canvas, `#F6F5F1` gutters/tables, `#111111` cursor & selection) to maintain seamless monochrome visual continuity.