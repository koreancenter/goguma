import { SitePlan, FormInputEntity, DomainBusinessRule } from '../types';
import { GOGUMA_CHAPTERS } from './chapterData';
import {
  getSectionBusinessRules,
  hasMeaningfulRuleContent,
  isChapterOrSectionLocked,
  wrapImmutableConstraint,
} from './businessRulesSerializer';

export interface ExecutionPlaybookInput {
  plan: SitePlan;
  formInputs?: Record<string, FormInputEntity>;
  lockedChapters?: number[];
  projectName?: string;
}

interface CollectedRuleItem {
  chapterId: number;
  chapterTitle: string;
  sectionKey: string;
  sectionTitle: string;
  rule: DomainBusinessRule;
  isLocked: boolean;
}

function collectProjectRules(
  formInputs?: Record<string, FormInputEntity>,
  lockedChapters: number[] = []
): CollectedRuleItem[] {
  if (!formInputs) return [];
  const items: CollectedRuleItem[] = [];

  for (const ch of GOGUMA_CHAPTERS) {
    for (const sec of ch.sections) {
      const key = `${ch.id}_${sec.key}`;
      const entity = formInputs[key];
      const sectionLocked = isChapterOrSectionLocked(ch.id, sec.key, formInputs, lockedChapters);
      const rules = getSectionBusinessRules(entity).filter(hasMeaningfulRuleContent);

      for (const rule of rules) {
        items.push({
          chapterId: ch.id,
          chapterTitle: ch.title,
          sectionKey: sec.key,
          sectionTitle: sec.title,
          rule,
          isLocked: Boolean(rule.isLocked || sectionLocked),
        });
      }
    }
  }

  return items;
}

function getRawInput(formInputs: Record<string, FormInputEntity> | undefined, key: string, fallback = ''): string {
  const raw = formInputs?.[key]?.userRawInput?.trim();
  return raw || fallback;
}

/**
 * Pure deterministic generator for `00_EXECUTION_PLAYBOOK.md`.
 * Inspects the user's chapters, locked rules, and preview edge-case states,
 * and outputs a structured 4-phase Vibe-Coding Execution Playbook.
 */
