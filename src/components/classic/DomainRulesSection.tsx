import React from 'react';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import { DomainBusinessRule } from '../../types';

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
      className="space-y-5 pt-2"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h2
              className={`font-sans font-semibold text-[#111827] tracking-[-0.015em] ${
                largeTextMode ? 'text-xl' : 'text-[18px]'
              }`}
            >
              Domain Rules &amp; Constraints
            </h2>
            {rules.length > 0 && (
              <span className="font-sans text-xs font-medium tabular-nums text-[#9CA3AF]">
                {String(rules.length).padStart(2, '0')}
              </span>
            )}
          </div>
          <p
            className={`text-[#6B7280] font-sans ${
              largeTextMode ? 'text-sm' : 'text-xs'
            }`}
          >
            AI가 반드시 준수해야 할 핵심 업무 규칙
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRule}
          disabled={isParentLocked}
          className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            isParentLocked
              ? 'text-[#9CA3AF] cursor-not-allowed'
              : 'text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#F7F8FA] cursor-pointer'
          }`}
          title={isParentLocked ? '잠금 상태에서는 새 규칙을 추가할 수 없습니다' : '새 도메인 규칙 추가'}
        >
          <span>+ 규칙 추가</span>
        </button>
      </div>

      {/* Rule Cards (No duplicate empty-state box when 0 rules) */}
      {rules.length > 0 && (
        <div className="space-y-4">
          {rules.map((rule, index) => {
            const ruleNumber = String(index + 1).padStart(2, '0');
            const isSelfLocked = Boolean(rule.isLocked);
            const isLocked = isSelfLocked || isParentLocked;

            return (
              <div
                key={rule.id}
                className={`rounded-xl p-5 sm:p-6 space-y-4 transition-colors ${
                  isLocked ? 'bg-[#F7F8FA] ring-1 ring-[#1E3A8A]/15' : 'bg-[#F7F8FA]'
                }`}
              >
                {/* Card Header Row */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                    <span className="font-sans text-xs font-semibold tabular-nums text-[#1E3A8A]">
                      Rule {ruleNumber}
                    </span>
                    {isLocked && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E3A8A] text-[11px] font-medium whitespace-nowrap">
                        <Lock size={10} className="shrink-0" />
                        <span>Locked · AI Protected</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleLock(rule.id)}
                      disabled={isParentLocked}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                        isParentLocked
                          ? 'text-[#9CA3AF] cursor-not-allowed'
                          : isSelfLocked
                          ? 'text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] cursor-pointer'
                          : 'text-[#6B7280] hover:text-[#1E3A8A] hover:bg-[#FFFFFF] cursor-pointer'
                      }`}
                      title={
                        isParentLocked
                          ? '상위 챕터가 잠금되어 있습니다'
                          : isSelfLocked
                          ? 'Unlock rule for editing'
                          : 'Lock Spec to protect rule from edits & AI drift'
                      }
                      aria-label={isSelfLocked ? `Rule ${ruleNumber} Unlock` : `Rule ${ruleNumber} Lock Spec`}
                    >
                      {isSelfLocked ? (
                        <>
                          <Unlock size={11} />
                          <span>Unlock</span>
                        </>
                      ) : (
                        <>
                          <Lock size={11} />
                          <span>Lock Spec</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={isLocked}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors shrink-0 ${
                        isLocked
                          ? 'opacity-35 cursor-not-allowed text-[#9CA3AF]'
                          : 'text-[#6B7280] hover:text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer'
                      }`}
                      title={isLocked ? '잠금 상태에서는 삭제할 수 없습니다' : '규칙 삭제'}
                      aria-label={`Rule ${ruleNumber} 삭제`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* When - Then - Except When Fields */}
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`${rule.id}_when`}
                      className="block text-[11px] font-sans font-semibold tracking-wider text-[#1E3A8A] uppercase"
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
                      className={`w-full rounded-lg px-4 py-3 font-sans placeholder:text-[#9CA3AF] outline-none transition-all ${
                        largeTextMode ? 'text-base' : 'text-sm'
                      } ${
                        isLocked
                          ? 'bg-[#F7F8FA] text-[#4B5563] cursor-not-allowed border border-[#E5E7EB]/80'
                          : 'bg-[#FFFFFF] text-[#111827] focus:ring-2 focus:ring-[#1E3A8A]/15'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor={`${rule.id}_then`}
                      className="block text-[11px] font-sans font-semibold tracking-wider text-[#111827] uppercase"
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
                      className={`w-full rounded-lg px-4 py-3 font-sans placeholder:text-[#9CA3AF] outline-none transition-all ${
                        largeTextMode ? 'text-base' : 'text-sm'
                      } ${
                        isLocked
                          ? 'bg-[#F7F8FA] text-[#4B5563] cursor-not-allowed border border-[#E5E7EB]/80'
                          : 'bg-[#FFFFFF] text-[#111827] focus:ring-2 focus:ring-[#1E3A8A]/15'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor={`${rule.id}_exception`}
                      className="block text-[11px] font-sans font-semibold tracking-wider text-[#4B5563] uppercase"
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
                      className={`w-full rounded-lg px-4 py-3 font-sans placeholder:text-[#9CA3AF] outline-none transition-all ${
                        largeTextMode ? 'text-base' : 'text-sm'
                      } ${
                        isLocked
                          ? 'bg-[#F7F8FA] text-[#4B5563] cursor-not-allowed border border-[#E5E7EB]/80'
                          : 'bg-[#FFFFFF] text-[#111827] focus:ring-2 focus:ring-[#1E3A8A]/15'
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
