import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Code2, Copy, Check, Terminal, Heart, ShieldCheck, Sparkles, FileText, Layers } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface OpenSourceLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'license' | 'community';
}

const GOGUMA_OPEN_SOURCE_STACK = [
  { name: 'React & React DOM', version: '19.x', license: 'MIT', roleKo: 'UI 컴포넌트 및 상태 렌더링 엔진', roleEn: 'UI component & rendering engine' },
  { name: 'TypeScript', version: '5.8.x', license: 'Apache-2.0', roleKo: '정적 타입 안전성 및 스키마 모델링', roleEn: 'Static type safety & schema modeling' },
  { name: 'Vite', version: '6.x', license: 'MIT', roleKo: '초고속 모듈 번들러 및 개발 서버', roleEn: 'Fast build tooling & dev server' },
  { name: 'Tailwind CSS', version: '4.1.x', license: 'MIT', roleKo: '에디토리얼 유틸리티 스타일링 시스템', roleEn: 'Utility-first styling system' },
  { name: 'TipTap & ProseMirror', version: '3.x', license: 'MIT', roleKo: '리치 텍스트 기획서 에디터 코어', roleEn: 'Rich-text specification editor core' },
  { name: 'CodeMirror', version: '4.x / 6.x', license: 'MIT', roleKo: 'HTML/JS 코드 및 사양서 뷰어', roleEn: 'HTML/JS code editor & viewer' },
  { name: 'Lucide React', version: '0.546.x', license: 'ISC', roleKo: '미니멀 벡터 아이콘 라이브러리', roleEn: 'Minimalist vector icon library' },
  { name: 'D3.js & Recharts', version: '7.x / 3.x', license: 'ISC / MIT', roleKo: '정보구조 및 데이터 시각화 그래프', roleEn: 'Architecture & chart visualization' },
  { name: 'dnd-kit', version: '6.x / 10.x', license: 'MIT', roleKo: '접근성 기반 드래그 앤 드롭 정렬', roleEn: 'Accessible drag-and-drop sorting' },
  { name: 'Motion', version: '12.x', license: 'MIT', roleKo: '인터페이스 전환 모션 엔진', roleEn: 'UI transition motion engine' },
  { name: 'react-markdown & remark-gfm', version: '10.x / 4.x', license: 'MIT', roleKo: '마크다운 및 GFM 사양서 파서', roleEn: 'Markdown & GFM spec renderer' },
  { name: 'react-router-dom', version: '7.x', license: 'MIT', roleKo: '클라이언트 사이드 라우팅', roleEn: 'Client-side routing' },
  { name: 'JSZip & js-beautify', version: '3.x / 1.x', license: 'MIT', roleKo: '11종 사양서 번들 ZIP 패키징 및 코드 포맷터', roleEn: 'Spec bundle ZIP export & formatter' },
  { name: 'Express', version: '4.x', license: 'MIT', roleKo: '로컬/프록시 API 런타임 어댑터', roleEn: 'Local server & proxy adapter' },
  { name: '@google/genai', version: '1.x', license: 'Apache-2.0', roleKo: 'Google Gemini API 추론 SDK (선택 BYOK)', roleEn: 'Google Gemini inference SDK (BYOK)' },
];