export function generateExecutionPlaybook(projectData: ExecutionPlaybookInput): string {
  const { plan, formInputs, lockedChapters = [] } = projectData;
  const projectName =
    projectData.projectName?.trim() ||
    plan.metadata?.projectName?.trim() ||
    getRawInput(formInputs, '1_project_name', 'GOGUMA Project');
  const platform = plan.metadata?.platform === 'APP' ? 'Mobile Web / PWA (APP)' : 'Web Application (WEB)';

  const allRules = collectProjectRules(formInputs, lockedChapters);
  const lockedRules = allRules.filter(item => item.isLocked);
  const activeRules = allRules.filter(item => !item.isLocked);

  const lockedChapterDefs = GOGUMA_CHAPTERS.filter(ch =>
    lockedChapters.includes(ch.id) ||
    ch.sections.some(sec => Boolean(formInputs?.[`${ch.id}_${sec.key}`]?.isLocked))
  );

  const dataColumnsRaw = getRawInput(formInputs, '4_data_columns', 'id, title, status, ownerId, createdAt');
  const dataColumns = dataColumnsRaw
    .split(/[,;\n/·]+/)
    .map(c => c.trim())
    .filter(Boolean);

  const keyFeaturesRaw = getRawInput(
    formInputs,
    '3_key_features',
    'Core CRUD workflow, status pipeline, real-time filtering'
  );
  const happyPathRaw = getRawInput(
    formInputs,
    '3_happy_path',
    'Entry -> Authentication -> Dashboard -> Primary Action -> Confirmation'
  );
  const verificationRaw = getRawInput(formInputs, '8_verification_checklist', '');

  const pages =
    plan.navigation?.pageStructure && plan.navigation.pageStructure.length > 0
      ? plan.navigation.pageStructure
      : [
          { name: '워크스페이스 대시보드', route: '/dashboard', purpose: '실시간 핵심 현황' },
          { name: '데이터 관리 목록', route: '/list', purpose: '검색, 필터링 및 상태 전이' },
        ];

  const lockedRulesSection =
    lockedRules.length > 0
      ? lockedRules
          .map((item, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            const lines = [
              `- **Locked Rule ${num}** (_Ch.0${item.chapterId} · ${item.sectionTitle}_)`,
              `  - **WHEN:** ${item.rule.when.trim() || 'Condition triggered'}`,
              `  - **THEN:** ${item.rule.then.trim() || 'Enforce invariant'}`,
            ];
            if (item.rule.exception.trim()) {
              lines.push(`  - **EXCEPT WHEN:** ${item.rule.exception.trim()}`);
            }
            return wrapImmutableConstraint(lines.join('\n'));
          })
          .join('\n\n')
      : '_No individual business rules are locked yet. Lock critical `WHEN / THEN / EXCEPT WHEN` rules in the editor to enforce them here as `[IMMUTABLE CONSTRAINT]` invariants._';

  const lockedChapterSummary =
    lockedChapterDefs.length > 0
      ? lockedChapterDefs
          .map(ch => `- **Chapter 0${ch.id} (${ch.title})** — \`[LOCKED · AI PROTECTED]\``)
          .join('\n')
      : '- _No full chapters locked yet._';

  const activeRulesPreview =
    activeRules.length > 0
      ? activeRules
          .map((item, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            return `- **Rule ${num}** (${item.sectionTitle}): WHEN ${item.rule.when.trim() || '...'} -> THEN ${item.rule.then.trim() || '...'}${
              item.rule.exception.trim() ? ` (EXCEPT WHEN ${item.rule.exception.trim()})` : ''
            }`;
          })
          .join('\n')
      : '- Standard domain validation and RBAC checks defined in `docs/06_DATA_SCHEMA.md`.';

  const primaryErrorRule =
    lockedRules[0]?.rule ||
    activeRules[0]?.rule || {
      id: 'default_guard',
      when: 'A user attempts a duplicate or unauthorized action against a protected record',
      then: 'Block the action immediately and show an inline corrective guidance banner',
      exception: 'An Admin / Operator explicitly applies a privileged override',
    };

  const domainQaItems =
    allRules.length > 0
      ? allRules
          .map((item, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            const lockTag = item.isLocked ? ' `[LOCKED]`' : '';
            const whenPlain = item.rule.when.trim() || 'the trigger condition occurs';
            const thenPlain = item.rule.then.trim() || 'the expected system outcome happens';
            const exceptPlain = item.rule.exception.trim();

            let line = `- [ ] **Check ${num}${lockTag} (${item.sectionTitle}):** Trigger *"${whenPlain}"* and confirm in the UI that **${thenPlain}**.`;
            if (exceptPlain) {
              line += ` Also test the exception case: confirm override behavior when **${exceptPlain}**.`;
            }
            return line;
          })
          .join('\n')
      : `- [ ] **Check 01 (Core Creation):** Create a new record and confirm it immediately appears in the list with all required fields (${dataColumns.slice(0, 4).join(', ')}).\n- [ ] **Check 02 (Validation Guard):** Submit an incomplete or duplicate record and confirm the system blocks submission with a clear message.`;

  const extraVerificationLines = verificationRaw
    ? verificationRaw
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => (l.startsWith('- [') ? l : `- [ ] ${l.replace(/^[-*\d.)\s]+/, '')}`))
        .join('\n')
    : '';

  return `# 00_EXECUTION_PLAYBOOK.md — ${projectName}

> **Purpose:** Copy-pasteable, phase-by-phase Vibe-Coding Execution Playbook tailored to **${projectName}** (${platform}).  
> **Guardrail Status:** ${lockedChapterDefs.length} Locked Chapter(s) · ${lockedRules.length} Locked Invariant Rule(s) · ${activeRules.length} Active Rule(s) · ${pages.length} Primary Screen(s)

---

## Phase 1: Foundation & Locked Constraints

Feed these foundational artifacts to your AI coding agent **first** before writing feature code:
1. \`.cursorrules\` / \`CLAUDE.md\` — Global engineering rules and library constraints.
2. \`docs/01_proposal.md\` — Product scope, target users, and problem framing.
3. \`docs/03_DESIGN.md\` — Visual tokens, typography, and layout discipline.
4. \`docs/05_ARCH_CONSTITUTION.md\` — Non-negotiable tech stack (React 19 + TypeScript + Tailwind CSS).
5. \`prototype.html\` — Visual & structural ground truth.

### Locked Chapters
${lockedChapterSummary}

### Non-Negotiable Locked Rules (When – Then – Exception)
${lockedRulesSection}

#### Copy-Paste Prompt — Phase 1
\`\`\`markdown
You are building "${projectName}". Read \`.cursorrules\`, \`docs/01_proposal.md\`, \`docs/03_DESIGN.md\`, \`docs/05_ARCH_CONSTITUTION.md\`, and inspect \`prototype.html\` first.

Scaffold the application shell, design tokens, and routing for these ${pages.length} screens:
${pages.map((p, i) => `${i + 1}. ${p.name} (${p.route || '/'}) — ${p.purpose || 'Core screen'}`).join('\n')}

CRITICAL: Enforce every [IMMUTABLE CONSTRAINT - DO NOT ALTER OR OMIT] directive below without modification:
${lockedRules.length > 0 ? lockedRules.map((item, i) => `- Invariant ${i + 1}: WHEN ${item.rule.when || '...'} -> THEN ${item.rule.then || '...'}${item.rule.exception ? ` | EXCEPT WHEN ${item.rule.exception}` : ''}`).join('\n') : '- Preserve all architectural constraints in docs/05_ARCH_CONSTITUTION.md.'}

Do not invent extra screens or install unapproved state libraries. Output the foundational layout and router first.
\`\`\`

---

## Phase 2: Core Domain Workflows

Once the shell compiles cleanly, feed the domain logic and data model specifications:
- **Primary References:** \`docs/02_roadmap.md\`, \`docs/04_SPEC.md\`, \`docs/06_DATA_SCHEMA.md\`
- **Data Entity Fields:** \`${dataColumns.join('`, `')}\`
- **Target Happy Path:** \`${happyPathRaw}\`

### Active Business Rules
${activeRulesPreview}

#### Copy-Paste Prompt — Phase 2
\`\`\`markdown
Read \`docs/02_roadmap.md\`, \`docs/04_SPEC.md\`, and \`docs/06_DATA_SCHEMA.md\`.
Implement the typed domain store and end-to-end workflows for "${projectName}":

1. Define TypeScript interfaces and runtime validation for fields: ${dataColumns.join(', ')}.
2. Implement the core features:
${keyFeaturesRaw.split('\n').map(l => `   - ${l.replace(/^[-*\d.)\s]+/, '').trim()}`).join('\n')}
3. Connect the primary user flow: ${happyPathRaw}
4. Enforce all structured WHEN -> THEN -> EXCEPT WHEN rules from \`docs/04_SPEC.md\` inside both UI validation and store mutations.
\`\`\`

---

## Phase 3: UI & Edge-Case States

Instruct the AI agent to explicitly build and wire all edge-case views verified in the GOGUMA Preview Stage so no blank screens, unhandled errors, or permission leaks ship to production:

#### Copy-Paste Prompt — Phase 3
\`\`\`markdown
Read \`prototype.html\` and \`docs/07_SECURITY.md\`. Implement complete UI state handling across every screen in "${projectName}":

1. **Default (Populated) State**: Render realistic domain records with instant search, filtering, and slide-over detail inspection.
2. **Empty State (0 Records)**: When zero records exist (e.g., first launch or filtered search with 0 hits), display clear domain onboarding guidance and a primary creation CTA instead of an empty table.
3. **Blocked / Error State**: Enforce inline validation banners and blocked-action alerts matching the domain rules—specifically:
   - Trigger: "${primaryErrorRule.when || 'Rule violation detected'}"
   - Blocked UI Behavior: "${primaryErrorRule.then || 'Prevent mutation and display actionable inline error banner'}"
4. **Role-Based Views (Standard User vs. Admin / Operator)**:
   - Standard User: Restrict privileged overrides and administrative actions with clear read-only or permission-guarded indicators.
   - Admin / Operator: Enable privileged override controls (${primaryErrorRule.exception || 'Admin approval & audit visibility'}) and clearly badge elevated actions.
\`\`\`

---

## Phase 4: Domain Expert Verification Checklist

Use this plain-language checklist to test the finished app directly in your browser—no code reading required:

### 1. Business Rule & Exception Checks
${domainQaItems}

### 2. Edge-Case & Role Readiness Checks
- [ ] **Empty State (0 Records):** Clear or filter out all records and verify that helpful guidance + a clear primary action button appear instead of a broken blank screen.
- [ ] **Blocked / Error State:** Intentionally trigger a rule violation (e.g., *"${primaryErrorRule.when || 'invalid or duplicate input'}"*) and confirm the app stops the action and explains why in plain language.
- [ ] **Standard User vs. Admin / Operator:** Switch between a regular user and an admin account and confirm that admin-only overrides and controls are hidden or blocked for standard users.
${extraVerificationLines ? `\n### 3. Project Acceptance Criteria\n${extraVerificationLines}\n` : ''}`;
}

