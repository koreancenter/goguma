import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Smartphone, Monitor, Zap } from 'lucide-react';
import {
  STANDARD_PRD_TEMPLATES,
  StandardPrdTemplate,
  parseRawIdeaToStandardPlan,
} from '../../lib/standardTemplates';
import {
  EditorialPageLayout,
  EditorialSection,
} from '../classic/layout/EditorialPageLayout';

interface TemplatesPageProps {
  onApplyTemplate: (template: StandardPrdTemplate) => void;
}

export default function TemplatesPage({ onApplyTemplate }: TemplatesPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'preset' | 'aiParse'>('preset');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('saas-web-platform');
  const [rawIdeaInput, setRawIdeaInput] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<StandardPrdTemplate | null>(null);

  const currentTemplate =
    STANDARD_PRD_TEMPLATES.find(t => t.id === selectedTemplateId) || STANDARD_PRD_TEMPLATES[0];

  const handleApplyPreset = () => {
    onApplyTemplate(currentTemplate);
    navigate('/workspace');
  };

  const handleRunSmartParse = () => {
    if (!rawIdeaInput.trim()) return;
    setParsedPreview(parseRawIdeaToStandardPlan(rawIdeaInput));
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
          projectName:
            rawIdeaInput.slice(0, 30).trim() || parsedPreview.plan.metadata?.projectName || '신규 프로젝트',
          projectOverview: {
            ...parsedPreview.plan.metadata?.projectOverview,
            purpose: rawIdeaInput.trim(),
          } as any,
        },
      } as any,
    };
    onApplyTemplate(customTemplate);
    navigate('/workspace');
  };

  const tabs = [
    { id: 'preset', label: '4대 실무 검증 템플릿 선택', onClick: () => setActiveTab('preset') },
    { id: 'aiParse', label: '자유 메모로 표준 기획서 변환', onClick: () => setActiveTab('aiParse') },
  ];

  return (
    <EditorialPageLayout
      category="STANDARD TEMPLATES"
      title="표준 기획서 템플릿"
      subtitle="검증된 산업별 아키텍처 템플릿을 선택하거나 자유 메모를 표준 개발 사양서 구조로 즉시 변환합니다."
      tabs={tabs}
      activeTabId={activeTab}
      maxWidthClass="max-w-6xl"
    >
      {activeTab === 'preset' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-2.5">
            {STANDARD_PRD_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`w-full p-4 rounded-none border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#000000] text-[#FFFFFF] border-[#000000]'
                      : 'bg-[#F6F5F1] text-[#111111] border-[#E4E2DC] hover:border-[#000000]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider border ${
                        isSelected
                          ? 'border-[#FFE600] text-[#FFE600]'
                          : 'border-[#CBC8BF] text-[#3F3F3C] bg-[#FFFFFF]'
                      }`}
                    >
                      {tmpl.badge}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] opacity-80">
                      {tmpl.platform === 'APP' ? <Smartphone size={12} /> : <Monitor size={12} />}
                      <span>{tmpl.platform}</span>
                    </div>
                  </div>
                  <div className="text-sm font-extrabold">{tmpl.name}</div>
                  <p className={`text-xs mt-1 line-clamp-1 ${isSelected ? 'text-white/75' : 'text-[#52524E]'}`}>
                    {tmpl.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 bg-[#F6F5F1] p-6 sm:p-8 border border-[#E4E2DC] flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="border-b border-[#000000] pb-4 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#52524E]">
                    상세 스펙 미리보기
                  </span>
                  <h2 className="text-xl font-extrabold text-[#000000] mt-0.5">{currentTemplate.name}</h2>
                </div>
                <span className="px-2.5 py-1 bg-[#000000] text-[#FFE600] text-xs font-bold">
                  {currentTemplate.platform}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-[#000000] mb-1.5">기획 목적 및 문제 해결</h3>
                <p className="text-xs sm:text-[13px] text-[#2B2B29] bg-[#FFFFFF] p-4 border border-[#E4E2DC] leading-relaxed">
                  {currentTemplate.description}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-[#000000] mb-1.5">타깃 사용자</h3>
                <p className="text-xs sm:text-[13px] text-[#3F3F3C] font-medium">{currentTemplate.targetUser}</p>
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-[#000000] mb-2">
                  표준 포함 화면 ({currentTemplate.screens.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentTemplate.screens.map((sc, idx) => (
                    <div key={idx} className="p-3 bg-[#FFFFFF] border border-[#E4E2DC] text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#000000]">{sc.name}</span>
                        <span className="text-[10px] font-mono text-[#52524E]">{sc.route}</span>
                      </div>
                      <p className="text-[11px] text-[#52524E] mt-1 line-clamp-1">{sc.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-[#000000] mb-2">핵심 기능 명세 (FRD)</h3>
                <ul className="space-y-1.5 text-xs text-[#2B2B29]">
                  {currentTemplate.keyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check size={13} className="text-[#000000] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E4E2DC] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#52524E]">
                적용 시 11종 사양서와 프로토타입이 즉시 동기화됩니다.
              </span>
              <button
                type="button"
                onClick={handleApplyPreset}
                className="px-6 py-3 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>이 표준 기획서로 시작하기</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EditorialSection chapter="자유 메모 자동 구조화">
          <div className="bg-[#F6F5F1] p-6 border border-[#E4E2DC] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#000000] flex items-center gap-2">
                <Zap size={15} />
                <span>자유 메모 또는 서비스 아이디어 입력</span>
              </h3>
              <span className="text-xs text-[#52524E]">핵심 키워드 기반으로 표준 기획서 규격으로 자동 매핑합니다</span>
            </div>

            <textarea
              rows={6}
              value={rawIdeaInput}
              onChange={(e) => setRawIdeaInput(e.target.value)}
              placeholder="웹 애플리케이션 요구사항을 자유롭게 입력하세요. (예: 대용량 데이터 시각화 및 실시간 협업 워크스페이스를 위한 엔터프라이즈 모던 웹 SaaS 플랫폼)"
              className="w-full p-4 text-xs sm:text-sm bg-[#FFFFFF] rounded-none border border-[#CBC8BF] focus:border-[#000000] outline-none leading-relaxed text-[#111111]"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunSmartParse}
                disabled={!rawIdeaInput.trim()}
                className="px-5 py-2.5 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] disabled:opacity-40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <Zap size={14} />
                <span>표준 기획서 분석 실행</span>
              </button>
            </div>
          </div>

          {parsedPreview && (
            <div className="bg-[#FFFFFF] p-6 border-2 border-[#000000] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#52524E] uppercase tracking-wider">
                  추천 표준 템플릿 매핑 결과
                </span>
                <span className="px-2.5 py-0.5 bg-[#000000] text-[#FFE600] text-xs font-bold">
                  {parsedPreview.badge}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#000000]">{parsedPreview.name}</h3>
              <p className="text-xs sm:text-sm text-[#3F3F3C] leading-relaxed">{parsedPreview.description}</p>
              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplySmartParse}
                  className="px-6 py-3 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>이 기획서로 프로젝트 적용하기</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </EditorialSection>
      )}
    </EditorialPageLayout>
  );
}
