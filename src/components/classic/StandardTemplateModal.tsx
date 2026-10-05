import React, { useState } from 'react';
import { 
  FileText, Sparkles, Check, ArrowRight, LayoutTemplate, 
  Smartphone, Monitor, Zap, X, HelpCircle
} from 'lucide-react';
import { 
  STANDARD_PRD_TEMPLATES, 
  StandardPrdTemplate, 
  parseRawIdeaToStandardPlan 
} from '../../lib/standardTemplates';
import { SitePlan, ProjectEntity, FormInputEntity } from '../../types';

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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('vet-reservation');
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
    // Overwrite project name and purpose if available from raw text
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs select-none">
      <div 
        className="bg-[#FAF7F2] w-full max-w-4xl max-h-[92vh] rounded-3xl border-2 border-[#D5CCBC] shadow-2xl flex flex-col overflow-hidden text-[#231F20] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b-2 border-[#E5DFD3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6B1D42]/10 border border-[#6B1D42]/20 flex items-center justify-center text-[#6B1D42]">
              <LayoutTemplate size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-extrabold text-[#111827]">
                  표준 앱/웹 개발계획서 프리셋
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F7EFF3] text-[#6B1D42] border border-[#6B1D42]/20">
                  실무 PRD 표준
                </span>
              </div>
              <p className="text-xs text-[#57534E] mt-0.5">
                검증된 업계 표준 기획서를 기반으로 설계하여, 에이전트의 환각을 없애고 즉시 구동되는 프로토타입을 만듭니다.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#78716C] hover:text-[#111827] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-white border-b border-[#E5DFD3] flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('preset')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preset'
                ? 'border-[#6B1D42] text-[#6B1D42]'
                : 'border-transparent text-[#78716C] hover:text-[#231F20]'
            }`}
          >
            <FileText size={16} />
            <span>4대 실무 검증 템플릿 선택</span>
          </button>

          <button
            onClick={() => setActiveTab('aiParse')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'aiParse'
                ? 'border-[#6B1D42] text-[#6B1D42]'
                : 'border-transparent text-[#78716C] hover:text-[#231F20]'
            }`}
          >
            <Sparkles size={16} />
            <span>내 자유 메모로 표준 기획서 변환</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'preset' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Template Cards */}
              <div className="md:col-span-5 space-y-2.5">
                <span className="text-xs font-bold text-[#57534E] block mb-1">비즈니스 유형 선택</span>
                {STANDARD_PRD_TEMPLATES.map((tmpl) => {
                  const isSelected = tmpl.id === selectedTemplateId;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-white border-[#6B1D42] shadow-sm ring-2 ring-[#6B1D42]/10'
                          : 'bg-white/70 border-[#E5DFD3] hover:bg-white hover:border-[#D5CCBC]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: tmpl.themeColor }}
                        >
                          {tmpl.badge}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-[#78716C]">
                          {tmpl.platform === 'APP' ? <Smartphone size={12} /> : <Monitor size={12} />}
                          <span>{tmpl.platform}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-[#111827]">{tmpl.name}</h4>
                      <p className="text-xs text-[#57534E] line-clamp-1 mt-0.5">{tmpl.subtitle}</p>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Template Detail Preview */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border-2 border-[#E5DFD3] flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                    <div>
                      <span className="text-xs font-bold font-mono text-[#6B1D42]">기획서 상세 스펙 미리보기</span>
                      <h3 className="text-base font-bold text-[#111827] mt-0.5">{currentTemplate.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: currentTemplate.themeColor }} title="테마 색상" />
                      <span className="text-xs font-mono text-[#57534E]">{currentTemplate.platform} 플랫폼</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[#44403C] mb-1">💡 기획 목적 및 문제 해결</h5>
                    <p className="text-xs text-[#57534E] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DFD3] leading-relaxed">
                      {currentTemplate.description}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[#44403C] mb-1">🎯 타깃 사용자</h5>
                    <p className="text-xs text-[#231F20] font-medium pl-1">{currentTemplate.targetUser}</p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[#44403C] mb-1.5">⚡ 표준 포함 화면 및 라우트 ({currentTemplate.screens.length})</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentTemplate.screens.map((sc, idx) => (
                        <div key={idx} className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD3] text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#111827]">{sc.name}</span>
                            <span className="text-[10px] font-mono text-[#6B1D42]">{sc.route}</span>
                          </div>
                          <p className="text-[11px] text-[#78716C] mt-0.5 line-clamp-1">{sc.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[#44403C] mb-1">✨ 핵심 기능 명세 (FRD)</h5>
                    <ul className="space-y-1 text-xs text-[#57534E] pl-1">
                      {currentTemplate.keyFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check size={14} className="text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-between">
                  <span className="text-xs text-[#78716C]">
                    적용 시 11종 사양서와 프로토타입이 즉시 동기화됩니다.
                  </span>
                  <button
                    onClick={handleApplyPreset}
                    className="px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                    style={{ backgroundColor: currentTemplate.themeColor }}
                  >
                    <span>이 표준 기획서로 시작하기</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-[#E5DFD3] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <Sparkles size={16} className="text-[#6B1D42]" />
                    <span>자유 메모 또는 아이디어 붙여넣기</span>
                  </h4>
                  <span className="text-xs text-[#78716C]">단어 몇 개만 적어도 표준 기획서로 자동 구조화</span>
                </div>

                <textarea
                  rows={5}
                  value={rawIdeaInput}
                  onChange={(e) => setRawIdeaInput(e.target.value)}
                  placeholder="예: 우리 동물병원에서 쓸 예약 장부를 만들고 싶어요. 예약 들어오면 달력에 표시되고, 고객 전화번호랑 강아지 이름 검색해서 지난번에 무슨 접종 했는지 바로 볼 수 있으면 좋겠습니다. 노쇼가 많아서 예약 상태를 대기, 확정, 완료로 관리하고 싶어요."
                  className="w-full p-3.5 text-xs sm:text-sm bg-[#FAF7F2] rounded-xl border border-[#D5CCBC] focus:outline-none focus:ring-2 focus:ring-[#6B1D42]/30 leading-relaxed font-sans"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
                    <HelpCircle size={14} />
                    <span>키워드(예약, 결재, 재고, 견적 등)를 인식하여 가장 적합한 표준 규격으로 자동 매핑합니다.</span>
                  </div>
                  <button
                    onClick={handleRunSmartParse}
                    disabled={!rawIdeaInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#6B1D42] disabled:opacity-40 text-white text-xs font-bold hover:bg-[#842352] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap size={14} />
                    <span>표준 기획서 분석 실행</span>
                  </button>
                </div>
              </div>

              {parsedPreview && (
                <div className="bg-[#FAF7F2] p-5 rounded-2xl border-2 border-[#6B1D42]/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-[#6B1D42]">추천 표준 템플릿 매핑 결과</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: parsedPreview.themeColor }}>
                      {parsedPreview.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#111827]">{parsedPreview.name}</h3>
                  <p className="text-xs text-[#57534E] leading-relaxed">{parsedPreview.description}</p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleApplySmartParse}
                      className="px-5 py-2.5 rounded-xl bg-[#6B1D42] text-white text-xs sm:text-sm font-bold hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>이 기획서로 프로젝트 적용하기</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#FAF7F2] border-t-2 border-[#E5DFD3] flex items-center justify-between text-xs text-[#78716C] shrink-0">
          <span>💡 팁: 템플릿을 적용한 후에도 개별 문항과 화면을 언제든지 자유롭게 수정할 수 있습니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#D5CCBC] bg-white hover:bg-[#EFE9DC] text-[#44403C] font-bold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
