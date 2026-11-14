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

export const IMMUTABLE_CONSTRAINT_START = '[IMMUTABLE CONSTRAINT - DO NOT ALTER OR OMIT]';
export const IMMUTABLE_CONSTRAINT_END = '[/IMMUTABLE CONSTRAINT - DO NOT ALTER OR OMIT]';

export function wrapImmutableConstraint(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return '';
  return `${IMMUTABLE_CONSTRAINT_START}\n${trimmed}\n${IMMUTABLE_CONSTRAINT_END}`;
}

export function isChapterOrSectionLocked(
  chapterId: number,
  sectionKey: string,
  formInputs?: Record<string, FormInputEntity>,
  lockedChapters?: number[]
): boolean {
  if (lockedChapters?.includes(chapterId)) return true;
  if (formInputs?.[`${chapterId}_${sectionKey}`]?.isLocked) return true;
  return false;
}

/**
 * Deterministically serializes an array of DomainBusinessRule objects into
 * structured Markdown constraint blocks suitable for 3-Tier AI prompts and 11-spec files.
 * Wraps any locked rule in an explicit [IMMUTABLE CONSTRAINT - DO NOT ALTER OR OMIT] directive.
 */
export function serializeRulesToMarkdown(
  rules: DomainBusinessRule[],
  options?: { headingPrefix?: string; includeEmpty?: boolean; forceLockAll?: boolean }
): string {
  const validRules = options?.includeEmpty
    ? rules
    : rules.filter(hasMeaningfulRuleContent);

  if (validRules.length === 0) return '';

  const prefix = options?.headingPrefix ?? '-';

  return validRules
    .map((rule, index) => {
      const ruleNum = String(index + 1).padStart(2, '0');
      const isRuleLocked = Boolean(rule.isLocked || options?.forceLockAll);
      const lockBadge = isRuleLocked ? ' `[LOCKED · AI PROTECTED]`' : '';
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

      const block = lines.join('\n');
      return isRuleLocked ? wrapImmutableConstraint(block) : block;
    })
    .join('\n');
}

/**
 * Serializes structured rules for a single chapter/section key.
 */
export function serializeSectionBusinessRulesToMarkdown(
  chapterId: number,
  sectionKey: string,
  formInputs?: Record<string, FormInputEntity>,
  lockedChapters?: number[]
): string {
  if (!formInputs) return '';
  const entity = formInputs[`${chapterId}_${sectionKey}`];
  const rules = getSectionBusinessRules(entity).filter(hasMeaningfulRuleContent);
  if (rules.length === 0) return '';
  const forceLockAll = isChapterOrSectionLocked(chapterId, sectionKey, formInputs, lockedChapters);
  return serializeRulesToMarkdown(rules, { forceLockAll });
}

/**
 * Deterministically serializes all structured business rules across all 8 chapters,
 * iterating strictly in canonical GOGUMA_CHAPTERS -> sections order.
 */
export function serializeAllBusinessRulesToMarkdown(
  formInputs?: Record<string, FormInputEntity>,
  lockedChapters?: number[]
): string {
  if (!formInputs) return '';

  const chapterBlocks: string[] = [];

  for (const chapter of GOGUMA_CHAPTERS) {
    for (const section of chapter.sections) {
      const key = `${chapter.id}_${section.key}`;
      const rules = getSectionBusinessRules(formInputs[key]).filter(hasMeaningfulRuleContent);
      if (rules.length === 0) continue;

      const isLocked = isChapterOrSectionLocked(chapter.id, section.key, formInputs, lockedChapters);
      const serialized = serializeRulesToMarkdown(rules, { forceLockAll: isLocked });
      const lockTag = isLocked ? ' [LOCKED · AI PROTECTED]' : '';
      chapterBlocks.push(
        `### Chapter 0${chapter.id} · ${section.title} (\`${key}\`)${lockTag}\n${serialized}`
      );
    }
  }

  return chapterBlocks.join('\n\n');
}

/**
 * Generates deterministic QA test assertions from all defined When-Then-Exception rules.
 */
