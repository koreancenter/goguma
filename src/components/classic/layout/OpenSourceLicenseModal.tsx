import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Code2, Copy, Check, Terminal, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface OpenSourceLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'license' | 'community';
}

export default function OpenSourceLicenseModal({ isOpen, onClose, defaultTab = 'license' }: OpenSourceLicenseModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'license' | 'community'>(defaultTab);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const mitLicenseText = `MIT License

Copyright (c) 2026 GOGUMA Architecture Team

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
            className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-[580px] bg-[#111116] rounded-[2px] shadow-2xl z-[9999] overflow-hidden flex flex-col border border-[#23232A] text-[#F5F3ED] font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#23232A] flex items-center justify-between bg-[#0E0E12] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#141418] border border-[#23232A] text-[#C5A880] rounded-[2px] flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Code2 size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-[#F5F3ED] uppercase tracking-wide">
                    {language === 'ko' ? '오픈소스 라이선스 및 커뮤니티 규약' : 'Open Source License & Community Terms'}
                  </h2>
                  <p className="text-[11px] text-[#8E8B82] font-mono mt-0.5">
                    {language === 'ko' ? '자유 소프트웨어 및 프라이버시 우선 아키텍처' : 'Free Software & Privacy-First Architecture'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-[2px] text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#141418] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="px-6 py-2 border-b border-[#23232A] bg-[#0E0E12] flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('license')}
                className={`px-3 py-1.5 rounded-[2px] text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'license'
                    ? 'bg-[#C5A880] text-[#0A0A0C] font-semibold shadow-xs'
                    : 'text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#141418]'
                }`}
              >
                <Terminal size={13} />
                <span>MIT License</span>
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-3 py-1.5 rounded-[2px] text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'community'
                    ? 'bg-[#C5A880] text-[#0A0A0C] font-semibold shadow-xs'
                    : 'text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#141418]'
                }`}
              >
                <Heart size={13} />
                <span>{language === 'ko' ? '커뮤니티 및 로컬 우선 정책' : 'Community & Local-First Principles'}</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scroll space-y-4 flex-1 bg-[#111116]">
              {activeTab === 'license' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#141418] border border-[#23232A] rounded-[2px] flex items-start gap-3">
                    <ShieldCheck className="text-[#C5A880] shrink-0 mt-0.5" size={16} />
                    <div className="text-xs text-[#B8B5AC] font-sans leading-relaxed">
                      {language === 'ko' ? (
                        <>
                          <strong className="font-semibold text-[#F5F3ED]">100% 무료 및 오픈 소프트웨어:</strong> 고구마(GOGUMA)는 누구나 자유롭게 아키텍처 기획, 시스템 설계, 상업적·개인적 프로젝트에 비용 청구 없이 이용할 수 있습니다.
                        </>
                      ) : (
                        <>
                          <strong className="font-semibold text-[#F5F3ED]">100% Free & Open Source:</strong> GOGUMA is free software provided under the standard MIT License. Anyone is free to design, plan, and deploy architectures for commercial or personal use without fees.
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[10px] font-mono text-[#8E8B82] uppercase tracking-wider">LICENSE.md (MIT)</span>
                      <button
                        onClick={copyLicense}
                        className="flex items-center gap-1.5 text-xs font-mono text-[#B8B5AC] hover:text-[#F5F3ED] transition-colors px-2 py-1 rounded-[2px] hover:bg-[#141418] cursor-pointer"
                      >
                        {copied ? <Check size={12} className="text-[#C5A880]" /> : <Copy size={12} />}
                        <span>{copied ? (language === 'ko' ? '복사 완료' : 'Copied') : (language === 'ko' ? '라이선스 복사' : 'Copy License')}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-[#0E0E12] text-[#B8B5AC] rounded-[2px] text-[11px] font-mono leading-relaxed overflow-x-auto border border-[#23232A]">
                      {mitLicenseText}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#141418] border border-[#23232A] rounded-[2px] space-y-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F3ED] flex items-center gap-2">
                      <Sparkles size={13} className="text-[#C5A880]" />
                      <span>{language === 'ko' ? '1. 로컬 우선 & 제로 원격 락인 (Local-First Guarantee)' : '1. Local-First & Zero Lock-in Guarantee'}</span>
                    </h3>
                    <p className="text-xs text-[#8E8B82] leading-relaxed font-sans">
                      {language === 'ko'
                        ? '사용자가 생성한 아키텍처 다이어그램, 프로젝트 구조, 명세서 데이터는 외부 중앙 서버로 전송되지 않고 브라우저 로컬 저장소(IndexedDB / LocalStorage)에 보관됩니다. 데이터 소유권은 100% 사용자에게 있으며 언제든 표준 JSON으로 내보낼 수 있습니다.'
                        : 'All architecture diagrams, project specifications, and visual site structures created by users are saved directly in your browser\'s local storage. You maintain 100% ownership of your work and can export to standard JSON at any time.'}
                    </p>
                  </div>

                  <div className="p-4 bg-[#141418] border border-[#23232A] rounded-[2px] space-y-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F3ED] flex items-center gap-2">
                      <Sparkles size={13} className="text-[#C5A880]" />
                      <span>{language === 'ko' ? '2. 무과금 AI 추론의 자유 (BYOK & Local Ollama)' : '2. Freedom of AI Inference (BYOK & Local Ollama)'}</span>
                    </h3>
                    <p className="text-xs text-[#8E8B82] leading-relaxed font-sans">
                      {language === 'ko'
                        ? '중앙집중식 구독료 결제 대신 사용자가 보유한 구글 제미나이 무료 API 키(BYOK) 또는 오프라인 로컬 Ollama를 직접 선택하여 완벽히 독립적으로 AI 아키텍트 기능을 사용할 수 있습니다.'
                        : 'Instead of centralized subscription fees, GOGUMA supports Bring Your Own Key (BYOK) for Google Gemini and fully offline local Ollama instances for autonomous AI assistance.'}
                    </p>
                  </div>

                  <div className="p-4 bg-[#141418] border border-[#23232A] rounded-[2px] space-y-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F3ED] flex items-center gap-2">
                      <Sparkles size={13} className="text-[#C5A880]" />
                      <span>{language === 'ko' ? '3. 커뮤니티 기여 및 협력' : '3. Open Community & Contributions'}</span>
                    </h3>
                    <p className="text-xs text-[#8E8B82] leading-relaxed font-sans">
                      {language === 'ko'
                        ? '고구마 프로젝트는 글로벌 개발자 및 아키텍트 커뮤니티의 오픈소스 기여를 환영합니다. 코드 검토, 템플릿 추가, 새로운 로컬 모델 연동 제안은 GitHub 저장소 및 개발자 토론 채널을 통해 언제든 공유하실 수 있습니다.'
                        : 'GOGUMA is open for community contributions. Feel free to inspect, suggest custom architecture templates, report issues, and enhance local inference workflows on GitHub.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#0E0E12] border border-[#23232A] rounded-[2px] text-xs text-[#8E8B82] font-sans">
                    {language === 'ko'
                      ? '본 소프트웨어는 영리 목적의 구독 결제, 유료 티어 강제, 사용자 활동 추적 트래커를 일체 탑재하지 않습니다.'
                      : 'This software contains zero subscription gates, zero forced paywalls, and zero behavioral advertising trackers.'}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#23232A] bg-[#0E0E12] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-mono text-[#8E8B82]">
                GOGUMA • Free & Open Architecture
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-[#141418] hover:bg-[#1A1A22] border border-[#23232A] text-[#F5F3ED] text-xs font-medium rounded-[2px] transition-colors cursor-pointer"
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
