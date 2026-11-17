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
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="text-[11px] font-sans tabular-nums text-[#8C8B85] tracking-[0.12em]">
              02
            </span>
            <h2
              className={`font-sans font-semibold text-[#111111] tracking-[-0.015em] ${
                largeTextMode ? 'text-xl' : 'text-[17px]'
              }`}
            >
              Domain Rules &amp; Constraints
            </h2>
            {rules.length > 0 && (
              <span className="font-sans text-xs font-medium tabular-nums text-[#8C8B85]">
                {String(rules.length).padStart(2, '0')}
              </span>
            )}
          </div>
          <p
            className={`text-[#52524E] font-sans pl-6 ${
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
          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-[2px] text-xs font-medium transition-colors whitespace-nowrap shrink-0 border ${
            isParentLocked
              ? 'text-[#8C8B85] border-[#E4E2DC] cursor-not-allowed'
              : 'text-[#111111] border-[#CBC8BF] hover:border-[#111111] hover:bg-[#F6F5F1] cursor-pointer'
          }`}
          title={isParentLocked ? '잠금 상태에서는 새 규칙을 추가할 수 없습니다' : '새 도메인 규칙 추가'}
        >
          <span>+ 규칙 추가</span>
        </button>
      </div>

      {/* Rule Blocks (Sharp Editorial Architecture) */}
      {rules.length > 0 && (
        <div className="space-y-4">
          {rules.map((rule, index) => {
            const ruleNumber = String(index + 1).padStart(2, '0');
            const isSelfLocked = Boolean(rule.isLocked);
            const isLocked = isSelfLocked || isParentLocked;

            return (
              <div
                key={rule.id}
                className={`rounded-[2px] border p-5 sm:p-6 space-y-4 transition-colors ${
                  isLocked ? 'bg-[#F6F5F1] border-[#CBC8BF]' : 'bg-[#F6F5F1] border-[#E4E2DC]'
                }`}
              >
                {/* Card Header Row */}
                <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-[#E4E2DC]">
                  <div className="flex items-center gap-3 min-w-0 flex-wrap">
                    <span className="font-sans text-xs font-semibold tabular-nums tracking-[0.08em] uppercase text-[#111111]">
                      Rule {ruleNumber}
                    </span>
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8B261D] whitespace-nowrap">
                        <Lock size={10} className="shrink-0" />
                        <span>Locked · AI Protected</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleLock(rule.id)}
                      disabled={isParentLocked}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
                        isParentLocked
                          ? 'text-[#8C8B85] cursor-not-allowed'
                          : isSelfLocked
                          ? 'text-[#FFFFFF] bg-[#111111] hover:bg-[#2A2A28] cursor-pointer'
                          : 'text-[#52524E] hover:text-[#111111] hover:bg-[#FFFFFF] cursor-pointer'
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
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-[2px] transition-colors shrink-0 ${
                        isLocked
                          ? 'opacity-35 cursor-not-allowed text-[#8C8B85]'
                          : 'text-[#52524E] hover:text-[#8B261D] hover:bg-[#FBF3F2] cursor-pointer'
                      }`}
                      title={isLocked ? '잠금 상태에서는 삭제할 수 없습니다' : '규칙 삭제'}
                      aria-label={`Rule ${ruleNumber} 삭제`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* When - Then - Except When Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`${rule.id}_when`}
                      className="block text-[11px] font-sans font-semibold tracking-[0.12em] text-[#111111] uppercase"
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
                      className={`w-full rounded-[2px] px-3.5 py-2.5 font-sans placeholder:text-[#8C8B85] outline-none transition-colors border ${
                        largeTextMode ? 'text-base' : 'text-sm'
                      } ${
                        isLocked
                          ? 'bg-[#EFEDE7] text-[#52524E] cursor-not-allowed border-[#E4E2DC]'
                          : 'bg-[#FFFFFF] text-[#111111] border-[#E4E2DC] focus:border-[#111111]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor={`${rule.id}_then`}
                      className="block text-[11px] font-sans font-semibold tracking-[0.12em] text-[#111111] uppercase"
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
                      className={`w-full rounded-[2px] px-3.5 py-2.5 font-sans placeholder:text-[#8C8B85] outline-none transition-colors border ${
                        largeTextMode ? 'text-base' : 'text-sm'
                      } ${
                        isLocked
                          ? 'bg-[#EFEDE7] text-[#52524E] cursor-not-allowed border-[#E4E2DC]'
                          : 'bg-[#FFFFFF] text-[#111111] border-[#E4E2DC] focus:border-[#111111]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor={`${rule.id}_exception`}
                      className="block text-[11px] font-sans font-semibold tracking-[0.12em] text-[#52524E] uppercase"
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
                      className={`w-full rounded-[2px] px-3.5 py-2.5 font-sans placeholder:text-[#8C8B85] outline-none transition-colors border ${
                        largeTextMode ? 'text-base' : 'text-sm'
                      } ${
                        isLocked
                          ? 'bg-[#EFEDE7] text-[#52524E] cursor-not-allowed border-[#E4E2DC]'
                          : 'bg-[#FFFFFF] text-[#111111] border-[#E4E2DC] focus:border-[#111111]'
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
