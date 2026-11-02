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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs select-none">
      <div 
        className="bg-[#111116] w-full max-w-4xl h-[640px] rounded-[2px] border border-[#262632] shadow-2xl flex flex-col overflow-hidden text-[#F5F3ED] font-sans animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0E0E12] border-b border-[#23232A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-[#C5A880] text-[#0A0A0C] flex items-center justify-center font-bold shadow-xs shrink-0">
              <LayoutTemplate size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-sans font-bold text-[#F5F3ED] uppercase tracking-wide">
                  표준 앱/웹 개발계획서 프리셋
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 font-semibold">
                  PRD STANDARD
                </span>
              </div>
              <p className="text-[11px] text-[#8E8B82] font-mono mt-0.5">
                검증된 업계 표준 기획서를 기반으로 설계하여 즉시 구동되는 웹 프로토타입을 만듭니다.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-[2px] text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#1A1A22] transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 bg-[#0E0E12] border-b border-[#23232A] flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('preset')}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preset'
                ? 'bg-[#C5A880] text-[#0A0A0C] shadow-xs'
                : 'text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#1A1A22]'
            }`}
          >
            <FileText size={14} />
            <span>4대 실무 검증 템플릿 선택</span>
          </button>

          <button
            onClick={() => setActiveTab('aiParse')}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'aiParse'
                ? 'bg-[#C5A880] text-[#0A0A0C] shadow-xs'
                : 'text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#1A1A22]'
            }`}
          >
            <Zap size={14} />
            <span>내 자유 메모로 표준 기획서 변환</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6 bg-[#111116]">
          {activeTab === 'preset' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Template Cards */}
              <div className="md:col-span-5 space-y-2.5">
                <span className="text-xs font-mono text-[#8E8B82] block mb-1 uppercase tracking-wider">비즈니스 유형 선택</span>
                {STANDARD_PRD_TEMPLATES.map((tmpl) => {
                  const isSelected = tmpl.id === selectedTemplateId;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-3.5 rounded-[2px] border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#181822] border-[#C5A880] ring-1 ring-[#C5A880]/30 shadow-xs'
                          : 'bg-[#141418] border-[#23232A] hover:bg-[#181820]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 font-semibold">
                          {tmpl.badge}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#8E8B82]">
                          {tmpl.platform === 'APP' ? <Smartphone size={12} /> : <Monitor size={12} />}
                          <span>{tmpl.platform}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-sans font-semibold text-[#F5F3ED]">{tmpl.name}</h4>
                      <p className="text-xs text-[#8E8B82] line-clamp-1 mt-0.5">{tmpl.subtitle}</p>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Template Detail Preview */}
              <div className="md:col-span-7 bg-[#141418] p-5 rounded-[2px] border border-[#23232A] flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#23232A] pb-3">
                    <div>
                      <span className="text-xs font-mono text-[#8E8B82] uppercase tracking-wider">기획서 상세 스펙 미리보기</span>
                      <h3 className="text-base font-sans font-bold text-[#F5F3ED] mt-0.5">{currentTemplate.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#8E8B82]">{currentTemplate.platform} 플랫폼</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-[#F5F3ED] mb-1">기획 목적 및 문제 해결</h5>
                    <p className="text-xs text-[#8E8B82] bg-[#111116] p-3 rounded-[2px] border border-[#23232A] leading-relaxed font-sans">
                      {currentTemplate.description}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-[#F5F3ED] mb-1">타깃 사용자</h5>
                    <p className="text-xs text-[#F5F3ED] font-medium pl-1">{currentTemplate.targetUser}</p>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-[#F5F3ED] mb-1.5">표준 포함 화면 ({currentTemplate.screens.length})</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentTemplate.screens.map((sc, idx) => (
                        <div key={idx} className="p-2.5 bg-[#111116] rounded-[2px] border border-[#23232A] text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#F5F3ED]">{sc.name}</span>
                            <span className="text-[10px] font-mono text-[#C5A880]">{sc.route}</span>
                          </div>
                          <p className="text-[11px] text-[#8E8B82] mt-0.5 line-clamp-1">{sc.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-[#F5F3ED] mb-1">핵심 기능 명세 (FRD)</h5>
                    <ul className="space-y-1 text-xs text-[#8E8B82] pl-1">
                      {currentTemplate.keyFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check size={13} className="text-[#C5A880] shrink-0" />
                          <span className="text-[#F5F3ED]">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#23232A] flex items-center justify-between">
                  <span className="text-xs text-[#8E8B82] font-mono">
                    적용 시 11종 사양서와 프로토타입이 즉시 동기화됩니다.
                  </span>
                  <button
                    onClick={handleApplyPreset}
                    className="px-5 py-2 rounded-[2px] bg-[#C5A880] hover:bg-[#D4B992] text-[#0A0A0C] text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>이 표준 기획서로 시작하기</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#141418] p-5 rounded-[2px] border border-[#23232A] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-sans font-semibold text-[#F5F3ED] flex items-center gap-2">
                    <Zap size={15} className="text-[#C5A880]" />
                    <span>자유 메모 또는 아이디어 붙여넣기</span>
                  </h4>
                  <span className="text-xs text-[#8E8B82] font-mono">단어 몇 개만 적어도 표준 기획서로 자동 구조화</span>
                </div>

                <textarea
                  rows={5}
                  value={rawIdeaInput}
                  onChange={(e) => setRawIdeaInput(e.target.value)}
                  placeholder="웹 애플리케이션 요구사항을 자유롭게 입력하세요. (예: 대용량 데이터 시각화 및 실시간 협업 워크스페이스를 위한 엔터프라이즈 모던 웹 SaaS 플랫폼)"
                  className="w-full p-3.5 text-xs sm:text-sm bg-[#111116] rounded-[2px] border border-[#23232A] focus:outline-none focus:border-[#C5A880] leading-relaxed font-sans text-[#F5F3ED] placeholder-[#706E66]"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#8E8B82]">
                    <HelpCircle size={14} />
                    <span>핵심 키워드(SaaS, 커머스, 어드민, 미디어 등)를 인식하여 적합한 웹 개발 표준 규격으로 자동 매핑합니다.</span>
                  </div>
                  <button
                    onClick={handleRunSmartParse}
                    disabled={!rawIdeaInput.trim()}
                    className="px-4 py-2 rounded-[2px] bg-[#C5A880] text-[#0A0A0C] disabled:opacity-30 text-xs font-semibold hover:bg-[#D4B992] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Zap size={14} />
                    <span>표준 기획서 분석 실행</span>
                  </button>
                </div>
              </div>

              {parsedPreview && (
                <div className="bg-[#141418] p-5 rounded-[2px] border border-[#23232A] space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#F5F3ED]">추천 표준 템플릿 매핑 결과</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-[2px] bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 font-semibold">
                      {parsedPreview.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-sans font-semibold text-[#F5F3ED]">{parsedPreview.name}</h3>
                  <p className="text-xs text-[#8E8B82] leading-relaxed font-sans">{parsedPreview.description}</p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleApplySmartParse}
                      className="px-5 py-2.5 rounded-[2px] bg-[#C5A880] text-[#0A0A0C] text-xs sm:text-sm font-semibold hover:bg-[#D4B992] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
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
        <div className="px-6 py-3.5 bg-[#0E0E12] border-t border-[#23232A] flex items-center justify-between text-xs text-[#8E8B82] shrink-0 font-mono">
          <span>팁: 템플릿을 적용한 후에도 개별 문항과 화면을 언제든지 자유롭게 수정할 수 있습니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] border border-[#23232A] bg-[#141418] hover:bg-[#1A1A22] text-[#F5F3ED] cursor-pointer font-sans text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