/**
 * Generates a single-click copyable Vibe-Coding Prompt distilled from the tailored 00_EXECUTION_PLAYBOOK.md.
 */
export function generatePlaybookVibePrompt(projectData: ExecutionPlaybookInput): string {
  const { plan, formInputs, lockedChapters = [] } = projectData;
  const projectName =
    projectData.projectName?.trim() ||
    plan.metadata?.projectName?.trim() ||
    getRawInput(formInputs, '1_project_name', 'GOGUMA Project');

  const allRules = collectProjectRules(formInputs, lockedChapters);
  const lockedRules = allRules.filter(r => r.isLocked);
  const unlockedRules = allRules.filter(r => !r.isLocked);
  const dataColumnsRaw = getRawInput(formInputs, '4_data_columns', 'id, title, status, ownerId, createdAt');
  const pages = plan.navigation?.pageStructure || [];

  const lockedSection =
    lockedRules.length > 0
      ? lockedRules
          .map((item, i) =>
            wrapImmutableConstraint(
              `Locked Rule ${String(i + 1).padStart(2, '0')} (${item.sectionTitle}):\n- WHEN: ${
                item.rule.when || '...'
              }\n- THEN: ${item.rule.then || '...'}${
                item.rule.exception ? `\n- EXCEPT WHEN: ${item.rule.exception}` : ''
              }`
            )
          )
          .join('\n\n')
      : '- Preserve all technical and architectural invariants in `docs/05_ARCH_CONSTITUTION.md` and `prototype.html`.';

  const activeSection =
    unlockedRules.length > 0
      ? unlockedRules
          .map(
            (item, i) =>
              `- Rule ${String(i + 1).padStart(2, '0')} (${item.sectionTitle}): WHEN ${item.rule.when || '...'} -> THEN ${
                item.rule.then || '...'
              }${item.rule.exception ? ` | EXCEPT WHEN ${item.rule.exception}` : ''}`
          )
          .join('\n')
      : '- Follow all workflow and schema rules defined in `docs/04_SPEC.md` and `docs/06_DATA_SCHEMA.md`.';

  return `You are the lead software engineer implementing "${projectName}".

Execute the build strictly following \`00_EXECUTION_PLAYBOOK.md\`, \`prototype.html\`, and the 11 specifications in \`docs/\`:

### Phase 1: Foundation & Locked Constraints
1. Read \`.cursorrules\`, \`docs/01_proposal.md\`, \`docs/03_DESIGN.md\`, \`docs/05_ARCH_CONSTITUTION.md\`, and \`prototype.html\`.
2. Scaffold the ${pages.length || 3} primary screens (${pages.map(p => `${p.name} [${p.route || '/'}]`).join(', ') || 'Dashboard, List, Settings'}).
3. Enforce these non-negotiable locked invariants:
${lockedSection}

### Phase 2: Core Domain Workflows
1. Read \`docs/02_roadmap.md\`, \`docs/04_SPEC.md\`, and \`docs/06_DATA_SCHEMA.md\`.
2. Model data fields: ${dataColumnsRaw}
3. Enforce all domain rules:
${activeSection}

### Phase 3: UI & Edge-Case States
Implement and verify all 4 UI states across every screen:
- **Default (Populated):** Realistic records, detail drawer, search/filter, status pipeline.
- **Empty State (0 Records):** Clear first-launch / zero-hit onboarding guidance and primary CTA.
- **Blocked / Error State:** Inline error banners blocking invalid actions per the WHEN/THEN rules.
- **Role-Based Views:** Separate \`Standard User\` permissions from \`Admin / Operator\` override controls.

Begin with Phase 1 now and verify TypeScript + build cleanly before moving to Phase 2.`;
}
