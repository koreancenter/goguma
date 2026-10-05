import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Code2, ShieldCheck, Heart, Sparkles, Copy, Check, ExternalLink, Terminal } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface OpenSourceLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'license' | 'community';
}

export default function OpenSourceLicenseModal({
  isOpen,
  onClose,
  defaultTab = 'license'
}: OpenSourceLicenseModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'license' | 'community'>(defaultTab);
  const [copied, setCopied] = useState(false);

  const mitLicenseText = `MIT License

Copyright (c) 2024-2026 GOGUMA Contributors & Community

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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[85vh] bg-white rounded-3xl shadow-2xl z-[9999] overflow-hidden flex flex-col border border-slate-100"
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-goguma/10 rounded-2xl flex items-center justify-center text-goguma">
                  <Code2 size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    {language === 'ko' ? '오픈소스 라이선스 및 커뮤니티 규약' : 'Open Source License & Community Terms'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {language === 'ko' ? '자유 소프트웨어 및 프라이버시 우선 아키텍처' : 'Free Software & Privacy-First Architecture'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 px-6 sm:px-8 pt-2">
              <button
                onClick={() => setActiveTab('license')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'license'
                    ? 'border-goguma text-goguma'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Terminal size={14} />
                <span>MIT License</span>
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'community'
                    ? 'border-goguma text-goguma'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Heart size={14} />
                <span>{language === 'ko' ? '커뮤니티 및 로컬 우선 정책' : 'Community & Local-First Principles'}</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 custom-scrollbar flex-1">
              {activeTab === 'license' ? (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-xs text-emerald-950 font-medium leading-relaxed">
                      {language === 'ko' ? (
                        <>
                          <strong className="font-bold">100% 무료 및 오픈 소프트웨어:</strong> 고구마(GOGUMA)는 누구나 자유롭게 아키텍처 기획, 시스템 설계, 상업적·개인적 프로젝트에 비용 청구 없이 이용할 수 있습니다.
                        </>
                      ) : (
                        <>
                          <strong className="font-bold">100% Free & Open Source:</strong> GOGUMA is free software provided under the standard MIT License. Anyone is free to design, plan, and deploy architectures for commercial or personal use without fees.
                        </>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">LICENSE.md (MIT)</span>
                      <button
                        onClick={copyLicense}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-goguma transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-100"
                      >
                        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copied ? (language === 'ko' ? '복사 완료' : 'Copied') : (language === 'ko' ? '라이선스 복사' : 'Copy License')}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto selection:bg-goguma selection:text-white border border-slate-800">
                      {mitLicenseText}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Sparkles size={14} className="text-goguma" />
                      {language === 'ko' ? '1. 로컬 우선 & 제로 원격 락인 (Local-First Guarantee)' : '1. Local-First & Zero Lock-in Guarantee'}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed pl-5 font-medium">
                      {language === 'ko'
                        ? '사용자가 생성한 아키텍처 다이어그램, 프로젝트 구조, 명세서 데이터는 외부 중앙 서버로 전송되지 않고 브라우저 로컬 저장소(IndexedDB / LocalStorage)에 보관됩니다. 데이터 소유권은 100% 사용자에게 있으며 언제든 표준 JSON으로 내보낼 수 있습니다.'
                        : 'All architecture diagrams, project specifications, and visual site structures created by users are saved directly in your browser\'s local storage. You maintain 100% ownership of your work and can export to standard JSON at any time.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Sparkles size={14} className="text-goguma" />
                      {language === 'ko' ? '2. 무과금 AI 추론의 자유 (BYOK & Local Ollama / WebLLM)' : '2. Freedom of AI Inference (BYOK & Local WebLLM / Ollama)'}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed pl-5 font-medium">
                      {language === 'ko'
                        ? '중앙집중식 구독료 결제 대신 사용자가 보유한 구글 제미나이 무료 API 키(BYOK), WebGPU 가속 기반 브라우저 내장 WebLLM, 또는 오프라인 로컬 Ollama를 직접 선택하여 완벽히 독립적으로 AI 아키텍트 기능을 사용할 수 있습니다.'
                        : 'Instead of centralized subscription fees, GOGUMA supports Bring Your Own Key (BYOK) for Google Gemini, in-browser WebGPU WebLLM, and fully offline local Ollama instances for autonomous AI assistance.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Sparkles size={14} className="text-goguma" />
                      {language === 'ko' ? '3. 커뮤니티 기여 및 협력' : '3. Open Community & Contributions'}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed pl-5 font-medium">
                      {language === 'ko'
                        ? '고구마 프로젝트는 글로벌 개발자 및 아키텍트 커뮤니티의 오픈소스 기여를 환영합니다. 코드 검토, 템플릿 추가, 새로운 로컬 모델 연동 제안은 GitHub 저장소 및 개발자 토론 채널을 통해 언제든 공유하실 수 있습니다.'
                        : 'GOGUMA is open for community contributions. Feel free to inspect, suggest custom architecture templates, report issues, and enhance local inference workflows on GitHub.'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 font-medium">
                    {language === 'ko'
                      ? '본 소프트웨어는 영리 목적의 구독 결제, 유료 티어 강제, 사용자 활동 추적 트래커를 일체 탑재하지 않습니다.'
                      : 'This software contains zero subscription gates, zero forced paywalls, and zero behavioral advertising trackers.'}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">
                GOGUMA • Free & Open Architecture
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
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