export default function OpenSourceLicenseModal({
  isOpen,
  onClose,
  defaultTab = 'license',
}: OpenSourceLicenseModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'terms' | 'license' | 'community'>(defaultTab);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const mitLicenseText = `MIT License

Copyright (c) 2026 Korean Center Global Network · GOGUMA App Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

  const copyLicense = () => {
    navigator.clipboard.writeText(mitLicenseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#111827]/40 backdrop-blur-xs z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] h-[640px] bg-[#FFFFFF] rounded-none shadow-[0_24px_48px_-12px_rgba(15,23,42,0.22)] z-[9999] overflow-hidden flex flex-col border border-[#000000] text-[#111827] font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/15 flex items-center justify-between bg-[#000000] text-[#FFFFFF] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1A1A18] border border-white/20 text-[#FFE600] rounded-none flex items-center justify-center font-bold shrink-0">
                  <Code2 size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold tracking-tight">
                    {activeTab === 'terms'
                      ? (language === 'ko' ? '이용약관' : 'Terms of Service')
                      : activeTab === 'community'
                      ? (language === 'ko' ? '커뮤니티 이용 규약' : 'Community Guidelines')
                      : (language === 'ko' ? '오픈소스 라이선스 (MIT) 및 사용 스택' : 'Open Source License (MIT) & Stack')}
                  </h2>
                  <p className="text-[11px] text-white/65 font-sans mt-0.5">
                    GOGUMA · Open Architecture & Local-First Software
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-none text-white/80 hover:text-[#FFE600] transition-colors cursor-pointer"
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="px-6 py-2.5 border-b border-[#E4E2DC] bg-[#F6F5F1] flex items-center gap-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('terms')}
                className={`px-3 py-1.5 rounded-none text-xs font-bold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'terms'
                    ? 'bg-[#000000] text-[#FFE600]'
                    : 'text-[#3F3F3C] hover:text-[#000000] hover:bg-[#E4E2DC]/60'
                }`}
              >
                <FileText size={13} />
                <span>{language === 'ko' ? '이용약관' : 'Terms of Service'}</span>
              </button>
              <button
                onClick={() => setActiveTab('license')}
                className={`px-3 py-1.5 rounded-none text-xs font-bold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'license'
                    ? 'bg-[#000000] text-[#FFE600]'
                    : 'text-[#3F3F3C] hover:text-[#000000] hover:bg-[#E4E2DC]/60'
                }`}
              >
                <Terminal size={13} />
                <span>{language === 'ko' ? '오픈소스 라이선스 (MIT)' : 'Open Source License (MIT)'}</span>
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-3 py-1.5 rounded-none text-xs font-bold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'community'
                    ? 'bg-[#000000] text-[#FFE600]'
                    : 'text-[#3F3F3C] hover:text-[#000000] hover:bg-[#E4E2DC]/60'
                }`}
              >
                <Heart size={13} />
                <span>{language === 'ko' ? '커뮤니티 이용 규약' : 'Community Guidelines'}</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scroll space-y-5 flex-1 bg-[#FFFFFF]">
              {activeTab === 'terms' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#F6F5F1] border border-[#000000]/20 flex items-start gap-3">
                    <ShieldCheck className="text-[#000000] shrink-0 mt-0.5" size={16} />
                    <div className="text-xs text-[#2B2B29] leading-relaxed">
                      {language === 'ko' ? (
                        <>
                          <strong className="font-bold text-[#000000]">제1조 (목적 및 자유 소프트웨어 선언):</strong> 본 이용약관은 한국센터글로벌네트워크 지식관리실 고구마앱팀이 제공하는 로컬 우선(Local-First) PRD 및 사양서 스튜디오 GOGUMA의 이용 조건을 규정합니다. 본 소프트웨어는 MIT 라이선스에 따라 개인적·상업적 목적 모두 무료로 이용할 수 있습니다.
                        </>
                      ) : (
                        <>
                          <strong className="font-bold text-[#000000]">1. Purpose & Free Software:</strong> GOGUMA is provided by Korean Center Global Network (Goguma App Team) under the MIT License for both personal and commercial specification authoring free of charge.
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-[#FFFFFF] border border-[#E4E2DC] space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#000000]">
                      {language === 'ko' ? '제2조 (로컬 데이터 주권 및 보관)' : '2. Local Data Sovereignty'}
                    </h3>
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {language === 'ko'
                        ? '사용자가 워크스페이스에서 작성한 모든 기획서, 사이트맵, 아키텍처 명세 및 로컬 프로필 정보는 중앙 원격 데이터베이스가 아닌 사용자 브라우저의 IndexedDB와 LocalStorage에 저장됩니다. 사용자는 언제든 JSON 및 ZIP 번들로 산출물을 백업하거나 삭제할 수 있습니다.'
                        : 'All PRDs, sitemaps, specifications, and local profiles remain strictly inside your browser IndexedDB and LocalStorage. You maintain full ownership and export control.'}
                    </p>
                  </div>

                  <div className="p-4 bg-[#FFFFFF] border border-[#E4E2DC] space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#000000]">
                      {language === 'ko' ? '제3조 (독립 AI 추론 및 사용자 책임)' : '3. Independent AI Inference & Liability'}
                    </h3>
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {language === 'ko'
                        ? 'AI 보조 기능은 사용자가 선택한 Gemini(BYOK), 로컬 Ollama, 또는 WebLLM(WebGPU) 환경으로 동작합니다. 본 소프트웨어는 MIT 라이선스에 따라 명시적·묵시적 보증 없이 "있는 그대로(AS-IS)" 제공됩니다.'
                        : 'AI assistance runs via your selected endpoint (Gemini BYOK, local Ollama, or WebGPU WebLLM). As specified in the MIT License, the software is provided "AS-IS" without warranty.'}
                    </p>
                  </div>
                </div>
              ) : activeTab === 'license' ? (
                <div className="space-y-5">
                  <div className="p-4 bg-[#F6F5F1] border border-[#000000]/20 flex items-start gap-3">
                    <ShieldCheck className="text-[#000000] shrink-0 mt-0.5" size={16} />
                    <div className="text-xs text-[#2B2B29] font-sans leading-relaxed">
                      {language === 'ko' ? (
                        <>
                          <strong className="font-bold text-[#000000]">100% 무료 오픈소스 (MIT 라이선스):</strong> 고구마(GOGUMA)는 누구나 자유롭게 아키텍처 기획, 시스템 설계, 상업적·개인적 프로젝트에 비용 청구 없이 이용할 수 있습니다.
                        </>
                      ) : (
                        <>
                          <strong className="font-bold text-[#000000]">100% Free & Open Source (MIT):</strong> GOGUMA is free software provided under the standard MIT License for commercial and personal use.
                        </>
                      )}
                    </div>
                  </div>

                  {/* Open Source Tech Stack Used in GOGUMA */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
                        <Layers size={14} />
                        <span>
                          {language === 'ko'
                            ? '고구마앱(GOGUMA) 사용 오픈소스 스택'
                            : 'Open Source Technologies Used in GOGUMA'}
                        </span>
                      </h3>
                      <span className="text-[11px] font-semibold text-[#52524E]">
                        {GOGUMA_OPEN_SOURCE_STACK.length} Packages
                      </span>
                    </div>
                    <div className="border border-[#E4E2DC] divide-y divide-[#E4E2DC]">
                      {GOGUMA_OPEN_SOURCE_STACK.map((pkg) => (
                        <div
                          key={pkg.name}
                          className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-[#FFFFFF] hover:bg-[#F6F5F1] transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-[#000000]">{pkg.name}</span>
                            <span className="text-[11px] font-mono text-[#6B7280]">{pkg.version}</span>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <span className="text-[11px] text-[#4B5563]">
                              {language === 'ko' ? pkg.roleKo : pkg.roleEn}
                            </span>
                            <span className="px-2 py-0.5 bg-[#000000] text-[#FFFFFF] text-[10px] font-bold tracking-wider shrink-0">
                              {pkg.license}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MIT License Official Text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[11px] font-bold font-sans text-[#4B5563] uppercase tracking-wider">
                        LICENSE.md (MIT)
                      </span>
                      <button
                        onClick={copyLicense}
                        className="flex items-center gap-1.5 text-xs font-bold font-sans text-[#000000] hover:bg-[#000000] hover:text-[#FFE600] border border-[#CBC8BF] transition-colors px-2.5 py-1 rounded-none cursor-pointer"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copied ? (language === 'ko' ? '복사 완료' : 'Copied') : (language === 'ko' ? '라이선스 복사' : 'Copy License')}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-[#F6F5F1] text-[#111827] rounded-none text-[11px] font-mono leading-relaxed overflow-x-auto border border-[#E4E2DC]">
                      {mitLicenseText}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#F6F5F1] border border-[#E4E2DC] space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#000000] flex items-center gap-2">
                      <Sparkles size={13} />
                      <span>{language === 'ko' ? '1. 로컬 우선 & 제로 원격 락인 (Local-First Guarantee)' : '1. Local-First & Zero Lock-in Guarantee'}</span>
                    </h3>
                    <p className="text-xs text-[#4B5563] leading-relaxed font-sans">
                      {language === 'ko'
                        ? '사용자가 생성한 아키텍처 다이어그램, 프로젝트 구조, 명세서 데이터는 외부 중앙 서버로 전송되지 않고 브라우저 로컬 저장소(IndexedDB / LocalStorage)에 보관됩니다. 데이터 소유권은 100% 사용자에게 있으며 언제든 표준 JSON으로 내보낼 수 있습니다.'
                        : 'All architecture diagrams, project specifications, and visual site structures created by users are saved directly in your browser\'s local storage. You maintain 100% ownership of your work and can export to standard JSON at any time.'}
                    </p>
                  </div>

                  <div className="p-4 bg-[#F6F5F1] border border-[#E4E2DC] space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#000000] flex items-center gap-2">
                      <Sparkles size={13} />
                      <span>{language === 'ko' ? '2. 무과금 AI 추론의 자유 (BYOK & Local Ollama)' : '2. Freedom of AI Inference (BYOK & Local Ollama)'}</span>
                    </h3>
                    <p className="text-xs text-[#4B5563] leading-relaxed font-sans">
                      {language === 'ko'
                        ? '중앙집중식 구독료 결제 대신 사용자가 보유한 구글 제미나이 무료 API 키(BYOK) 또는 오프라인 로컬 Ollama를 직접 선택하여 완벽히 독립적으로 AI 아키텍트 기능을 사용할 수 있습니다.'
                        : 'Instead of centralized subscription fees, GOGUMA supports Bring Your Own Key (BYOK) for Google Gemini and fully offline local Ollama instances for autonomous AI assistance.'}
                    </p>
                  </div>

                  <div className="p-4 bg-[#F6F5F1] border border-[#E4E2DC] space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#000000] flex items-center gap-2">
                      <Sparkles size={13} />
                      <span>{language === 'ko' ? '3. 커뮤니티 기여 및 협력 규약' : '3. Open Community & Contributions'}</span>
                    </h3>
                    <p className="text-xs text-[#4B5563] leading-relaxed font-sans">
                      {language === 'ko'
                        ? '고구마 프로젝트는 상호 존중과 개방형 지식 공유를 원칙으로 합니다. 코드 기여, 템플릿 제안, 이슈 제보는 공식 GitHub 저장소(github.com/koreancenter/goguma.git)를 통해 누구나 참여할 수 있습니다.'
                        : 'GOGUMA welcomes open, respectful collaboration. Contribute code, templates, and feedback via GitHub (github.com/koreancenter/goguma.git).'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#E4E2DC] bg-[#F6F5F1] flex items-center justify-between shrink-0">
              <span className="text-[11px] font-sans text-[#52524E]">
                GOGUMA • MIT License & Open Architecture
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-xs font-bold rounded-none transition-colors cursor-pointer"
              >
                {language === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
