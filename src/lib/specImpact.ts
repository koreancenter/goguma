import { FormInputEntity } from '../types';
import { GOGUMA_CHAPTERS } from './chapterData';
import { getSectionBusinessRules, hasMeaningfulRuleContent } from './businessRulesSerializer';

export type SpecImpactStatus = 'updated' | 'locked' | 'idle';

/**
 * Canonical mapping from each of the generated specification documents
 * to the GOGUMA chapters that feed into it.
 */
export const DOC_CONTRIBUTING_CHAPTERS: Record<string, number[]> = {
  '01_proposal': [1, 2],
  '02_roadmap': [3, 4],
  '03_DESIGN': [5],
  '04_SPEC': [3, 4, 6],
  '05_ARCH_CONSTITUTION': [5, 7],
  '06_DATA_SCHEMA': [4],
  '07_SECURITY': [7],
  '08_TEST_CHECKLIST': [4, 8],
  '09_ENV_SETUP': [7, 8],
  '10_agent': [1, 3, 4, 5, 6, 7],
  '11_system-instructions': [1, 3, 4, 5, 6, 7],
  cursorrules: [3, 4, 5, 7],
};

// Specs that aggregate cross-chapter domain business rules across chapters 1..8
const CROSS_CHAPTER_RULE_DOCS = new Set([
  '04_SPEC',
  '06_DATA_SCHEMA',
  '08_TEST_CHECKLIST',
  '10_agent',
  '11_system-instructions',
  'cursorrules',
]);

/**
 * Computes whether a specification document is affected by a modified chapter ('updated')
 * or protected by a locked chapter / locked rule ('locked').
 */
export function getDocImpactStatus(
  docId: string,
  formInputs?: Record<string, FormInputEntity>,
  lockedChapters: number[] = [],
  updatedChapters: Iterable<number> = []
): SpecImpactStatus {
  const lockedSet = new Set(lockedChapters);
  const updatedSet = updatedChapters instanceof Set ? updatedChapters : new Set(updatedChapters);

  const contributing = new Set<number>(DOC_CONTRIBUTING_CHAPTERS[docId] || []);

  // Cross-chapter rule documents also reflect chapters that define meaningful business rules
  if (formInputs && CROSS_CHAPTER_RULE_DOCS.has(docId)) {
    for (const ch of GOGUMA_CHAPTERS) {
      for (const sec of ch.sections) {
        const rules = getSectionBusinessRules(formInputs[`${ch.id}_${sec.key}`]).filter(hasMeaningfulRuleContent);
        if (rules.length > 0) {
          contributing.add(ch.id);
        }
      }
    }
  }

  // 1. Check if any contributing chapter was modified while unlocked
  for (const chId of contributing) {
    if (updatedSet.has(chId) && !lockedSet.has(chId)) {
      return 'updated';
    }
  }

  // 2. Check if any contributing chapter is locked (via project.lockedChapters or FormInputEntity.isLocked)
  for (const chId of contributing) {
    if (lockedSet.has(chId)) {
      return 'locked';
    }
    const chDef = GOGUMA_CHAPTERS.find(c => c.id === chId);
    if (chDef && formInputs) {
      for (const sec of chDef.sections) {
        const entry = formInputs[`${chId}_${sec.key}`];
        if (entry?.isLocked) return 'locked';
        if (getSectionBusinessRules(entry).some(r => r.isLocked)) {
          return 'locked';
        }
      }
    }
  }

  return 'idle';
}
