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
      className="space-y-8"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-[#000000]">
        <div className="space-y-2 min-w-0">
          <div className="flex items-baseline gap-3.5">
            <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[#52524E] tracking-[0.08em]">
              02
            </span>
            <h2
              className={`font-extrabold text-[#000000] tracking-[-0.02em] ${
                largeTextMode ? 'text-[26px] sm:text-[30px]' : 'text-[22px] sm:text-[26px]'
              }`}
            >
              Domain Rules &amp; Constraints
            </h2>
            {rules.length > 0 && (
              <span className="text-[16px] sm:text-[17px] font-bold tabular-nums text-[#787772]">
                {String(rules.length).padStart(2, '0')}
              </span>
            )}
          </div>
          <p
            className={`text-[#52524E] pl-8 ${
              largeTextMode ? 'text-[19px] sm:text-[21px]' : 'text-[17px] sm:text-[19px]'
            }`}
          >
            AI가 반드시 준수해야 할 핵심 업무 규칙
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRule}
          disabled={isParentLocked}
          className={`inline-flex items-center justify-center px-4 py-2.5 rounded-none text-[16px] font-bold transition-colors whitespace-nowrap shrink-0 border ${
            isParentLocked
              ? 'text-[#8C8B85] border-[#E4E2DC] cursor-not-allowed'
              : 'text-[#111111] border-[#000000] bg-[#FFFFFF] hover:bg-[#000000] hover:text-[#FFE600] cursor-pointer'
          }`}
          title={isParentLocked ? '잠금 상태에서는 새 규칙을 추가할 수 없습니다' : '새 도메인 규칙 추가'}
        >
          <span>+ 규칙 추가</span>
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
                className={`rounded-none border border-t-2 border-t-[#000000] p-6 sm:p-8 space-y-6 transition-colors ${
                  isLocked ? 'bg-[#F6F5F1] border-[#CBC8BF]' : 'bg-[#F6F5F1] border-[#E4E2DC]'
                }`}
              >
                {/* Card Header Row */}
                <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-[#E4E2DC]">
                  <div className="flex items-center gap-3.5 min-w-0 flex-wrap">
                    <span className="text-[17px] sm:text-[18px] font-extrabold tabular-nums tracking-[0.06em] uppercase text-[#000000]">
                      RULE {ruleNumber}
                    </span>
                    {isLocked && (
                      <span className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[#DC2626] whitespace-nowrap">
                        <Lock size={14} className="shrink-0" />
                        <span>잠금 보호 중</span>
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
                          ? 'text-[#8C8B85] border-[#E4E2DC] cursor-not-allowed'
                          : isSelfLocked
                          ? 'text-[#FFE600] bg-[#000000] border-[#000000] hover:bg-[#DC2626] hover:border-[#DC2626] cursor-pointer'
                          : 'text-[#111111] bg-[#FFFFFF] border-[#E4E2DC] hover:border-[#000000] cursor-pointer'
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
                          <Unlock size={14} />
                          <span>Unlock</span>
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          <span>Lock Spec</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={isLocked}
                      className={`inline-flex items-center justify-center h-10 w-10 rounded-none border border-[#E4E2DC] transition-colors shrink-0 ${
                        isLocked
                          ? 'opacity-35 cursor-not-allowed text-[#8C8B85] bg-[#EFEDE7]'
                          : 'text-[#52524E] bg-[#FFFFFF] hover:text-[#FFE600] hover:bg-[#DC2626] hover:border-[#DC2626] cursor-pointer'
                      }`}
                      title={isLocked ? '잠금 상태에서는 삭제할 수 없습니다' : '규칙 삭제'}
                      aria-label={`Rule ${ruleNumber} 삭제`}
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
                      className="block text-[15px] font-extrabold tracking-[0.08em] text-[#000000] uppercase"
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
                      className={`w-full rounded-none px-4 py-3.5 font-sans placeholder:text-[#8C8B85] outline-none transition-colors border ${
                        largeTextMode ? 'text-[20px]' : 'text-[18px]'
                      } ${
                        isLocked
                          ? 'bg-[#EFEDE7] text-[#52524E] cursor-not-allowed border-[#E4E2DC]'
                          : 'bg-[#FFFFFF] text-[#111111] border-[#E4E2DC] focus:border-[#000000]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`${rule.id}_then`}
                      className="block text-[15px] font-extrabold tracking-[0.08em] text-[#000000] uppercase"
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
                      className={`w-full rounded-none px-4 py-3.5 font-sans placeholder:text-[#8C8B85] outline-none transition-colors border ${
                        largeTextMode ? 'text-[20px]' : 'text-[18px]'
                      } ${
                        isLocked
                          ? 'bg-[#EFEDE7] text-[#52524E] cursor-not-allowed border-[#E4E2DC]'
                          : 'bg-[#FFFFFF] text-[#111111] border-[#E4E2DC] focus:border-[#000000]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`${rule.id}_exception`}
                      className="block text-[15px] font-extrabold tracking-[0.08em] text-[#52524E] uppercase"
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
                      className={`w-full rounded-none px-4 py-3.5 font-sans placeholder:text-[#8C8B85] outline-none transition-colors border ${
                        largeTextMode ? 'text-[20px]' : 'text-[18px]'
                      } ${
                        isLocked
                          ? 'bg-[#EFEDE7] text-[#52524E] cursor-not-allowed border-[#E4E2DC]'
                          : 'bg-[#FFFFFF] text-[#111111] border-[#E4E2DC] focus:border-[#000000]'
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
