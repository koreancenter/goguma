import React from 'react';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import { DomainBusinessRule } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export interface DomainRulesSectionProps {
  rules: DomainBusinessRule[];
  onChange: (rules: DomainBusinessRule[]) => void;
  largeTextMode?: boolean;
  isParentLocked?: boolean;
}

const createRuleId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `rule_${crypto.randomUUID()}`;
  }
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const DomainRulesSection: React.FC<DomainRulesSectionProps> = ({
  rules,
  onChange,
  largeTextMode = false,
  isParentLocked = false,
}) => {
  const { pick } = useLanguage();
  const handleAddRule = () => {
    if (isParentLocked) return;
    const newRule: DomainBusinessRule = {
      id: createRuleId(),
      when: '',
      then: '',
      exception: '',
      isLocked: false,
    };
    onChange([...rules, newRule]);
  };

  const handleUpdateField = (
    id: string,
    field: 'when' | 'then' | 'exception',
    value: string
  ) => {
    if (isParentLocked) return;
    onChange(
      rules.map((rule) => {
        if (rule.id !== id || rule.isLocked) return rule;
        return { ...rule, [field]: value };
      })
    );
  };

  const handleToggleLock = (id: string) => {
    if (isParentLocked) return;
    onChange(
      rules.map((rule) =>
        rule.id === id ? { ...rule, isLocked: !rule.isLocked } : rule
      )
    );
  };

  const handleDeleteRule = (id: string) => {
    if (isParentLocked) return;
    const target = rules.find((r) => r.id === id);
    if (!target || target.isLocked) return;
    onChange(rules.filter((rule) => rule.id !== id));
  };

  return (
    <section
      aria-label="Domain Rules and Constraints"
      className="space-y-8"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-[var(--theme-ink-strong)]">
        <div className="space-y-2 min-w-0">
          <div className="flex items-baseline gap-3.5">
            <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.08em]">
              02
            </span>
            <h2
              className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.02em] ${
                largeTextMode ? 'text-[26px] sm:text-[30px]' : 'text-[22px] sm:text-[26px]'
              }`}
            >
              Domain Rules &amp; Constraints
            </h2>
            {rules.length > 0 && (
              <span className="text-[16px] sm:text-[17px] font-bold tabular-nums text-[var(--theme-ink-muted)]">
                {String(rules.length).padStart(2, '0')}
              </span>
            )}
          </div>
          <p
            className={`text-[var(--theme-ink-secondary)] pl-8 ${
              largeTextMode ? 'text-[19px] sm:text-[21px]' : 'text-[17px] sm:text-[19px]'
            }`}
          >
            {pick({
              ko: 'AI가 반드시 준수해야 할 핵심 업무 규칙',
              en: 'Core business rules and invariants that AI must strictly enforce',
              ja: 'AIが必ず遵守すべき中核業務ルール',
              id: 'Aturan bisnis inti yang wajib dipatuhi AI',
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRule}
          disabled={isParentLocked}
          className={`inline-flex items-center justify-center px-4 py-2.5 rounded-none text-[16px] font-bold transition-colors whitespace-nowrap shrink-0 border ${
            isParentLocked
              ? 'text-[var(--theme-ink-muted)] border-[var(--theme-border-hairline)] cursor-not-allowed'
              : 'text-[var(--theme-ink-primary)] border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-active-bg)] hover:text-[var(--theme-active-text)] cursor-pointer'
          }`}
          title={
            isParentLocked
              ? pick({ ko: '잠금 상태에서는 새 규칙을 추가할 수 없습니다', en: 'Cannot add rules while locked', ja: 'ロック中はルールを追加できません', id: 'Tidak dapat menambah aturan saat terkunci' })
              : pick({ ko: '새 도메인 규칙 추가', en: 'Add new domain rule', ja: '新しいドメインルールを追加', id: 'Tambah aturan domain baru' })
          }
        >
          <span>{pick({ ko: '+ 규칙 추가', en: '+ Add Rule', ja: '+ ルール追加', id: '+ Tambah Aturan' })}</span>
        </button>
      </div>

      {/* Rule Blocks (Sharp Editorial Architecture) */}
      {rules.length > 0 && (
        <div className="space-y-6">
          {rules.map((rule, index) => {
            const ruleNumber = String(index + 1).padStart(2, '0');
            const isSelfLocked = Boolean(rule.isLocked);
            const isLocked = isSelfLocked || isParentLocked;

            return (
              <div
                key={rule.id}
                className={`rounded-none border border-t-2 border-t-[var(--theme-ink-strong)] p-6 sm:p-8 space-y-6 transition-colors ${
                  isLocked ? 'bg-[var(--theme-stage)] border-[var(--theme-border-strong)]' : 'bg-[var(--theme-stage)] border-[var(--theme-border-hairline)]'
                }`}
              >
                {/* Card Header Row */}
                <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-[var(--theme-border-hairline)]">
                  <div className="flex items-center gap-3.5 min-w-0 flex-wrap">
                    <span className="text-[17px] sm:text-[18px] font-extrabold tabular-nums tracking-[0.06em] uppercase text-[var(--theme-ink-strong)]">
                      RULE {ruleNumber}
                    </span>
                    {isLocked && (
                      <span className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[var(--theme-danger)] whitespace-nowrap">
                        <Lock size={14} className="shrink-0" />
                        <span>{pick({ ko: '잠금 보호 중', en: 'Locked', ja: 'ロック保護中', id: 'Terkunci' })}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleLock(rule.id)}
                      disabled={isParentLocked}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-none text-[15px] font-bold transition-colors whitespace-nowrap border ${
                        isParentLocked
                          ? 'text-[var(--theme-ink-muted)] border-[var(--theme-border-hairline)] cursor-not-allowed'
                          : isSelfLocked
                          ? 'text-[var(--theme-active-text)] bg-[var(--theme-active-bg)] border-[var(--theme-ink-strong)] hover:bg-[var(--theme-hover-bg)] hover:border-[var(--theme-hover-bg)] cursor-pointer'
                          : 'text-[var(--theme-ink-primary)] bg-[var(--theme-elevated)] border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)] cursor-pointer'
                      }`}
                      title={
                        isParentLocked
                          ? pick({ ko: '상위 챕터가 잠금되어 있습니다', en: 'Parent chapter is locked', ja: '上位チャプターがロックされています', id: 'Bab induk terkunci' })
                          : isSelfLocked
                          ? pick({ ko: '편집을 위해 규칙 잠금 해제', en: 'Unlock rule for editing', ja: '編集のためロック解除', id: 'Buka kunci aturan' })
                          : pick({ ko: '규칙 사양 잠금 (AI drift 방지)', en: 'Lock rule to prevent edits & AI drift', ja: 'ルールをロックして変更・AIドリフトを防止', id: 'Kunci aturan untuk melindungi dari perubahan' })
                      }
                      aria-label={isSelfLocked ? `Rule ${ruleNumber} Unlock` : `Rule ${ruleNumber} Lock Spec`}
                    >
                      {isSelfLocked ? (
                        <>
                          <Unlock size={14} />
                          <span>{pick({ ko: 'Unlock', en: 'Unlock', ja: '解除', id: 'Buka Kunci' })}</span>
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          <span>{pick({ ko: 'Lock Spec', en: 'Lock Spec', ja: 'ロック', id: 'Kunci' })}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={isLocked}
                      className={`inline-flex items-center justify-center h-10 w-10 rounded-none border border-[var(--theme-border-hairline)] transition-colors shrink-0 ${
                        isLocked
                          ? 'opacity-35 cursor-not-allowed text-[var(--theme-ink-muted)] bg-[var(--theme-subtle)]'
                          : 'text-[var(--theme-ink-secondary)] bg-[var(--theme-elevated)] hover:text-[var(--theme-hover-text)] hover:bg-[var(--theme-hover-bg)] hover:border-[var(--theme-hover-bg)] cursor-pointer'
                      }`}
                      title={
                        isLocked
                          ? pick({ ko: '잠금 상태에서는 삭제할 수 없습니다', en: 'Cannot delete while locked', ja: 'ロック中は削除できません', id: 'Tidak dapat dihapus saat terkunci' })
                          : pick({ ko: '규칙 삭제', en: 'Delete rule', ja: 'ルール削除', id: 'Hapus aturan' })
                      }
                      aria-label={`Rule ${ruleNumber} ${pick({ ko: '삭제', en: 'Delete', ja: '削除', id: 'Hapus' })}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* When - Then - Except When Fields */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor={`${rule.id}_when`}
                      className="block text-[15px] font-extrabold tracking-[0.08em] text-[var(--theme-ink-strong)] uppercase"
                    >
                      WHEN (Trigger / Condition)
                    </label>
                    <input
                      id={`${rule.id}_when`}
                      type="text"
                      value={rule.when}
                      readOnly={isLocked}
                      disabled={isLocked}
                      onChange={(e) => handleUpdateField(rule.id, 'when', e.target.value)}
                      placeholder="A patient requests an appointment slot that is already booked"
                      className={`w-full rounded-none px-4 py-3.5 font-sans placeholder:text-[var(--theme-ink-muted)] outline-none transition-colors border ${
                        largeTextMode ? 'text-[20px]' : 'text-[18px]'
                      } ${
                        isLocked
                          ? 'bg-[var(--theme-subtle)] text-[var(--theme-ink-secondary)] cursor-not-allowed border-[var(--theme-border-hairline)]'
                          : 'bg-[var(--theme-elevated)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`${rule.id}_then`}
                      className="block text-[15px] font-extrabold tracking-[0.08em] text-[var(--theme-ink-strong)] uppercase"
                    >
                      THEN (Expected Behavior)
                    </label>
                    <input
                      id={`${rule.id}_then`}
                      type="text"
                      value={rule.then}
                      readOnly={isLocked}
                      disabled={isLocked}
                      onChange={(e) => handleUpdateField(rule.id, 'then', e.target.value)}
                      placeholder="Block double-booking and suggest the next 3 available slots"
                      className={`w-full rounded-none px-4 py-3.5 font-sans placeholder:text-[var(--theme-ink-muted)] outline-none transition-colors border ${
                        largeTextMode ? 'text-[20px]' : 'text-[18px]'
                      } ${
                        isLocked
                          ? 'bg-[var(--theme-subtle)] text-[var(--theme-ink-secondary)] cursor-not-allowed border-[var(--theme-border-hairline)]'
                          : 'bg-[var(--theme-elevated)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`${rule.id}_exception`}
                      className="block text-[15px] font-extrabold tracking-[0.08em] text-[var(--theme-ink-secondary)] uppercase"
                    >
                      EXCEPT WHEN (Edge Case / Override)
                    </label>
                    <input
                      id={`${rule.id}_exception`}
                      type="text"
                      value={rule.exception}
                      readOnly={isLocked}
                      disabled={isLocked}
                      onChange={(e) => handleUpdateField(rule.id, 'exception', e.target.value)}
                      placeholder="Emergency triage override is enabled by an admin"
                      className={`w-full rounded-none px-4 py-3.5 font-sans placeholder:text-[var(--theme-ink-muted)] outline-none transition-colors border ${
                        largeTextMode ? 'text-[20px]' : 'text-[18px]'
                      } ${
                        isLocked
                          ? 'bg-[var(--theme-subtle)] text-[var(--theme-ink-secondary)] cursor-not-allowed border-[var(--theme-border-hairline)]'
                          : 'bg-[var(--theme-elevated)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DomainRulesSection;