export function serializeBusinessRulesToTestAssertions(
  formInputs?: Record<string, FormInputEntity>,
  lockedChapters?: number[]
): string {
  if (!formInputs) return '';

  const assertions: string[] = [];
  let counter = 1;

  for (const chapter of GOGUMA_CHAPTERS) {
    for (const section of chapter.sections) {
      const key = `${chapter.id}_${section.key}`;
      const isSectionLocked = isChapterOrSectionLocked(chapter.id, section.key, formInputs, lockedChapters);
      const rules = getSectionBusinessRules(formInputs[key]).filter(hasMeaningfulRuleContent);
      for (const rule of rules) {
        const num = String(counter++).padStart(2, '0');
        const whenText = rule.when.trim() || 'Condition triggered';
        const thenText = rule.then.trim() || 'Expected system behavior verified';
        const exceptionText = rule.exception.trim();
        const isLocked = Boolean(rule.isLocked || isSectionLocked);
        const lockNote = isLocked ? ' [LOCKED INVARIANT]' : '';

        let line = `- [ ] **BR-${num}${lockNote}** (${section.title}): Given **WHEN** ${whenText}, verify **THEN** ${thenText}.`;
        if (exceptionText) {
          line += ` Verify override **EXCEPT WHEN** ${exceptionText}.`;
        }
        assertions.push(isLocked ? wrapImmutableConstraint(line) : line);
      }
    }
  }

  return assertions.join('\n');
}

/**
 * Builds deterministic chapter context combining TipTap prose, structured Domain Business Rules,
 * and project-wide [IMMUTABLE CONSTRAINT - DO NOT ALTER OR OMIT] guardrails for the 3-Tier AI generator.
 */
export function buildChapterAIContext(
  chapterId: number,
  sectionKey: string,
  formInputs?: Record<string, FormInputEntity>,
  projectName?: string,
  lockedChapters?: number[]
): string {
  const chapter = GOGUMA_CHAPTERS.find(c => c.id === chapterId) || GOGUMA_CHAPTERS[0];
  const section = chapter.sections.find(s => s.key === sectionKey) || chapter.sections[0];
  const key = `${chapter.id}_${section.key}`;
  const entity = formInputs?.[key];
  const rawProse = entity?.userRawInput?.trim() || '';
  const isCurrentLocked = isChapterOrSectionLocked(chapter.id, section.key, formInputs, lockedChapters);
  const rulesBlock = serializeSectionBusinessRulesToMarkdown(
    chapter.id,
    section.key,
    formInputs,
    lockedChapters
  );

  const parts: string[] = [
    `# Chapter 0${chapter.id}: ${chapter.title} (${chapter.engTitle})`,
    `## Section: ${section.title} (\`${section.key}\`)${isCurrentLocked ? ' [LOCKED · AI PROTECTED]' : ''}`,
  ];

  if (projectName?.trim()) {
    parts.push(`Project: ${projectName.trim()}`);
  }

  const narrativeText = rawProse || '(No narrative prose provided yet)';
  parts.push(
    `### Narrative Specification\n${
      isCurrentLocked && rawProse ? wrapImmutableConstraint(narrativeText) : narrativeText
    }`
  );

  if (rulesBlock) {
    parts.push(`### Domain Rules & Constraints (Deterministic Guardrails)\n${rulesBlock}`);
  }

  // Cross-chapter locked spec guardrails to prevent AI context drift across iterative edits
  if (formInputs) {
    const lockedProjectConstraints: string[] = [];

    for (const ch of GOGUMA_CHAPTERS) {
      for (const sec of ch.sections) {
        const secKey = `${ch.id}_${sec.key}`;
        if (secKey === key) continue;
        const secEntity = formInputs[secKey];
        const secLocked = isChapterOrSectionLocked(ch.id, sec.key, formInputs, lockedChapters);
        const secProse = secEntity?.userRawInput?.trim() || '';
        const secRules = getSectionBusinessRules(secEntity).filter(hasMeaningfulRuleContent);
        const lockedSecRules = secLocked ? secRules : secRules.filter(r => Boolean(r.isLocked));

        const secLines: string[] = [];
        if (secLocked && secProse) {
          secLines.push(wrapImmutableConstraint(`#### Chapter 0${ch.id} · ${sec.title} (\`${secKey}\`)\n${secProse}`));
        }
        if (lockedSecRules.length > 0) {
          secLines.push(
            `#### Chapter 0${ch.id} · ${sec.title} Locked Rules\n${serializeRulesToMarkdown(lockedSecRules, {
              forceLockAll: true,
            })}`
          );
        }
        if (secLines.length > 0) {
          lockedProjectConstraints.push(secLines.join('\n\n'));
        }
      }
    }

    if (lockedProjectConstraints.length > 0) {
      parts.push(
        `### Locked Spec Guardrails (Project-Wide Immutable Constraints)\n${lockedProjectConstraints.join('\n\n')}`
      );
    }
  }

  return parts.join('\n\n');
}
