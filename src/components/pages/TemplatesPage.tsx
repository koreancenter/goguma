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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            {STANDARD_PRD_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`w-full p-6 rounded-none border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#000000] text-[#FFFFFF] border-[#000000]'
                      : 'bg-[#F6F5F1] text-[#111111] border-[#E4E2DC] hover:border-[#000000]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={`text-[14px] px-2.5 py-0.5 font-bold uppercase tracking-wider border ${
                        isSelected
                          ? 'border-[#FFE600] text-[#FFE600]'
                          : 'border-[#CBC8BF] text-[#3F3F3C] bg-[#FFFFFF]'
                      }`}
                    >
                      {tmpl.badge}
                    </span>
                    <div className="flex items-center gap-1.5 text-[15px] font-bold opacity-80">
                      {tmpl.platform === 'APP' ? <Smartphone size={15} /> : <Monitor size={15} />}
                      <span>{tmpl.platform}</span>
                    </div>
                  </div>
                  <div className="text-[20px] font-extrabold leading-snug">{tmpl.name}</div>
                  <p className={`text-[17px] mt-1.5 line-clamp-2 leading-relaxed ${isSelected ? 'text-white/80' : 'text-[#52524E]'}`}>
                    {tmpl.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 bg-[#F6F5F1] p-8 sm:p-10 border border-[#E4E2DC] flex flex-col justify-between space-y-8">
            <div className="space-y-7">
              <div className="border-b-2 border-[#000000] pb-5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[15px] font-bold uppercase tracking-wider text-[#52524E]">
                    상세 스펙 미리보기
                  </span>
                  <h2 className="text-[26px] sm:text-[28px] font-extrabold text-[#000000] mt-1">{currentTemplate.name}</h2>
                </div>
                <span className="px-3.5 py-1.5 bg-[#000000] text-[#FFE600] text-[16px] font-bold">
                  {currentTemplate.platform}
                </span>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-[18px] font-extrabold text-[#000000]">기획 목적 및 문제 해결</h3>
                <p className="text-[18px] sm:text-[19px] text-[#2B2B29] bg-[#FFFFFF] p-5 border border-[#E4E2DC] leading-[1.8]">
                  {currentTemplate.description}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[18px] font-extrabold text-[#000000]">타깃 사용자</h3>
                <p className="text-[18px] sm:text-[19px] text-[#3F3F3C] font-medium leading-[1.7]">{currentTemplate.targetUser}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-[18px] font-extrabold text-[#000000]">
                  표준 포함 화면 ({currentTemplate.screens.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {currentTemplate.screens.map((sc, idx) => (
                    <div key={idx} className="p-4 bg-[#FFFFFF] border border-[#E4E2DC] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[17px] font-bold text-[#000000]">{sc.name}</span>
                        <span className="text-[14px] font-mono text-[#52524E]">{sc.route}</span>
                      </div>
                      <p className="text-[16px] text-[#52524E] line-clamp-2 leading-relaxed">{sc.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[18px] font-extrabold text-[#000000]">핵심 기능 명세 (FRD)</h3>
                <ul className="space-y-2.5 text-[18px] text-[#2B2B29]">
                  {currentTemplate.keyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <Check size={17} className="text-[#000000] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E4E2DC] flex flex-wrap items-center justify-between gap-4">
              <span className="text-[17px] text-[#52524E]">
                적용 시 11종 사양서와 프로토타입이 즉시 동기화됩니다.
              </span>
              <button
                type="button"
                onClick={handleApplyPreset}
                className="px-7 py-4 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-[18px] font-bold transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <span>이 표준 기획서로 시작하기</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EditorialSection chapter="자유 메모 자동 구조화">
          <div className="bg-[#F6F5F1] p-8 border border-[#E4E2DC] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[20px] font-extrabold text-[#000000] flex items-center gap-2">
                <Zap size={18} />
                <span>자유 메모 또는 서비스 아이디어 입력</span>
              </h3>
              <span className="text-[17px] text-[#52524E]">핵심 키워드 기반으로 표준 기획서 규격으로 자동 매핑합니다</span>
            </div>

            <textarea
              rows={6}
              value={rawIdeaInput}
              onChange={(e) => setRawIdeaInput(e.target.value)}
              placeholder="웹 애플리케이션 요구사항을 자유롭게 입력하세요. (예: 대용량 데이터 시각화 및 실시간 협업 워크스페이스를 위한 엔터프라이즈 모던 웹 SaaS 플랫폼)"
              className="w-full p-5 text-[19px] bg-[#FFFFFF] rounded-none border border-[#CBC8BF] focus:border-[#000000] outline-none leading-[1.8] text-[#111111]"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunSmartParse}
                disabled={!rawIdeaInput.trim()}
                className="px-6 py-3.5 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] disabled:opacity-40 text-[18px] font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <Zap size={17} />
                <span>표준 기획서 분석 실행</span>
              </button>
            </div>
          </div>

          {parsedPreview && (
            <div className="bg-[#FFFFFF] p-8 border-2 border-[#000000] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-bold text-[#52524E] uppercase tracking-wider">
                  추천 표준 템플릿 매핑 결과
                </span>
                <span className="px-3.5 py-1 bg-[#000000] text-[#FFE600] text-[16px] font-bold">
                  {parsedPreview.badge}
                </span>
              </div>
              <h3 className="text-[24px] font-extrabold text-[#000000]">{parsedPreview.name}</h3>
              <p className="text-[19px] text-[#3F3F3C] leading-[1.8]">{parsedPreview.description}</p>
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplySmartParse}
                  className="px-7 py-4 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-[18px] font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>이 기획서로 프로젝트 적용하기</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
        </EditorialSection>
      )}
    </EditorialPageLayout>
  );
}
