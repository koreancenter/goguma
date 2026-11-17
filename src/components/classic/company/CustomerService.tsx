import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../layout/EditorialPageLayout';

export default function CustomerService() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const helpTabs: EditorialTabItem[] = [
    { id: 'support', label: '도움말 및 가이드', to: '/support' },
    { id: 'dev-notes', label: '개발자 노트', to: '/dev-notes' },
    { id: 'community', label: '오픈 아키텍처', to: '/community' },
    { id: 'contact', label: '문의 및 피드백', to: '/contact' },
  ];

  const guides = [
    {
      step: 'GUIDE 01',
      title: language === 'ko' ? 'Gemini 무료 API 키 등록 (BYOK)' : 'BYOK Gemini API Key',
      description:
        language === 'ko'
          ? 'Google AI Studio에서 발급받은 개인 무료 API 키를 등록하여 클라우드 제한 없이 빠른 속도로 기획안을 생성합니다.'
          : 'Connect your personal Google AI Studio API key for high-speed cloud generation with zero SaaS subscriptions.',
      actionText: language === 'ko' ? '키 설정 열기' : 'Configure API Key',
      action: () => navigate('/settings?tab=engine'),
    },
    {
      step: 'GUIDE 02',
      title: language === 'ko' ? 'WebLLM 브라우저 로컬 AI' : 'WebLLM In-Browser AI',
      description:
        language === 'ko'
          ? '서버 설치 없이 WebGPU 가속을 통해 브라우저 안에서 Llama-3 / Gemma-2 로컬 모델을 즉시 구동합니다.'
          : 'Run Llama-3 or Gemma-2 locally inside your browser via WebGPU with zero installations.',
      actionText: language === 'ko' ? '모델 설정 열기' : 'Launch WebLLM',
      action: () => navigate('/settings?tab=engine'),
    },
    {
      step: 'GUIDE 03',
      title: language === 'ko' ? 'Ollama 오프라인 로컬 서버' : 'Ollama Offline Server',
      description:
        language === 'ko'
          ? '내 PC(localhost:11434)에서 실행 중인 Ollama의 오픈소스 LLM을 연동하여 완전한 오프라인 환경을 구축합니다.'
          : 'Connect to your local Ollama instance (localhost:11434) for 100% private, offline generation.',
      actionText: language === 'ko' ? 'Ollama 연결 설정' : 'Connect Ollama',
      action: () => navigate('/settings?tab=engine'),
    },
    {
      step: 'GUIDE 04',
      title: language === 'ko' ? '로컬 데이터 백업 및 복원' : 'Data Backup & Restore',
      description:
        language === 'ko'
          ? '모든 기획 데이터는 브라우저 로컬에 저장됩니다. JSON 파일로 백업하고 언제든 다른 기기로 복원할 수 있습니다.'
          : 'All architecture projects stay on your device. Export to JSON or restore anytime with one click.',
      actionText: language === 'ko' ? '백업 관리 열기' : 'Open Backup Hub',
      action: () => navigate('/backup'),
    },
  ];

  return (
    <EditorialPageLayout
      category="SUPPORT · LOCAL DATA & AI GUIDE"
      title={language === 'ko' ? '도움말 및 로컬 데이터 가이드' : 'Help & Local Data Guide'}
      subtitle={
        language === 'ko'
          ? 'GOGUMA는 개인에게 무료로 배포되는 공개 소프트웨어입니다. 사용자 기기 중심의 안전한 로컬 기획 환경을 지원합니다.'
          : 'GOGUMA is free, privacy-first software for individuals. Plan, design, and export with zero subscription lock-in.'
      }
      tabs={helpTabs}
      activeTabId="support"
    >
      <EditorialSection chapter={language === 'ko' ? '제1장 핵심 연동 및 실행 가이드' : '01 · Integration & Runtime Guides'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {guides.map((guide) => (
            <div
              key={guide.step}
              className="p-8 sm:p-10 bg-[#FFFFFF] border border-[#000000] rounded-none flex flex-col justify-between gap-8"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-4">
                  <span className="text-[16px] sm:text-[17px] font-extrabold uppercase tracking-[0.14em] text-[#52524E]">
                    {guide.step}
                  </span>
                </div>
                <h3 className="text-[22px] sm:text-[24px] font-extrabold text-[#000000] tracking-tight leading-snug">
                  {guide.title}
                </h3>
                <p className="text-[18px] sm:text-[19px] text-[#3F3F3C] leading-[1.75]">
                  {guide.description}
                </p>
              </div>

              <button
                type="button"
                onClick={guide.action}
                className="w-full py-4 px-6 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none text-[17px] sm:text-[18px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{guide.actionText}</span>
                <ArrowRight size={17} />
              </button>
            </div>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection chapter={language === 'ko' ? '제2장 자주 묻는 질문 (FAQ)' : '02 · Frequently Asked Questions'}>
        <div className="divide-y divide-[#E4E2DC] border-t border-b border-[#000000]">
          <div className="py-8 space-y-3">
            <h3 className="text-[21px] sm:text-[23px] font-extrabold text-[#000000]">
              Q. {language === 'ko' ? '내 기획안 데이터는 어디에 저장되나요?' : 'Where is my project data stored?'}
            </h3>
            <p className="text-[19px] sm:text-[20px] text-[#3F3F3C] leading-[1.8]">
              {language === 'ko'
                ? '모든 기획 데이터(사이트맵, 아키텍처, 프롬프트 등)는 브라우저의 로컬 저장소(LocalStorage / IndexedDB)에 100% 저장됩니다. 외부 서버로 자동 전송되지 않으므로 브라우저 캐시를 지우기 전 백업 파일(JSON)을 내보내 두세요.'
                : 'All your architecture blueprints, sitemaps, and extracted prompts are stored 100% inside your browser localStorage and IndexedDB. No data is sent to external servers.'}
            </p>
          </div>

          <div className="py-8 space-y-3">
            <h3 className="text-[21px] sm:text-[23px] font-extrabold text-[#000000]">
              Q. {language === 'ko' ? 'Gemini API 키가 안전한가요?' : 'Is my Gemini API key secure?'}
            </h3>
            <p className="text-[19px] sm:text-[20px] text-[#3F3F3C] leading-[1.8]">
              {language === 'ko'
                ? '입력하신 개인 API 키는 귀하의 로컬 브라우저에만 저장되며, AI 요청 시 Google의 공식 Gemini 엔드포인트로만 전송됩니다. 제3자 서버에 수집되거나 공유되지 않습니다.'
                : 'Your API key is saved exclusively in your local browser sandbox and transmitted only directly to Google official endpoints. It is never logged or stored remotely.'}
            </p>
          </div>

          <div className="py-8 space-y-3">
            <h3 className="text-[21px] sm:text-[23px] font-extrabold text-[#000000]">
              Q. {language === 'ko' ? '인터넷 연결 없이도 작동하나요?' : 'Can I use this completely offline?'}
            </h3>
            <p className="text-[19px] sm:text-[20px] text-[#3F3F3C] leading-[1.8]">
              {language === 'ko'
                ? '네. AI 엔진 설정에서 Ollama를 선택하고 로컬 PC의 LLM(Llama 3, DeepSeek 등)과 연동하거나 WebLLM 모델을 캐싱하면 비행기 모드나 완전한 폐쇄망에서도 모든 기능을 사용할 수 있습니다.'
                : 'Yes. Select Ollama or pre-cache a WebLLM model, and you can build web architectures with zero internet connection.'}
            </p>
          </div>
        </div>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
