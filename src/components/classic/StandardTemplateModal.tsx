import React, { useState } from 'react';
import { 
  FileText, Check, ArrowRight, LayoutTemplate, 
  Smartphone, Monitor, Zap, X, HelpCircle
} from 'lucide-react';
import { 
  STANDARD_PRD_TEMPLATES, 
  StandardPrdTemplate, 
  parseRawIdeaToStandardPlan 
} from '../../lib/standardTemplates';

interface StandardTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: StandardPrdTemplate) => void;
}

export const StandardTemplateModal: React.FC<StandardTemplateModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'aiParse'>('preset');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('saas-web-platform');
  const [rawIdeaInput, setRawIdeaInput] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<StandardPrdTemplate | null>(null);

  if (!isOpen) return null;

  const currentTemplate = STANDARD_PRD_TEMPLATES.find(t => t.id === selectedTemplateId) || STANDARD_PRD_TEMPLATES[0];

  const handleApplyPreset = () => {
    onApplyTemplate(currentTemplate);
    onClose();
  };

  const handleRunSmartParse = () => {
    if (!rawIdeaInput.trim()) return;
    const result = parseRawIdeaToStandardPlan(rawIdeaInput);
    setParsedPreview(result);
  };

  const handleApplySmartParse = () => {
    if (!parsedPreview) return;
    const customTemplate = {
      ...parsedPreview,
      name: rawIdeaInput.slice(0, 30).trim() || parsedPreview.name,
      plan: {
        ...parsedPreview.plan,
        metadata: {
          ...parsedPreview.plan.metadata,
          projectName: rawIdeaInput.slice(0, 30).trim() || parsedPreview.plan.metadata?.projectName || '신규 프로젝트',
          projectOverview: {
            ...parsedPreview.plan.metadata?.projectOverview,
            purpose: rawIdeaInput.trim(),
          } as any
        }
      } as any
    };
    onApplyTemplate(customTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#111827]/35 backdrop-blur-xs select-none">
      <div 
        className="bg-[#FFFFFF] w-full max-w-4xl max-h-[90vh] h-[640px] rounded-2xl border border-[#E5E7EB] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden text-[#111827] font-sans animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center font-bold shrink-0">
              <LayoutTemplate size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-sans font-bold text-[#111827] tracking-tight">
                표준 앱/웹 개발계획서 프리셋
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/60 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('preset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'preset'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB]/50'
            }`}
          >
            <FileText size={14} />
            <span>4대 실무 검증 템플릿 선택</span>
          </button>

          <button
            onClick={() => setActiveTab('aiParse')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'aiParse'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB]/50'
            }`}
          >
            <Zap size={14} />
            <span>내 자유 메모로 표준 기획서 변환</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6 bg-[#FFFFFF]">
          {activeTab === 'preset' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Template Cards */}
              <div className="md:col-span-5 space-y-2.5">
                <span className="text-xs font-mono text-[#6B7280] block mb-1 uppercase tracking-wider">비즈니스 유형 선택</span>
                {STANDARD_PRD_TEMPLATES.map((tmpl) => {
                  const isSelected = tmpl.id === selectedTemplateId;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#EFF6FF] border-[#1E3A8A]/40 ring-2 ring-[#1E3A8A]/15'
                          : 'bg-[#F7F8FA] border-[#E5E7EB] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFFFFF] text-[#1E3A8A] border border-[#1E3A8A]/20 font-semibold">
                          {tmpl.badge}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#6B7280]">
                          {tmpl.platform === 'APP' ? <Smartphone size={12} /> : <Monitor size={12} />}
                          <span>{tmpl.platform}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-sans font-semibold text-[#111827]">{tmpl.name}</h4>
                      <p className="text-xs text-[#4B5563] line-clamp-1 mt-0.5">{tmpl.subtitle}</p>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Template Detail Preview */}
              <div className="md:col-span-7 bg-[#F7F8FA] p-5 rounded-xl border border-[#E5E7EB] flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                    <div>
                      <span className="text-xs font-mono text-[#6B7280] uppercase tracking-wider">기획서 상세 스펙 미리보기</span>
                      <h3 className="text-base font-sans font-bold text-[#111827] mt-0.5">{currentTemplate.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#4B5563]">{currentTemplate.platform} 플랫폼</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-[#111827] mb-1">기획 목적 및 문제 해결</h5>
                    <p className="text-xs text-[#374151] bg-[#FFFFFF] p-3 rounded-lg border border-[#E5E7EB] leading-relaxed font-sans">
                      {currentTemplate.description}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-[#111827] mb-1">타깃 사용자</h5>
                    <p className="text-xs text-[#374151] font-medium pl-1">{currentTemplate.targetUser}</p>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-[#111827] mb-1.5">표준 포함 화면 ({currentTemplate.screens.length})</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentTemplate.screens.map((sc, idx) => (
                        <div key={idx} className="p-2.5 bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#111827]">{sc.name}</span>
                            <span className="text-[10px] font-mono text-[#1E3A8A] font-semibold">{sc.route}</span>
                          </div>
                          <p className="text-[11px] text-[#4B5563] mt-0.5 line-clamp-1">{sc.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-[#111827] mb-1">핵심 기능 명세 (FRD)</h5>
                    <ul className="space-y-1 text-xs text-[#4B5563] pl-1">
                      {currentTemplate.keyFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check size={13} className="text-[#1E3A8A] shrink-0" />
                          <span className="text-[#374151]">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-[#6B7280] font-mono">
                    적용 시 11종 사양서와 프로토타입이 즉시 동기화됩니다.
                  </span>
                  <button
                    onClick={handleApplyPreset}
                    className="px-5 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>이 표준 기획서로 시작하기</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#F7F8FA] p-5 rounded-xl border border-[#E5E7EB] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-sans font-semibold text-[#111827] flex items-center gap-2">
                    <Zap size={15} className="text-[#1E3A8A]" />
                    <span>자유 메모 또는 아이디어 붙여넣기</span>
                  </h4>
                  <span className="text-xs text-[#6B7280] font-mono">단어 몇 개만 적어도 표준 기획서로 자동 구조화</span>
                </div>

                <textarea
                  rows={5}
                  value={rawIdeaInput}
                  onChange={(e) => setRawIdeaInput(e.target.value)}
                  placeholder="웹 애플리케이션 요구사항을 자유롭게 입력하세요. (예: 대용량 데이터 시각화 및 실시간 협업 워크스페이스를 위한 엔터프라이즈 모던 웹 SaaS 플랫폼)"
                  className="w-full p-3.5 text-xs sm:text-sm bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15 leading-relaxed font-sans text-[#111827] placeholder-[#9CA3AF]"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                    <HelpCircle size={14} className="shrink-0" />
                    <span>핵심 키워드(SaaS, 커머스, 어드민, 미디어 등)를 인식하여 적합한 웹 개발 표준 규격으로 자동 매핑합니다.</span>
                  </div>
                  <button
                    onClick={handleRunSmartParse}
                    disabled={!rawIdeaInput.trim()}
                    className="px-4 py-2 rounded-lg bg-[#1E3A8A] text-white disabled:opacity-40 text-xs font-semibold hover:bg-[#172554] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Zap size={14} />
                    <span>표준 기획서 분석 실행</span>
                  </button>
                </div>
              </div>

              {parsedPreview && (
                <div className="bg-[#F7F8FA] p-5 rounded-xl border border-[#E5E7EB] space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#111827]">추천 표준 템플릿 매핑 결과</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1E3A8A] border border-[#1E3A8A]/20 font-semibold">
                      {parsedPreview.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-sans font-semibold text-[#111827]">{parsedPreview.name}</h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed font-sans">{parsedPreview.description}</p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleApplySmartParse}
                      className="px-5 py-2.5 rounded-lg bg-[#1E3A8A] text-white text-xs sm:text-sm font-semibold hover:bg-[#172554] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>이 기획서로 프로젝트 적용하기</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F7F8FA] border-t border-[#E5E7EB] flex items-center justify-between gap-2 text-xs text-[#6B7280] shrink-0 font-mono">
          <span className="truncate">팁: 템플릿을 적용한 후에도 개별 문항과 화면을 언제든지 자유롭게 수정할 수 있습니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#111827] cursor-pointer font-sans text-xs font-medium transition-colors shrink-0"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
