import { DomainBusinessRule, FormInputEntity } from '../types/schema';
import { GOGUMA_CHAPTERS } from './chapterData';

/**
 * Safely normalizes any raw or legacy businessRules value to a valid array.
 * Guarantees [] fallback so legacy IndexedDB records load without migration errors.
 */
export function normalizeBusinessRules(raw: unknown): DomainBusinessRule[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item, idx) => ({
      id: typeof item.id === 'string' && item.id.trim() ? item.id : `rule_legacy_${idx + 1}`,
      when: typeof item.when === 'string' ? item.when : '',
      then: typeof item.then === 'string' ? item.then : '',
      exception: typeof item.exception === 'string' ? item.exception : '',
      isLocked: Boolean(item.isLocked),
    }));
}

/**
 * Safely retrieves structured business rules for a FormInputEntity, defaulting to [].
 */
export function getSectionBusinessRules(entity?: Partial<FormInputEntity> | null): DomainBusinessRule[] {
  return normalizeBusinessRules(entity?.businessRules);
}

/**
 * Returns true if at least one of WHEN, THEN, or EXCEPT WHEN contains user text.
 */
export function hasMeaningfulRuleContent(rule: DomainBusinessRule): boolean {
  return Boolean(rule.when.trim() || rule.then.trim() || rule.exception.trim());
}

/**
 * Deterministically serializes an array of DomainBusinessRule objects into
 * structured Markdown constraint blocks suitable for 3-Tier AI prompts and 11-spec files.
 */
export function serializeRulesToMarkdown(
  rules: DomainBusinessRule[],
  options?: { headingPrefix?: string; includeEmpty?: boolean }
): string {
  const validRules = options?.includeEmpty
    ? rules
    : rules.filter(hasMeaningfulRuleContent);

  if (validRules.length === 0) return '';

  const prefix = options?.headingPrefix ?? '-';

  return validRules
    .map((rule, index) => {
      const ruleNum = String(index + 1).padStart(2, '0');
      const lockBadge = rule.isLocked ? ' `[LOCKED]`' : '';
      const whenText = rule.when.trim() || '_(Unspecified trigger condition)_';
      const thenText = rule.then.trim() || '_(Unspecified expected behavior)_';
      const exceptionText = rule.exception.trim();

      const lines = [
        `${prefix} **Rule ${ruleNum}**${lockBadge}`,
        `  - **WHEN:** ${whenText}`,
        `  - **THEN:** ${thenText}`,
      ];

      if (exceptionText) {
        lines.push(`  - **EXCEPT WHEN:** ${exceptionText}`);
      }

      return lines.join('\n');
    })
    .join('\n');
}

/**
 * Serializes structured rules for a single chapter/section key.
 */
export function serializeSectionBusinessRulesToMarkdown(
  chapterId: number,
  sectionKey: string,
  formInputs?: Record<string, FormInputEntity>
): string {
  if (!formInputs) return '';
  const entity = formInputs[`${chapterId}_${sectionKey}`];
  const rules = getSectionBusinessRules(entity).filter(hasMeaningfulRuleContent);
  if (rules.length === 0) return '';
  return serializeRulesToMarkdown(rules);
}

/**
 * Deterministically serializes all structured business rules across all 8 chapters,
 * iterating strictly in canonical GOGUMA_CHAPTERS -> sections order.
 */
export function serializeAllBusinessRulesToMarkdown(
  formInputs?: Record<string, FormInputEntity>
): string {
  if (!formInputs) return '';

  const chapterBlocks: string[] = [];

  for (const chapter of GOGUMA_CHAPTERS) {
    for (const section of chapter.sections) {
      const key = `${chapter.id}_${section.key}`;
      const rules = getSectionBusinessRules(formInputs[key]).filter(hasMeaningfulRuleContent);
      if (rules.length === 0) continue;

      const serialized = serializeRulesToMarkdown(rules);
      chapterBlocks.push(
        `### Chapter 0${chapter.id} · ${section.title} (\`${key}\`)\n${serialized}`
      );
    }
  }

  return chapterBlocks.join('\n\n');
}

/**
 * Generates deterministic QA test assertions from all defined When-Then-Exception rules.
 */
export function serializeBusinessRulesToTestAssertions(
  formInputs?: Record<string, FormInputEntity>
): string {
  if (!formInputs) return '';

  const assertions: string[] = [];
  let counter = 1;

  for (const chapter of GOGUMA_CHAPTERS) {
    for (const section of chapter.sections) {
      const key = `${chapter.id}_${section.key}`;
      const rules = getSectionBusinessRules(formInputs[key]).filter(hasMeaningfulRuleContent);
      for (const rule of rules) {
        const num = String(counter++).padStart(2, '0');
        const whenText = rule.when.trim() || 'Condition triggered';
        const thenText = rule.then.trim() || 'Expected system behavior verified';
        const exceptionText = rule.exception.trim();
        const lockNote = rule.isLocked ? ' [LOCKED INVARIANT]' : '';

        let line = `- [ ] **BR-${num}${lockNote}** (${section.title}): Given **WHEN** ${whenText}, verify **THEN** ${thenText}.`;
        if (exceptionText) {
          line += ` Verify override **EXCEPT WHEN** ${exceptionText}.`;
        }
        assertions.push(line);
      }
    }
  }

  return assertions.join('\n');
}

/**
 * Builds deterministic chapter context combining TipTap prose and serialized
 * Domain Business Rules Markdown constraint blocks for the 3-Tier AI generator.
 */
export function buildChapterAIContext(
  chapterId: number,
  sectionKey: string,
  formInputs?: Record<string, FormInputEntity>,
  projectName?: string
): string {
  const chapter = GOGUMA_CHAPTERS.find(c => c.id === chapterId) || GOGUMA_CHAPTERS[0];
  const section = chapter.sections.find(s => s.key === sectionKey) || chapter.sections[0];
  const key = `${chapter.id}_${section.key}`;
  const entity = formInputs?.[key];
  const rawProse = entity?.userRawInput?.trim() || '';
  const rulesBlock = serializeSectionBusinessRulesToMarkdown(chapter.id, section.key, formInputs);

  const parts: string[] = [
    `# Chapter 0${chapter.id}: ${chapter.title} (${chapter.engTitle})`,
    `## Section: ${section.title} (\`${section.key}\`)`,
  ];

  if (projectName?.trim()) {
    parts.push(`Project: ${projectName.trim()}`);
  }

  parts.push(`### Narrative Specification\n${rawProse || '(No narrative prose provided yet)'}`);

  if (rulesBlock) {
    parts.push(`### Domain Rules & Constraints (Deterministic Guardrails)\n${rulesBlock}`);
  }

  return parts.join('\n\n');
}
