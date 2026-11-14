import React from 'react';
import { Plus, Lock, Unlock, Trash2, ShieldCheck } from 'lucide-react';
import { DomainBusinessRule } from '../../types';

export interface DomainRulesSectionProps {
  rules: DomainBusinessRule[];
  onChange: (rules: DomainBusinessRule[]) => void;
  largeTextMode?: boolean;
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
}) => {
  const handleAddRule = () => {
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
    onChange(
      rules.map((rule) => {
        if (rule.id !== id || rule.isLocked) return rule;
        return { ...rule, [field]: value };
      })
    );
  };

  const handleToggleLock = (id: string) => {
    onChange(
      rules.map((rule) =>
        rule.id === id ? { ...rule, isLocked: !rule.isLocked } : rule
      )
    );
  };

  const handleDeleteRule = (id: string) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2
              className={`font-sans font-semibold text-[#111827] tracking-[-0.015em] ${
                largeTextMode ? 'text-xl' : 'text-[18px]'
              }`}
            >
              Domain Rules &amp; Constraints
            </h2>
            {rules.length > 0 && (
              <span className="font-mono text-xs tabular-nums text-[#6B7280]">
                {String(rules.length).padStart(2, '0')}
              </span>
            )}
          </div>
          <p
            className={`text-[#4B5563] font-sans leading-relaxed ${
              largeTextMode ? 'text-sm sm:text-base' : 'text-xs sm:text-[13px]'
            }`}
          >
            조건(WHEN) · 기대 동작(THEN) · 예외(EXCEPT WHEN) 규약은 3-Tier AI 생성 및 11종 사양서에 결정론적 마크다운 제약 블록으로 자동 반영됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRule}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-lg bg-[#EFF6FF] hover:bg-[#1E3A8A] text-[#1E3A8A] hover:text-[#FFFFFF] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus size={14} className="shrink-0" />
          <span>+ Add Rule</span>
        </button>
      </div>

      {/* Empty State vs Rule Cards */}
      {rules.length === 0 ? (
        <div className="bg-[#F7F8FA] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
              <ShieldCheck size={15} className="shrink-0" />
              <span>구조화된 비즈니스 규칙이 아직 없습니다</span>
            </div>
            <p className="text-xs sm:text-[13px] text-[#4B5563] leading-[1.65]">
              중복 예약 방지, 권한 예외, 상태 전이 제한 등 반드시 지켜야 할 도메인 불변 규칙을 추가해 AI 환각을 차단하세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddRule}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[38px] rounded-lg bg-[#FFFFFF] hover:bg-[#EFF6FF] text-[#111827] hover:text-[#1E3A8A] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <Plus size={14} className="text-[#1E3A8A]" />
            <span>+ Add Rule</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule, index) => {
            const ruleNumber = String(index + 1).padStart(2, '0');
            const isLocked = Boolean(rule.isLocked);

            return (
              <div
                key={rule.id}
                className={`rounded-xl p-5 sm:p-6 space-y-4 transition-colors ${
                  isLocked ? 'bg-[#F1F5F9]/80' : 'bg-[#F7F8FA]'
                }`}
              >
                {/* Card Header Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-semibold tabular-nums text-[#1E3A8A]">
                      Rule {ruleNumber}
                    </span>
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#1E3A8A]">
                        <Lock size={11} className="shrink-0" />
                        <span>Locked Invariant</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleLock(rule.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        isLocked
                          ? 'bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#DBEAFE]'
                          : 'bg-[#FFFFFF]/80 text-[#4B5563] hover:text-[#111827] hover:bg-[#FFFFFF]'
                      }`}
                      title={isLocked ? '규칙 잠금 해제' : '규칙 잠금 (수정/삭제 보호)'}
                      aria-label={isLocked ? `Rule ${ruleNumber} 잠금 해제` : `Rule ${ruleNumber} 잠금`}
                    >
                      {isLocked ? (
                        <>
                          <Lock size={12} />
                          <span>잠금됨</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={12} />
                          <span>잠금</span>
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
                      className="block text-[11px] font-mono font-semibold tracking-wider text-[#1E3A8A] uppercase"
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
                      className={`w-full rounded-lg px-4 py-3 font-sans text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all ${
                        largeTextMode ? 'text-base' : 'text-sm'
                      } ${
                        isLocked
                          ? 'bg-[#FFFFFF]/60 text-[#4B5563] cursor-not-allowed'
                          : 'bg-[#FFFFFF] focus:ring-2 focus:ring-[#1E3A8A]/15'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor={`${rule.id}_then`}
                      className="block text-[11px] font-mono font-semibold tracking-wider text-[#111827] uppercase"
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
                      className={`w-full rounded-lg px-4 py-3 font-sans text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all ${
                        largeTextMode ? 'text-base' : 'text-sm'
                      } ${
                        isLocked
                          ? 'bg-[#FFFFFF]/60 text-[#4B5563] cursor-not-allowed'
                          : 'bg-[#FFFFFF] focus:ring-2 focus:ring-[#1E3A8A]/15'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor={`${rule.id}_exception`}
                      className="block text-[11px] font-mono font-semibold tracking-wider text-[#4B5563] uppercase"
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
                      className={`w-full rounded-lg px-4 py-3 font-sans text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all ${
                        largeTextMode ? 'text-base' : 'text-sm'
                      } ${
                        isLocked
                          ? 'bg-[#FFFFFF]/60 text-[#4B5563] cursor-not-allowed'
                          : 'bg-[#FFFFFF] focus:ring-2 focus:ring-[#1E3A8A]/15'
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
